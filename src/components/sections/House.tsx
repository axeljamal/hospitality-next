'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Room, Story, Venue, WalkPace, WalkStep, WalkWho } from '@/venues/types';
import { useSite } from '../SiteContext';
import { Photo } from '../Photo';
import { store } from '@/lib/store';
import { useHydrated } from '@/lib/hooks';
import { distanceAndBearing } from '@/lib/geo';
import { fmtShort, numberWord, ordinalWord } from '@/lib/dates';
import { buildRoute, stepText, stepWhen, walkDates, type WalkChoice } from '@/lib/walk';

const sKey = (r: number, i: number) => `${r}:${i}`;

/** Interactive tour: floor plan, zoomable photo with numbered stories, guided walk, and the walk planner. */
export function House() {
  const { venue, reduced, toast } = useSite();
  const rooms = venue.tour.rooms;
  const total = useMemo(() => rooms.reduce((a, r) => a + r.stories.length, 0), [rooms]);

  const [room, setRoom] = useState(0);
  const [hs, setHs] = useState(-1);
  const [zoomed, setZoomed] = useState(false);
  const [seenState, setSeen] = useState<Set<string> | null>(null);
  const [walking, setWalking] = useState(false);
  const [walkLabel, setWalkLabel] = useState(venue.tour.walkButton);
  const focusTab = useRef(false);
  const seenKey = `${venue.slug}-tour`;

  // Stories found on an earlier visit, kept on the device.
  const hydrated = useHydrated();
  const savedSeen = useMemo(() => {
    if (!hydrated) return new Set<string>();
    try {
      const saved = JSON.parse(store.get(seenKey) || '[]');
      return new Set<string>(Array.isArray(saved) ? saved.filter((x) => typeof x === 'string') : []);
    } catch {
      return new Set<string>();
    }
  }, [hydrated, seenKey]);
  const seen = seenState ?? savedSeen;

  useEffect(() => {
    if (focusTab.current) {
      document.getElementById(`roomTab${room}`)?.focus();
      focusTab.current = false;
    }
  }, [room]);

  const stopWalk = useCallback(
    (allSeen?: boolean) => {
      if (!walking) return;
      setWalking(false);
      setWalkLabel(allSeen ? 'Walk again' : 'Resume the guided walk');
    },
    [walking],
  );

  const show = useCallback(
    (r: number, i: number) => {
      setRoom(r);
      setHs(i);
      setZoomed(true);
      const k = sKey(r, i);
      if (seen.has(k)) return;
      const next = new Set(seen);
      next.add(k);
      setSeen(next);
      store.set(seenKey, JSON.stringify([...next]));
      if (next.size === total) toast(`All ${total} stories found. The ${ordinalWord(total + 1)} is below.`);
    },
    [seen, seenKey, toast, total],
  );

  const pickRoom = (r: number, focus = false) => {
    stopWalk(seen.size >= total);
    focusTab.current = focus;
    setRoom(r);
    setHs(-1);
    setZoomed(false);
  };

  const step = useCallback(
    (d: number) => {
      let r = room;
      let i = hs + d;
      if (i >= rooms[r].stories.length) {
        r = (r + 1) % rooms.length;
        i = 0;
      }
      if (i < 0) {
        r = (r - 1 + rooms.length) % rooms.length;
        i = rooms[r].stories.length - 1;
      }
      show(r, i);
    },
    [room, hs, rooms, show],
  );

  // Guided walk: one story every 7 s (9 s with reduced motion), stops at the last story or when the tab is hidden.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  const atEnd = room === rooms.length - 1 && hs === rooms[room].stories.length - 1;
  const atEndRef = useRef(atEnd);
  useEffect(() => {
    atEndRef.current = atEnd;
  });
  useEffect(() => {
    if (!walking) return;
    const t = setInterval(() => {
      if (atEndRef.current) {
        setWalking(false);
        setWalkLabel('Walk again');
        return;
      }
      stepRef.current(1);
    }, reduced ? 9000 : 7000);
    const vis = () => document.hidden && stopWalk();
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [walking, reduced, stopWalk]);

  const toggleWalk = () => {
    if (walking) return stopWalk(seen.size >= total);
    if (atEnd) {
      show(0, 0);
    } else if (hs < 0) show(room, 0);
    setWalking(true);
    setWalkLabel('Pause the walk');
  };

  const onPlanKeys = (e: KeyboardEvent) => {
    let n: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (room + 1) % rooms.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (room - 1 + rooms.length) % rooms.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = rooms.length - 1;
    if (n !== null) {
      e.preventDefault();
      pickRoom(n, true);
    }
  };

  // Swipe between rooms on touch screens.
  const x0 = useRef<number | null>(null);

  const r = rooms[room];
  const found = (ri: number) => rooms[ri].stories.filter((_, j) => seen.has(sKey(ri, j))).length;
  const n = seen.size;
  const pct = Math.round((100 * Math.min(n, total)) / total);

  return (
    <section id="house" className="band" aria-labelledby="houseH">
      <div className="wrap">
        <div className="tour-head">
          <div>
            <p className="eyebrow">{venue.tour.eyebrow}</p>
            <h2 id="houseH">{venue.tour.title}</h2>
          </div>
          <button className="btn sm" type="button" aria-pressed={walking} onClick={toggleWalk}>
            {walkLabel}
          </button>
        </div>

        <WalkPlanner
          onStop={(ri, si) => {
            stopWalk(seen.size >= total);
            show(ri, si);
          }}
        />

        <div className="plan" role="tablist" aria-label="Floor plan, choose a room" onKeyDown={onPlanKeys}>
          {venue.tour.floors.map((f) => {
            const list = rooms.map((x, i) => [x, i] as const).filter(([x]) => x.floor === f.id);
            if (!list.length) return null;
            return (
              <div key={f.id} className={`floor${f.label ? '' : ' floor-long'}`} style={{ ['--n' as string]: list.length }}>
                {f.label && (
                  <small className="floor-l" aria-hidden="true">
                    {f.label}
                  </small>
                )}
                {list.map(([x, i]) => (
                  <RoomTab key={x.id} room={x} index={i} selected={i === room} found={found(i)} onClick={() => pickRoom(i)} />
                ))}
              </div>
            );
          })}
        </div>

        <div className="tour" id="tourPanel" role="tabpanel" aria-labelledby={`roomTab${room}`}>
          <div
            className="tour-main"
            onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (x0.current === null) return;
              const dx = e.changedTouches[0].clientX - x0.current;
              x0.current = null;
              if (Math.abs(dx) > 60) pickRoom((room + (dx < 0 ? 1 : -1) + rooms.length) % rooms.length);
            }}
          >
            <div
              className="tour-stage"
              style={{
                ['--z' as string]: zoomed && hs >= 0 ? 1.35 : 1,
                ['--ox' as string]: hs >= 0 ? `${r.stories[hs].x}%` : '50%',
                ['--oy' as string]: hs >= 0 ? `${r.stories[hs].y}%` : '50%',
              }}
              onClick={() => zoomed && setZoomed(false)}
            >
              <Photo venue={venue} refd={r.photo} fill sizes="(max-width: 860px) 100vw, 640px" />
              {r.stories.map((s, i) => {
                const isSeen = seen.has(sKey(room, i));
                return (
                  <button
                    key={i}
                    type="button"
                    className={`hs${isSeen ? ' seen' : ''}`}
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    aria-label={`Story ${i + 1}: ${s.title}${isSeen ? ' (found)' : ''}`}
                    aria-current={i === hs}
                    onClick={(e) => {
                      e.stopPropagation();
                      stopWalk(seen.size >= total);
                      show(room, i);
                    }}
                  >
                    <span aria-hidden="true">{i + 1}</span>
                  </button>
                );
              })}
            </div>
            <span className="tour-cap" aria-hidden="true">
              {r.name} · {r.stories.length} stories
            </span>
            {zoomed && hs >= 0 && (
              <button className="btn sm ghost reset" type="button" onClick={() => setZoomed(false)}>
                Reset view
              </button>
            )}
          </div>
          <div className="tour-side">
            <StoryCard
              venue={venue}
              room={r}
              roomIndex={room}
              hs={hs}
              seen={seen}
              onPick={(i) => {
                stopWalk(seen.size >= total);
                show(room, i);
              }}
              onStep={(d) => {
                stopWalk(seen.size >= total);
                step(d);
              }}
            />
          </div>
        </div>

        <div className="tour-progress">
          <div className="bar" role="progressbar" aria-labelledby="tourProg" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(n, total)}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className="small muted" id="tourProg">
            {n >= total
              ? `All ${total} stories found.`
              : `${n} of ${total} stories found across ${numberWord(rooms.length)} rooms. ${n ? `Keep going for the ${ordinalWord(total + 1)}.` : `Find them all to unlock a ${ordinalWord(total + 1)}.`}`}
          </p>
        </div>
        {n >= total && (
          <div className="bonus">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20V6l8-3 8 3v14M4 12h16M9 20v-5h6v5" />
            </svg>
            <div>
              <p className="eyebrow">The {ordinalWord(total + 1)} story</p>
              <h3>{venue.tour.bonus.title}</h3>
              <p style={{ marginTop: 6 }}>{venue.tour.bonus.text}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RoomTab({ room, index, selected, found, onClick }: { room: Room; index: number; selected: boolean; found: number; onClick: () => void }) {
  const count = (
    <span className="found">
      {found}
      <span className="lng"> of {room.stories.length} stories</span>
      <span className="shr">/{room.stories.length}</span>
    </span>
  );
  return (
    <button role="tab" type="button" id={`roomTab${index}`} className={room.long ? 'long' : ''} aria-selected={selected} aria-controls="tourPanel" tabIndex={selected ? 0 : -1} onClick={onClick}>
      {room.long ? (
        <>
          <span>
            {room.name} <small style={{ marginLeft: 6 }}>{room.plan}</small>
          </span>
          {count}
        </>
      ) : (
        <>
          <small>{room.plan}</small>
          <span>
            {room.name}
            {room.highlight && (
              <>
                {' '}
                <em className="star" aria-label="highlight">
                  ★
                </em>
              </>
            )}
          </span>
          {count}
          {room.door && <i className="door" aria-hidden="true" />}
        </>
      )}
    </button>
  );
}

function Compass({ bearing }: { bearing: number }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill="var(--card)" stroke="var(--line-strong)" />
      <text x="22" y="9" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="var(--mono)">
        N
      </text>
      <g transform={`rotate(${bearing.toFixed(1)} 22 22)`}>
        <path d="M22 7l4 15-4 3-4-3z" fill="var(--c-direct)" />
        <path d="M22 37l-4-15 4-3 4 3z" fill="var(--line-strong)" />
      </g>
      <circle cx="22" cy="22" r="2" fill="var(--ink)" />
    </svg>
  );
}

function StoryMeta({ venue, story }: { venue: Venue; story: Story }) {
  if (!story.from) {
    return (
      <div className="story-meta">
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="6" y="10" width="32" height="24" rx="3" fill="var(--card)" stroke="var(--line-strong)" />
          <path d="M6 20h32M22 10v24" stroke="var(--line-strong)" />
        </svg>
        <div>
          <b>Part of the house</b>Been here all along.
        </div>
      </div>
    );
  }
  const g = distanceAndBearing(venue.geo, story.from);
  return (
    <div className="story-meta">
      <Compass bearing={g.bearing} />
      <div>
        <b>{story.from.place}</b>
        {g.km > 20 ? `${g.km.toLocaleString('en-GB')} km, ${g.dir} of here` : 'From this coast'}
      </div>
    </div>
  );
}

function StoryCard({ venue, room, roomIndex, hs, seen, onPick, onStep }: { venue: Venue; room: Room; roomIndex: number; hs: number; seen: Set<string>; onPick: (i: number) => void; onStep: (d: number) => void }) {
  const s = hs >= 0 ? room.stories[hs] : null;
  return (
    <div className="card" aria-live="polite">
      {s ? (
        <>
          <p className="eyebrow">
            {room.name} · story {hs + 1} of {room.stories.length}
          </p>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <StoryMeta venue={venue} story={s} />
          <p className="story-try">
            <b>Try this.</b> {s.tip}
          </p>
          <div className="story-nav">
            <button className="btn ghost sm" type="button" onClick={() => onStep(-1)}>
              ‹ Previous
            </button>
            <button className="btn ghost sm" type="button" onClick={() => onStep(1)}>
              Next story ›
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="eyebrow">{room.name}</p>
          <h3>{room.intro}</h3>
          <p className="muted small">Tap a numbered dot on the photo, pick a story below, or start the guided walk.</p>
        </>
      )}
      <ul className="hslist">
        {room.stories.map((x, i) => {
          const isSeen = seen.has(sKey(roomIndex, i));
          return (
            <li key={i}>
              <button type="button" className={isSeen ? 'seen' : ''} aria-current={i === hs} onClick={() => onPick(i)}>
                <b aria-hidden="true">{i + 1}</b>
                {x.title}
                {isSeen && (
                  <span className="tick" aria-label="found">
                    ✓
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** "Your stay, walked before you book": a route through the house for this party, then the first dates that fit. */
function WalkPlanner({ onStop }: { onStop: (room: number, story: number) => void }) {
  const { venue, engine, money, reduced, loadStay } = useSite();
  const w = venue.walk;
  const rooms = venue.tour.rooms;
  const [who, setWho] = useState<WalkWho>(w.defaults.who);
  const [pace, setPace] = useState<WalkPace>(w.defaults.pace);
  const [purpose, setPurpose] = useState(w.defaults.purpose);
  const [dog, setDog] = useState(false);
  const [route, setRoute] = useState<{ steps: WalkStep[]; choice: WalkChoice } | null>(null);
  const [i, setI] = useState(0);

  const roomIndex = (id: string) => rooms.findIndex((x) => x.id === id);
  const storyTitle = (s: WalkStep) => rooms[roomIndex(s.room)]?.stories[s.story]?.title ?? '';

  const go = (k: number, rt = route) => {
    if (!rt) return;
    setI(k);
    const s = rt.steps[k];
    if (s) onStop(roomIndex(s.room), s.story);
  };

  const start = () => {
    const choice = { who, pace, purpose, dog };
    const rt = { steps: buildRoute(w, choice), choice };
    setRoute(rt);
    go(0, rt);
    requestAnimationFrame(() => document.querySelector('.tour-main')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }));
  };

  const Chips = <T extends string>({ id, label, options, value, set }: { id: string; label: string; options: { id: T; label: string }[]; value: T; set: (v: T) => void }) => (
    <div className="wq">
      <span className="lbl" id={id}>
        {label}
      </span>
      <div className="wchips" role="group" aria-labelledby={id}>
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={o.id === value} onClick={() => set(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  const steps = route?.steps ?? [];
  const isDates = route !== null && i === steps.length;
  const cur = route && !isDates ? steps[i] : null;
  const dates = isDates && engine && route ? walkDates(w, engine, route.choice) : null;
  const q = dates && engine ? engine.quoteRange(dates[0], dates[1]) : null;
  let text = '';
  if (cur && route) {
    const t = storyTitle(cur);
    const raw = stepText(w, cur, route.choice);
    text = raw.startsWith(`${t}.`) ? raw.slice(t.length + 2) : raw;
  }

  return (
    <div className="card walk">
      <div>
        <p className="eyebrow">{w.eyebrow}</p>
        <h3 style={{ margin: '4px 0 0' }}>{w.title}</h3>
      </div>
      <div className="row2">
        {Chips({ id: 'wqWho', label: 'Who is coming', options: w.who, value: who, set: setWho })}
        <label className="small check" style={{ alignItems: 'center', paddingBottom: 6 }}>
          <input type="checkbox" checked={dog} onChange={(e) => setDog(e.target.checked)} /> With a dog
        </label>
      </div>
      <div className="row2">
        {Chips({ id: 'wqPace', label: 'Your pace', options: w.pace, value: pace, set: setPace })}
        {Chips({ id: 'wqFor', label: 'Here for', options: w.purposes, value: purpose, set: setPurpose })}
      </div>
      <div>
        <button className="btn accent" type="button" onClick={start}>
          {route ? 'Walk it again' : 'Walk it'}
        </button>
      </div>
      {route && (
        <div className="walk-route">
          <div aria-live="polite">
            <p className="eyebrow">{isDates ? 'Last stop · your dates' : `Stop ${i + 1} of ${steps.length + 1}`}</p>
            <h4>{isDates ? 'Dates that fit this walk' : `${storyTitle(cur!)} · ${stepWhen(w, cur!, route.choice)}`}</h4>
            {text && <p style={{ margin: '6px 0 0' }}>{text}</p>}
          </div>
          <div className="walk-nav">
            <button className="btn ghost sm" type="button" disabled={i === 0} onClick={() => go(i - 1)}>
              ‹ Previous stop
            </button>
            <button className="btn sm" type="button" onClick={() => go(isDates ? 0 : i + 1)}>
              {isDates ? 'Back to the start' : i === steps.length - 1 ? 'Your dates ›' : 'Next stop ›'}
            </button>
            <span className="small muted">Each stop opens on the photo below. Use the arrows or pick a stop.</span>
          </div>
          <ol className="walk-stops">
            {steps.map((s, k) => (
              <li key={k}>
                <button type="button" aria-current={k === i} onClick={() => go(k)}>
                  <small>{stepWhen(w, s, route.choice)}</small>
                  {storyTitle(s)}
                </button>
              </li>
            ))}
            <li>
              <button type="button" aria-current={isDates} onClick={() => go(steps.length)}>
                <small>Then</small>Your dates
              </button>
            </li>
          </ol>
          {isDates && (
            <div className="walk-dates">
              {!dates || !q ? (
                <p>No free stay matches in the next year. Try a different pace, or pick dates in the calendar below.</p>
              ) : (
                <>
                  <p className="eyebrow">First free stay that fits</p>
                  <p>
                    <b className="big">
                      {fmtShort(dates[0])} to {fmtShort(dates[1])}
                    </b>
                    <br />
                    <span className="small muted">
                      {q.nights} night{q.nights > 1 ? 's' : ''}
                      {q.pct ? ` · ${q.pct}% off applied` : ''} · {money(q.sum)} all-in, about {money(Math.round(q.sum * venue.pricing.otaMarkup))} on Airbnb
                    </span>
                  </p>
                  <div className="walk-nav">
                    <button
                      className="btn accent sm"
                      type="button"
                      onClick={() =>
                        loadStay(dates[0], dates[1], `${q.nights} nights from ${fmtShort(dates[0])}, loaded from your walk. Change the dates if you like.`, `Dates loaded: ${fmtShort(dates[0])} to ${fmtShort(dates[1])}`)
                      }
                    >
                      Load these dates into the calendar
                    </button>
                    <a className="btn ghost sm" href="#book">
                      Choose my own
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
