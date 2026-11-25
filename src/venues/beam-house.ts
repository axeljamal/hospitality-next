import type { PhotoFile, Venue } from './types';

/**
 * The Beam House: a 400-year-old beamed cottage with a cedar hot tub, four minutes from the sea.
 * Copy, photos and pricing carried over from the hand-built site (marea-dvipa clients/beam-house).
 *
 * PLACEHOLDERS (owner to supply, never invent): anything in [square brackets], plus the items in `ownerTodo`.
 */

const IMG = '/venues/beam-house/img/';
const p = (file: string, width: number, height: number): PhotoFile => ({ src: IMG + file, width, height });

const WINTER = [10, 11, 0, 1, 2];

export const beamHouse: Venue = {
  slug: 'beam-house',
  name: 'The Beam House',
  tagline: 'Est. 1600s · 4 min to the sea',
  lang: 'en-GB',
  // PLACEHOLDER: the live domain. `.example` is reserved and never resolves.
  siteUrl: 'https://thebeamhouse.example',
  description:
    'A 400-year-old beam house with a cedar hot tub under the palms, four minutes from the sea. Book direct: live calendar, best-price promise, no platform fee.',
  ownerTodo: [
    'Town and county ([Town], [County]) in the address and map text',
    'Live domain (siteUrl) and contact email (hello@thebeamhouse.example is a placeholder)',
    'Phone / WhatsApp number (+44 7000 000000 is a placeholder)',
    'Instagram handle and profile URL',
    'Stripe for the hold-dates deposit and gift vouchers (integrations.payments)',
    'Mailing tool for the newsletter and returning-guests club (integrations.mailing)',
    'Analytics provider behind the consent choice (integrations.analytics)',
    'Real availability feed (iCal / channel manager); the calendar uses demo bookings',
    'Map link for "Open in Maps" (currently the Google Maps home page)',
    'Wi-Fi password in the house notes: confirm it is fine to publish, or move it to the arrival message',
    'Read-through of the object stories and the walk texts',
  ],

  photos: {
    'aerial-map': p('aerial-map.jpg', 832, 1800),
    armchair: p('armchair.jpg', 1200, 1600),
    bathroom: p('bathroom.jpg', 1350, 1800),
    'bedroom-chest': p('bedroom-chest.jpg', 1800, 1350),
    'bedroom-prints': p('bedroom-prints.jpg', 1800, 1350),
    bedroom: p('bedroom.jpg', 1800, 1350),
    cosy: p('cosy.jpg', 1600, 1200),
    'courtyard-day': p('courtyard-day.jpg', 1800, 1350),
    'dining-table': p('dining-table.jpg', 1800, 1350),
    'ext-dusk': p('ext-dusk.jpg', 1800, 1444),
    hall: p('hall.jpg', 1600, 1200),
    hero: p('hero.jpg', 1600, 1200),
    'hottub-night': p('hottub-night.jpg', 1800, 1350),
    'kitchen-night': p('kitchen-night.jpg', 1800, 1350),
    kitchen: p('kitchen.jpg', 1800, 1350),
    'library-stove': p('library-stove.jpg', 1800, 1350),
    mirror: p('mirror.jpg', 1600, 1200),
    'nook-lantern': p('nook-lantern.jpg', 1800, 1350),
    'nook-portrait': p('nook-portrait.jpg', 1600, 1298),
    'nook-table': p('nook-table.jpg', 1800, 1350),
    'nook-wide': p('nook-wide.jpg', 1600, 1200),
    reading: p('reading.jpg', 1200, 1600),
    'sitting-tv': p('sitting-tv.jpg', 1800, 1350),
    sofa: p('sofa.jpg', 1600, 1200),
    'twin-door': p('twin-door.jpg', 1800, 1350),
    'twin-night': p('twin-night.jpg', 1800, 1349),
    twin: p('twin.jpg', 1800, 1350),
  },
  ogPhoto: 'hottub-night',

  currencies: [
    { code: 'GBP', symbol: '£', rate: 1, label: '£ GBP' },
    { code: 'EUR', symbol: '€', rate: 1.17, label: '€ EUR' },
    { code: 'USD', symbol: '$', rate: 1.31, label: '$ USD' },
  ],

  pricing: {
    base: { low: 135, mid: 175, high: 245 },
    // Jun to Sep high, Apr/May/Oct mid, the rest low.
    bandByMonth: ['low', 'low', 'low', 'mid', 'mid', 'high', 'high', 'high', 'high', 'mid', 'low', 'low'],
    weekendDays: [5, 6],
    weekendMultiplier: 1.18,
    peaks: [{ month: 11, fromDay: 20, multiplier: 1.5, label: 'Christmas' }],
    gapNight: { multiplier: 0.8, bookableAlone: true },
    minNights: { default: 2, byArrivalMonth: { 5: 3, 6: 3, 7: 3 } },
    discounts: [
      { id: 'midweek', kind: 'midweek', label: 'Fireside midweek rate', pct: 25, minNights: 4, weekdays: [1, 2, 3, 4], months: WINTER },
      { id: 'long', kind: 'long', label: '7+ night stay', pct: 15, minNights: 7 },
    ],
    otaMarkup: 1.15,
    depositPct: 30,
    calendarMonths: 17,
  },

  extras: [
    { id: 'hamper', icon: '🧺', name: 'Welcome hamper', detail: 'Local bread, cheese, eggs, a bottle of something', price: 45 },
    { id: 'stove', icon: '🔥', name: 'Stove lit on arrival', detail: 'Room warm, logs stacked. October to April', price: 0, default: true },
    { id: 'late', icon: '🕐', name: 'Late checkout to 1pm', detail: 'If the next guests allow', price: 35 },
    { id: 'dog', icon: '🐕', name: 'Bring the dog', detail: 'Bed, bowl, towel and the beach map', price: 25 },
    { id: 'ebike', icon: '🚲', name: 'E-bike upgrade', detail: 'Two e-bikes for the week', price: 60 },
    { id: 'yoga', icon: '🧘', name: 'Private yoga in the long room', detail: '90 min with a local teacher', price: 70 },
    { id: 'tub', icon: '🛁', name: 'Hot tub ready on arrival', detail: 'Heated to 38°, lid off, towels out. October to April', price: 0 },
  ],
  guestOptions: [
    { value: '2', label: '2 adults' },
    { value: '3', label: '2 adults + 1 child' },
    { value: '4', label: '4 adults' },
    { value: '2dog', label: '2 adults + dog', addsExtra: 'dog' },
  ],

  nav: [
    { href: '#house', label: 'The house' },
    { href: '#seasons', label: 'Seasons' },
    { href: '#book', label: 'Book' },
    { href: '#guide', label: 'Guest guide' },
    { href: '#local', label: 'Local' },
  ],
  menu: [
    { href: '#house', label: 'The house' },
    { href: '#film', label: 'The house film' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#seasons', label: 'Seasons' },
    { href: '#offers', label: 'Offers & vouchers' },
    { href: '#book', label: 'Book direct' },
    { href: '#guide', label: 'Guest guide' },
    { href: '#local', label: 'Local' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#follow', label: 'Follow the house' },
  ],

  hero: {
    titleBefore: 'A 400-year-old ',
    titleEm: 'beam house',
    titleAfter: ' with a hot tub under the palms, four minutes from the sea.',
    sub: 'The cedar tub is heated to 38° before you arrive. Inside: oak beams, a wood-burner, a brass tray table from Marrakech. Book direct and keep the 15% the platforms would take.',
    primaryCta: 'Book direct, best-price promise',
    secondaryCta: 'Walk through the house',
    slides: [
      { photo: 'hottub-night', alt: 'The cedar hot tub steaming in the lit courtyard at night, palms around it' },
      { photo: 'ext-dusk', alt: 'The white cottage from the street at dusk, black-framed windows glowing, olive trees either side of the door' },
      { photo: 'hero', alt: 'The reading nook at dusk: two chairs around a brass tray table, a star lantern lit, palms outside the window' },
      { photo: 'bedroom', alt: 'The brass double bed with an aubergine throw, lamps lit either side' },
      { photo: 'sitting-tv', alt: 'The sitting room with the window seat, the TV on an antique chest and the dining room through the door' },
    ],
    stats: [
      { label: 'Rating', value: '4.96', detail: '★ from 212 verified stays' },
      { label: 'Direct saving', value: '−15%', detail: 'vs. the same dates on Airbnb' },
      { label: 'Hot tub', value: '38°', detail: 'cedar hot tub, hot on arrival' },
      { label: 'Returning guests', value: '38%', detail: 'of guests come back' },
      { label: 'Capacity', value: 'Sleeps 4', detail: '2 bedrooms · hot tub · wood-burner' },
    ],
    liveMessages: [
      'Hot tub heated to 38° for every arrival this winter',
      'Winter fireside rate now live · from £135',
      '38% of guests are returning guests',
    ],
  },

  perks: [
    { icon: 'star', title: 'Best-price promise', text: 'Always at least 15% under Airbnb and Booking.com for the same nights.' },
    { icon: 'card', title: 'One all-in price', text: 'Linen, cleaning, heating, Wi-Fi and logs included. Nothing appears at checkout.' },
    { icon: 'repeat', title: 'Come back for less', text: '10% off every return and first pick of Christmas and August.' },
  ],

  tour: {
    eyebrow: 'Interactive tour',
    title: 'Start in the hot tub. Then walk the whole house.',
    walkButton: 'Start the guided walk, tub first',
    floors: [
      { id: 'up', label: 'Upstairs' },
      { id: 'long', label: '' },
      { id: 'ground', label: 'Ground floor' },
      { id: 'out', label: 'Outside' },
    ],
    rooms: [
      {
        id: 'courtyard', name: 'The courtyard', plan: 'Hot tub and palms', floor: 'out', highlight: true,
        photo: { photo: 'courtyard-day', alt: 'Courtyard with a cedar hot tub, potted palms, two deck chairs and a blue shuttered panel on the wall' },
        intro: 'A cedar hot tub, two deck chairs and more palms than a courtyard needs.',
        stories: [
          { x: 59, y: 62, title: 'The hot tub', text: 'Western red cedar, wood-fired originally, now electric so it is warm when you arrive. Heated to 38°, seats four with knees touching.', from: { place: 'Jutland, Denmark', lat: 56.26, lon: 9.5 }, tip: 'Lid off, lights on, and the palms do the rest. Quiet after 10pm for the neighbours.' },
          { x: 31, y: 58, title: 'The palms', text: 'Chusan palms from a nursery in Torbay, planted the first winter. They are what turn the nook window blue at dusk.', from: { place: 'Torbay, Devon', lat: 50.46, lon: -3.53 }, tip: 'They drop a frond or two in a gale. Leave them; we collect.' },
          { x: 50, y: 35, title: 'The blue shutter', text: 'A pair of carved window shutters from a house in Essaouira, hung as a screen. The blue is the colour of the boats there.', from: { place: 'Essaouira, Morocco', lat: 31.51, lon: -9.77 }, tip: 'The deck chairs fold and go in the lean-to if rain is forecast. Or leave them; they are teak.' },
        ],
      },
      {
        id: 'nook', name: 'The nook', plan: 'Window seat', floor: 'ground', door: true,
        photo: { photo: 'nook-portrait', alt: 'The reading nook: two chairs, a brass tray table and the palm window' },
        intro: 'Two chairs, a brass tray table and the best window in the house.',
        stories: [
          { x: 52, y: 62, title: 'Brass tray table', text: 'Hammered brass on a folding carved stand, found in the souk in Marrakech and carried home as hand luggage.', from: { place: 'Marrakech, Morocco', lat: 31.63, lon: -7.99 }, tip: 'Perfect for a pot of coffee or a board game. It folds flat if you want floor space.' },
          { x: 23, y: 58, title: 'Kilim cushions', text: 'Hand-woven wool kilims from Anatolia. The rust and ochre set the palette for the whole house.', from: { place: 'Konya, Anatolia', lat: 37.87, lon: 32.49 }, tip: 'Take one to the window seat. They are meant to be sat on, not arranged.' },
          { x: 50, y: 36, title: 'The mirror', text: 'Carved and gilded Peruvian frame, bought from a workshop in Cusco and shipped home in a crate of wood shavings.', from: { place: 'Cusco, Peru', lat: -13.53, lon: -71.97 }, tip: 'Angle yourself to catch the star lantern and the bookshelves behind you.' },
          { x: 86, y: 40, title: 'The window', text: 'Original Georgian sash, 1790s glass with the ripples still in it. Palms in the courtyard outside turn the dusk light blue. The photo is not filtered.', from: null, tip: 'Sit here at about 4:30pm in winter. Ten minutes of blue, then the lamps.' },
        ],
      },
      {
        id: 'sitting-room', name: 'Sitting room', plan: 'Stove', floor: 'ground',
        photo: { photo: 'sofa', alt: 'Leather sofa in front of the wood-burner with a studded Indian door as a coffee table' },
        intro: 'Leather sofa, a wood-burner and an Indian door turned coffee table.',
        stories: [
          { x: 14, y: 48, title: 'Wood-burner', text: 'Lit for you on arrival in winter. Logs and kindling live in the lean-to; the two-minute lighting method is in the guide.', from: null, tip: 'Search the guest guide for "stove" and it will talk you through it.' },
          { x: 48, y: 62, title: 'Coffee table', text: 'A 19th-century door from Rajasthan, iron studs and all, resting on a welded steel frame made by a blacksmith up the coast.', from: { place: 'Jaipur, Rajasthan', lat: 26.91, lon: 75.79 }, tip: 'Feet up is encouraged. It has survived 150 years of worse.' },
          { x: 84, y: 44, title: 'Driftwood lamp table', text: 'A single block of reclaimed oak beam, found on the beach after a winter storm. The ceramic lamp was thrown by a potter in the lanes.', from: { place: 'The beach, 4 minutes away', lat: 50.818, lon: -0.14 }, tip: 'Run your hand along the top. You can feel the old nail holes.' },
        ],
      },
      {
        id: 'library', name: 'Library corner', plan: 'Books', floor: 'ground',
        photo: { photo: 'library-stove', alt: 'Bookshelves above a leather armchair, the wood-burner and the kilim-cushioned sofa under the beams' },
        intro: 'Three shelves of paperbacks, a mid-century armchair and the stove in the corner.',
        stories: [
          { x: 22, y: 66, title: 'The armchair', text: 'Distressed leather on an ash frame, Danish, 1960s, re-stuffed twice. Where most guests end up by day two.', from: { place: 'Copenhagen, Denmark', lat: 55.68, lon: 12.57 }, tip: 'The reading lamp has two settings. The lower one is for the last chapter.' },
          { x: 20, y: 22, title: 'The shelves', text: 'Take any book; leave one if you like. The collection started with a box left by the first guests and has never been pruned.', from: null, tip: 'Local walking guides are on the bottom shelf, tide tables tucked inside the front one.' },
          { x: 78, y: 58, title: 'Kilim cushions, again', text: 'The sofa cushions match the nook. Same village, bought ten years apart. The weaver recognised her own pattern from a photo.', from: { place: 'Konya, Anatolia', lat: 37.87, lon: 32.49 }, tip: 'The sofa pulls out if a fifth guest needs a night. Ask us first.' },
        ],
      },
      {
        id: 'dining', name: 'Dining room', plan: 'Table', floor: 'ground',
        photo: { photo: 'dining-table', alt: 'Farmhouse dining table with cross-back chairs, a flamingo print and a view into the sitting room' },
        intro: 'A scrubbed farmhouse table for six, under a flamingo.',
        stories: [
          { x: 40, y: 66, title: 'The table', text: 'Reclaimed pine boards on a painted base, made by a joiner in the lanes from floorboards out of a chapel. Seats six, eight with the bench.', from: { place: 'The lanes, 6 minutes away', lat: 50.822, lon: -0.14 }, tip: 'The ring marks are part of it. Hot pans straight on is fine.' },
          { x: 60, y: 28, title: 'The flamingo', text: 'A hand-coloured flamingo plate after Audubon. The pelican and heron next door are from the same set.', from: { place: 'New Orleans, Louisiana', lat: 29.95, lon: -90.07 }, tip: 'The best seat for the flamingo is the one with its back to the kitchen.' },
          { x: 85, y: 52, title: 'Through to the sitting room', text: 'The doorway was widened in the 1950s; look for the newer brick on the left. The whole ground floor runs in one line from here to the nook.', from: null, tip: 'Open both doors and the stove warms this room too.' },
        ],
      },
      {
        id: 'kitchen', name: 'Kitchen', plan: 'Galley', floor: 'ground',
        photo: { photo: 'kitchen', alt: 'Galley kitchen with open shelves, marble worktops and the arch through to the dining room' },
        intro: 'A galley kitchen with everything for a Sunday roast, through the arch.',
        stories: [
          { x: 16, y: 40, title: 'The open shelves', text: 'Scaffold boards, sanded and oiled, holding glasses from a Brighton junk shop and the blue-and-white plates that came with the house.', from: null, tip: 'Everyday plates on the lower shelf. The good glasses are at the top for a reason.' },
          { x: 27, y: 62, title: 'Coffee corner', text: 'A proper espresso machine, a grinder, and beans from the roaster by the station. Pastries from Sal’s at 7am.', from: { place: 'The roaster by the station', lat: 50.829, lon: -0.14 }, tip: 'Two scoops, firm tamp. The guide has a 40-second video if you want it.' },
          { x: 76, y: 60, title: 'Hob and sink', text: 'Induction hob, a full oven, a dishwasher under the sink and the brass tap that took three months to arrive from Italy.', from: { place: 'Brescia, Italy', lat: 45.54, lon: 10.22 }, tip: 'Induction heats fast. Start a notch lower than you think.' },
        ],
      },
      {
        id: 'long-view', name: 'The long view', plan: 'Whole ground floor, end to end', floor: 'long', long: true,
        photo: { photo: 'hall', alt: 'The ground floor seen end to end, beam after beam' },
        intro: 'The whole ground floor runs in one line, beam after beam.',
        stories: [
          { x: 50, y: 30, title: 'The beams', text: 'Original oak, probably ship timber. This coast reused hulls for houses, and the adze marks are still there under the wax.', from: { place: 'A hull, broken up on this coast', lat: 50.8, lon: -0.3 }, tip: 'Mind your head on the one by the door: 1.78 m.' },
          { x: 74, y: 52, title: 'Smart TV', text: 'Netflix, iPlayer and Spotify are signed in. Cast from your phone on the house Wi-Fi, 300 Mb fibre.', from: null, tip: 'Press the house button on the remote for the film of the rooms at night.' },
        ],
      },
      {
        id: 'brass-bedroom', name: 'The brass bedroom', plan: 'Double', floor: 'up',
        photo: { photo: 'bedroom', alt: 'Victorian brass double bed with an aubergine throw, lamps lit either side, a cane chair and a hamper by the wall' },
        intro: 'A Victorian brass bed under the eaves, with six birds watching.',
        stories: [
          { x: 67, y: 36, title: 'The brass bed', text: 'Victorian, cast iron and brass, from a dealer in Birmingham who had it from a hotel clearance. Re-sprung with a new mattress every three years.', from: { place: 'Birmingham', lat: 52.49, lon: -1.89 }, tip: 'The brass knobs unscrew. Guests have hidden notes inside for twenty years.' },
          { x: 94, y: 31, title: 'Six birds', text: 'Hand-coloured plates from Morris’s British Birds, 1850s, all waders from this shore: curlew, godwit, plover.', from: { place: 'York', lat: 53.96, lon: -1.08 }, tip: 'The same birds are on the beach at low tide. The guide has a tide table.' },
          { x: 90, y: 87, title: 'The hamper', text: 'Somerset willow. It holds the spare pillows and blankets, and the hot-water bottles in winter.', from: { place: 'Somerset Levels', lat: 51.07, lon: -2.93 }, tip: 'Blackout blind cord is on the left of the window. The seagulls start at five.' },
        ],
      },
      {
        id: 'attic-twin', name: 'The attic twin', plan: 'Twin, own bathroom', floor: 'up',
        photo: { photo: 'twin', alt: 'Two single beds with striped linen under the sloping attic beams, a small window between them' },
        intro: 'Two singles under the roof, painted white, with the bathroom through the door.',
        stories: [
          { x: 19, y: 69, title: 'The twin beds', text: 'Mahogany singles made by a joiner up the coast to fit under the slope. Striped linen from a Lisbon mill, washed soft.', from: { place: 'Lisbon, Portugal', lat: 38.72, lon: -9.14 }, tip: 'They push together into a king if you ask before you arrive.' },
          { x: 47, y: 25, title: 'The roof beams', text: 'The roof was raised in the 1800s to make the room; the old purlins stayed and were painted with the rest. The bolts are hand-forged.', from: null, tip: 'Tallest guest takes the bed on the right. More headroom.' },
          { x: 37, y: 51, title: 'The little window', text: 'Faces east over the rooftops to the sea. The first light arrives here before anywhere else in the house.', from: null, tip: 'Leave the blind up a crack and you will wake with the gulls and the sunrise.' },
        ],
      },
      {
        id: 'bathroom', name: 'The bathroom', plan: 'Stars', floor: 'up',
        photo: { photo: 'bathroom', alt: 'Attic bathroom with a star-patterned tiled floor, an oak-seated loo, a basin and a carved wooden mirror' },
        intro: 'Stars underfoot, an oak seat and a carved mirror, tucked under the roof.',
        stories: [
          { x: 66, y: 91, title: 'The star tiles', text: 'Encaustic cement tiles, pressed by hand in Valencia. Eight-pointed stars, the same pattern as the lantern downstairs.', from: { place: 'Valencia, Spain', lat: 39.47, lon: -0.38 }, tip: 'They are warm; there is heating under them. Bare feet are the point.' },
          { x: 17, y: 29, title: 'The carved mirror', text: 'Teak, carved with a river of fish, from a workshop in Ubud. It travelled home in a surfboard bag.', from: { place: 'Ubud, Bali', lat: -8.51, lon: 115.26 }, tip: 'The light above it is on a dimmer. Low for baths, high for shaving.' },
          { x: 55, y: 47, title: 'The little painting', text: 'A fishing village in oils, bought at the Thursday market for less than the frame was worth. Nobody can agree which coast it is.', from: { place: 'Thursday market, 5 minutes away', lat: 50.823, lon: -0.142 }, tip: 'Towels and the hairdryer are in the basket under the basin.' },
        ],
      },
    ],
    bonus: {
      title: 'The carved initials',
      text: 'Low on the beam by the door, where the wax has worn thin, someone cut I.H. 1687 with a knife. Nobody knows who. Every guest who finds every story in the house gets told this one.',
    },
  },

  walk: {
    eyebrow: 'Your stay, walked before you book',
    title: 'Tell the house who is coming. It walks you round in the right order, then finds your dates.',
    who: [
      { id: 'couple', label: 'A couple', phrase: 'the two of you' },
      { id: 'family', label: 'Family with children', phrase: 'the whole family' },
      { id: 'friends', label: 'Friends', phrase: 'all of you' },
      { id: 'solo', label: 'Just me', phrase: 'you' },
    ],
    pace: [
      { id: 'slow', label: 'Slow, a week of it', nights: 7, days: ['Saturday', 'Sunday'], arrivalDays: [6] },
      { id: 'balanced', label: 'Balanced, four nights', nights: 4, days: ['Monday', 'Tuesday'], arrivalDays: [1, 4] },
      { id: 'full', label: 'Full, a long weekend', nights: 3, days: ['Friday', 'Saturday'], arrivalDays: [5] },
    ],
    purposes: [
      {
        id: 'tub', label: 'The hot tub and the sea', phrase: 'the hot tub and the sea',
        steps: [
          { room: 'brass-bedroom', story: 0, when: '{day}, 9pm', text: 'Arrive after dark. The brass bed is turned down, the heating is on, the lamp is lit. Drop the bags and walk straight through to the courtyard.' },
          { room: 'courtyard', story: 0, when: '{day}, 10pm', text: 'First soak. The tub is already at 38° under the palms; lid off, lights on. Quiet after ten for the neighbours, which suits {who} anyway.', dogText: ' The dog has the courtyard to itself.' },
          { room: 'kitchen', story: 1, when: '{next}, 8am', whenFor: { slow: '{next}, 9am' }, text: 'Coffee corner. Beans are in the tin, the machine is a proper one. Take it to the nook; the sea is four minutes down the lane if you want to swim before breakfast.' },
          { room: 'nook', story: 3, when: '{next}, 4:30pm', text: 'The window. Ten minutes of blue light through the palms, then the lamps come on. Sit here and do nothing on purpose.' },
          { room: 'sitting-room', story: 0, when: '{next}, 8pm', text: 'Wood-burner. Logs are stacked, kindling in the basket, and it is lit in five minutes. Second soak after, or not.' },
          // Original said "Checkout is at eleven"; corrected to the 10:30 used everywhere else on the site.
          { room: 'bathroom', story: 0, when: 'Last morning, 9am', text: 'Star tiles. The attic bathroom catches the morning sun. Checkout is at 10:30, so there is time for one more coffee in the courtyard.' },
        ],
      },
      {
        id: 'fire', label: 'Winter fire and books', phrase: 'winter fire and books',
        dates: { months: WINTER, arrivalDaysByPace: { slow: [6], balanced: [1], full: [5] } },
        steps: [
          { room: 'library', story: 1, when: '{day}, 6pm', text: "The shelves. Arrive, kettle on, and pick the week's books before you unpack. Nobody has ever finished the stack." },
          { room: 'sitting-room', story: 0, when: '{day}, 7pm', text: 'Wood-burner. The log bundle and a bottle of local red are waiting by the stove on fireside stays. Lit in five minutes.' },
          { room: 'library', story: 0, when: '{next}, all afternoon', text: 'The armchair. Rain on the beams is the house at its best. Phones go in the hall drawer.', textFor: { family: 'The armchair. Rain on the beams is the house at its best. The children have the attic and the long view.' } },
          { room: 'courtyard', story: 0, when: '{next}, after dark', text: 'The hot tub in winter. Steam, palms, cold air, 38° water. Towels warm on the rail by the back door.' },
          { room: 'kitchen', story: 2, when: 'Midweek, 7pm', text: 'Hob and sink. A galley kitchen that cooks properly: induction hob, sharp knives, the heavy pan. The fishmonger is on the way back from the beach.' },
          { room: 'nook', story: 2, when: 'Last evening', text: 'The mirror. Angle yourself to catch the star lantern. The house is small enough that every corner gets used in a week here.' },
        ],
      },
      {
        id: 'work', label: 'A working week', phrase: 'a working week',
        dates: { months: WINTER, arrivalDays: [1] },
        steps: [
          { room: 'nook', story: 3, when: 'Monday, 9am', text: 'The window seat as a desk. Fibre Wi-Fi, a socket under the sill, the palms for company. Calls carry a little; the attic is quieter.' },
          { room: 'kitchen', story: 1, when: 'Every day, 11am', text: 'Coffee corner. Proper machine, beans in the tin. The lane to the beach is a four-minute reset between meetings.' },
          { room: 'long-view', story: 1, when: 'Weeknights, 7pm', text: 'The long view. The TV is a smart one, but the beams and the length of the room are the point after a day on screens.' },
          { room: 'courtyard', story: 0, when: 'Wednesday, 9pm', text: 'Midweek soak. The tub is the reason workcations here get rebooked. 38°, stars, no notifications.' },
          { room: 'dining', story: 0, when: 'Thursday, 8pm', text: 'The dining table. Seats six; doubles as a second desk by day and the one proper dinner of the week by night.' },
          { room: 'brass-bedroom', story: 0, when: 'Friday, late', text: 'The brass bed. Working weeks here run November to March at 25% off, Monday to Friday. The weekend after is yours if the calendar allows.' },
        ],
      },
      {
        id: 'celebrate', label: 'A celebration', phrase: 'a celebration',
        steps: [
          { room: 'dining', story: 0, when: '{day}, 8pm', text: 'The dining table. Seats six with elbows; candles are in the dresser drawer. Order the hamper and the first night cooks itself.' },
          { room: 'dining', story: 1, when: '{day}, 8:30pm', text: 'The flamingo. Every celebration photo ends up in front of it. We stopped fighting that.' },
          { room: 'courtyard', story: 0, when: '{day}, 11pm', text: 'The hot tub. Four fit with knees touching; the palms do the lighting. Quiet after ten, so this is the whispering part of the evening.' },
          { room: 'sitting-room', story: 1, when: '{next}, 10am', text: 'Coffee table. Late breakfast in the sitting room, fire going if the season asks for it. Nobody has to be anywhere.' },
          { room: 'bathroom', story: 1, when: '{next}, 6pm', text: 'The carved mirror. Getting ready happens here; the star tiles are the backdrop for the second round of photos.' },
          { room: 'brass-bedroom', story: 2, when: 'Arrival', text: "The hamper. Tell us what the occasion is and it is on the bed when you arrive: local cheese, the bakery's bread, a bottle, and a card in our handwriting." },
        ],
      },
    ],
    overrides: [
      { if: { who: 'family' }, index: 5, step: { room: 'attic-twin', story: 0, when: 'Bedtime', text: 'The attic twin. The children take the room under the roof beams with the little window; grown-ups get the brass bed and the tub to themselves after.' } },
      { if: { who: 'friends' }, index: 4, unlessRouteHas: { room: 'dining' }, step: { room: 'dining', story: 0, when: 'Every evening', text: "The dining table. Seats six with elbows. Friends' weeks here are mostly this table and the tub, in rotation." } },
      { if: { who: 'solo' }, index: 3, step: { room: 'library', story: 0, when: 'Whenever', text: 'The armchair. One good chair, one good lamp, one window of weather. The house is kind to one person.' } },
      { if: { dog: true }, index: 2, unlessRouteHas: { room: 'courtyard', story: 1 }, step: { room: 'courtyard', story: 1, when: 'First morning', text: 'The palms. The courtyard gate shuts, so the dog has the run of it while the coffee happens. The beach allows dogs all year at the far end.' } },
    ],
    defaults: { who: 'couple', pace: 'balanced', purpose: 'tub' },
  },

  film: {
    eyebrow: 'The house film',
    title: 'Half a minute inside, before you arrive.',
    lede: 'No talking, no music. The tub first, then the rooms at dusk, one after another. Guests get the longer version with their door code.',
    src: '/venues/beam-house/media/house-film.mp4',
    poster: 'hottub-night',
    label: 'The house film: slow pans across the rooms, no sound',
    cues: [
      [0, 3, 'The hot tub, lights on'], [3, 5.5, 'From the street at dusk'], [5.5, 8, 'The nook'], [8, 10.5, 'The sitting room'],
      [10.5, 13, 'Library corner and the stove'], [13, 15.5, 'Dining room'], [15.5, 18, 'The galley kitchen'], [18, 20.5, 'The brass bedroom'],
      [20.5, 23, 'The attic twin'], [23, 25.5, 'The star-tiled bathroom'], [25.5, 28.5, 'The courtyard by day'],
    ],
  },

  gallery: {
    eyebrow: 'Gallery',
    title: 'Steam, evening light, oak and plaster.',
    lede: 'Swipe through the house, or open any photo full size.',
    photos: [
      { photo: 'hottub-night', caption: 'The hot tub, lights on', alt: 'The cedar hot tub steaming in the lit courtyard at night' },
      { photo: 'courtyard-day', caption: 'The courtyard by day', alt: 'Courtyard with a cedar hot tub, palms, deck chairs and a blue shuttered panel' },
      { photo: 'ext-dusk', caption: 'From the street at dusk', alt: 'The white cottage from the street at dusk, windows glowing' },
      { photo: 'nook-portrait', caption: 'The reading nook', alt: 'The reading nook with a brass tray table and the star lantern' },
      { photo: 'nook-table', caption: 'The nook, looking through the house', alt: 'The brass tray table in the nook, with the sitting room beyond' },
      { photo: 'sofa', caption: 'Wood-burner and the leather sofa', alt: 'Leather sofa in front of the lit wood-burner' },
      { photo: 'library-stove', caption: 'Library corner and the stove', alt: 'Bookshelves, the leather armchair and the wood-burner under the beams' },
      { photo: 'sitting-tv', caption: 'The sitting room', alt: 'The sitting room with window seat, TV on an antique chest and a view into the dining room' },
      { photo: 'dining-table', caption: 'Dining room', alt: 'Farmhouse dining table with cross-back chairs and a flamingo print' },
      { photo: 'kitchen', caption: 'The galley kitchen', alt: 'Galley kitchen with open shelves and marble worktops, looking through the arch to the dining room' },
      { photo: 'kitchen-night', caption: 'Kitchen at night', alt: 'The kitchen seen through the arch at night, lamp lit' },
      { photo: 'bedroom', caption: 'The brass bedroom', alt: 'Victorian brass double bed with an aubergine throw' },
      { photo: 'bedroom-prints', caption: 'Birds over the bed', alt: 'Six framed bird prints above the brass bed end, a cane chair beneath' },
      { photo: 'bedroom-chest', caption: 'Chest and hamper', alt: 'Mahogany chest of drawers, a mirror and a wicker hamper in the bedroom' },
      { photo: 'twin', caption: 'The attic twin', alt: 'Two single beds with striped linen under the sloping attic beams' },
      { photo: 'twin-night', caption: 'Attic twin at night', alt: 'The twin room at night, one lamp lit between the beds' },
      { photo: 'twin-door', caption: 'Through to the bathroom', alt: 'The twin room with its door open onto the star-tiled bathroom' },
      { photo: 'bathroom', caption: 'The star-tiled bathroom', alt: 'Attic bathroom with star-patterned floor tiles, an oak seat and a carved mirror' },
      { photo: 'mirror', caption: 'Star lantern, Carpano print', alt: 'A gilded mirror reflecting the star lantern, with a Carpano poster' },
      { photo: 'hall', caption: 'The long room, end to end', alt: 'The ground floor seen end to end along the beams' },
      { photo: 'cosy', caption: 'Lamp-lit evenings', alt: 'A corner of the sitting room lit by a single lamp' },
      { photo: 'reading', caption: 'Shelves and palms', alt: 'Bookshelves with a palm in front of the window' },
    ],
  },

  seasons: {
    eyebrow: 'All year round',
    title: 'There is no off-season here. Only different reasons.',
    items: [
      {
        name: 'Winter', months: [11, 0, 1],
        photos: [
          { photo: 'library-stove', alt: 'The wood-burner lit beside the bookshelves and leather armchair' },
          { photo: 'hottub-night', alt: 'The hot tub steaming in the lit courtyard at night' },
          { photo: 'bedroom', alt: 'The brass bed with lamps lit either side' },
        ],
        title: 'Fireside weeks, from £135',
        text: 'Storm-watching from the window seat, stove lit, soup on. The midweek 4-night fireside rate includes a log bundle and a bottle of local red. Sea swims for the brave at 9°.',
        tags: ['Wood-burner', 'Storm walks', 'Midweek −25%', 'Workcation rate'],
      },
      {
        name: 'Spring', months: [2, 3, 4],
        photos: [
          { photo: 'courtyard-day', alt: 'The courtyard by day with the hot tub, palms and deck chairs' },
          { photo: 'nook-wide', alt: 'The nook in daylight with palms in the window' },
          { photo: 'twin', alt: 'The attic twin room with striped linen' },
        ],
        title: 'Long light, empty beaches',
        text: 'The lane fills with blossom, the palms wake up, and the beach is yours before the crowds. Bikes are free; the coast path is at its greenest.',
        tags: ['Bikes', 'Coast path', 'Easter availability', 'Dogs welcome'],
      },
      {
        name: 'Summer', months: [5, 6, 7],
        photos: [
          { photo: 'ext-dusk', alt: 'The cottage from the street on a summer evening' },
          { photo: 'courtyard-day', alt: 'Deck chairs and the hot tub in the palm courtyard' },
          { photo: 'dining-table', alt: 'The dining table ready for a long dinner' },
        ],
        title: 'Swim before breakfast',
        text: 'Four minutes to the water. Sash windows wide, courtyard dinners, and the house stays cool under thick walls. Direct guests get first pick of August.',
        tags: ['Sea 18°', 'Courtyard', 'Festival weeks', 'Returning-guest priority'],
      },
      {
        name: 'Autumn', months: [8, 9, 10],
        photos: [
          { photo: 'armchair', alt: 'The library armchair in golden autumn light' },
          { photo: 'kitchen-night', alt: 'The kitchen at night, lamp lit' },
          { photo: 'nook-lantern', alt: 'The nook with the star lantern and kilim cushions' },
        ],
        title: 'Reading season',
        text: 'Golden light, warm sea, quiet town. Book-club weekends and writers’ retreats: the library corner earns its name. Cheapest full-week rates of the year.',
        tags: ['Warmest sea', 'Book-club weeks', '7-night −20%', 'Half-term'],
      },
    ],
  },

  offers: {
    eyebrow: 'Offers',
    title: 'Quiet weeks, rewarded.',
    lede: 'The pricing engine applies these automatically. Press a button and the next matching free dates land in the calendar.',
    items: [
      { id: 'fireside', when: 'November to March · Mon to Fri', title: 'Fireside midweek', text: 'Four midweek nights, 25% off. A log bundle and a bottle of local red are waiting by the stove.', from: { nights: 4, discountPct: 25 }, unit: 'for 4 nights', cta: 'Find fireside dates', find: { nights: 4, arrivalDay: 1, months: WINTER } },
      { id: 'workcation', when: 'November to March · Mon to Fri', title: 'Workcation', text: 'Fibre Wi-Fi, the window seat as a desk and 25% off. Cheaper than most coworking spaces, with a beach at lunch.', from: { nights: 4, discountPct: 25 }, unit: 'for 4 nights', cta: 'Find a working week', find: { nights: 4, arrivalDay: 1, months: WINTER } },
      { id: 'week', when: 'Any season', title: 'The full week', text: 'Seven nights or more, 15% off. Best value in autumn, when the sea is warmest.', from: { nights: 7, discountPct: 15 }, unit: 'for 7 nights', cta: 'Find a free week', find: { nights: 7, arrivalDay: 6 } },
      { id: 'gap', when: 'Between bookings', title: 'Gap-night deals', text: 'A single night between two bookings, 20% off and free of the minimum stay. Marked "deal" in the calendar.', from: { nights: 1, discountPct: 20 }, unit: 'for 1 night', cta: 'Find the next one', find: { nights: 1, gapNight: true } },
    ],
    voucher: {
      title: 'Give someone the beam house.',
      text: 'Any amount from £25, redeemable against any direct stay or extra, valid 24 months. Sent by email as a printable card, or posted with a sprig of something from the garden.',
      amounts: [100, 250, 500],
      defaultAmount: 250,
      min: 25,
      max: 2000,
      validMonths: 24,
    },
  },

  booking: {
    eyebrow: 'Live availability & smart pricing',
    title: 'Pick your nights. The price is the price.',
    lede: 'Rates move with the season and the calendar. A gap night between two bookings is cheaper, and a long midweek stay in January is cheapest. What you see includes everything.',
    syncNote: 'Calendar syncs with Airbnb and Booking.com every 15 minutes.',
    cancellation: 'I agree to the cancellation terms: full refund to 14 days before arrival, 30% deposit now, balance 4 weeks out.',
  },

  guide: {
    eyebrow: 'Guest guide · ask the house',
    title: 'Ask anything. No waiting for a host to wake up.',
    lede: 'Everything we have ever been asked, searchable. Open it on your phone from the QR code by the door.',
    placeholder: 'How does the stove work? Where do the bins go?',
    note: 'Answers come from the house notes. Anything the notes cannot answer goes to the owners, who reply in about 6 minutes.',
    arrival: [
      { title: 'Before you travel', text: 'We send a short house film and your door code 48 hours out. Tell us your arrival time and we will light the stove and warm the room.' },
      { title: 'Getting here', text: 'Train to the seafront station, then a 9-minute walk along the lane. The parking permit is in the hall drawer for the bay opposite.' },
      { title: 'Self check-in from 3pm', text: 'The key safe is behind the slate plaque. The code arrives by SMS. Lights and heating come on automatically when the door opens.' },
      { title: 'During your stay', text: 'Message us any time in the app. Median reply is 6 minutes. Extra logs are in the lean-to. Tide times are on the kitchen screen.' },
      { title: 'Leaving by 10:30', text: 'Leave the dishes, strip nothing. Late checkout to 1pm can be added if the next guests are not due.' },
    ],
    notes: [
      { topic: 'wifi', keywords: ['wifi', 'wi-fi', 'internet', 'password', 'network'], answer: 'Network BeamHouse, password oak-and-tide-1600. Fibre, 300 Mb. The window seat in the nook has the strongest signal.' },
      { topic: 'wood-burner', keywords: ['stove', 'fire', 'log', 'wood', 'burner'], answer: 'Open the bottom vent fully, two firelighters under a wigwam of kindling, one log on top, door slightly ajar for 5 minutes, then close and half-shut the vent. Logs are in the lean-to; a 90-second video is on the kitchen screen.' },
      { topic: 'check-in', keywords: ['check', 'arriv', 'key', 'code', 'door'], answer: 'Self check-in from 3pm. The key safe is behind the slate plaque to the left of the door; the code comes by SMS the morning of arrival. Checkout 10:30.' },
      { topic: 'bins', keywords: ['bin', 'rubbish', 'recycl'], answer: 'Black bin Tuesday, green recycling alternate Thursdays. Both live in the yard; just put bags in and we take them out.' },
      { topic: 'swimming', keywords: ['swim', 'beach', 'sea', 'tide'], answer: 'Turn left out of the door, down the lane, 4 minutes. Best swim is the cove past the groynes at mid-to-high tide. Today: high 07:42 and 20:05. Sea 13°.' },
      { topic: 'dogs', keywords: ['dog', 'pet'], answer: 'Dogs welcome (£25 per stay, bed and towel provided). The beach is dog-friendly all year except the main stretch May to September.' },
      { topic: 'parking', keywords: ['park', 'car'], answer: 'The permit for the bay opposite is in the hall drawer; display it on the dashboard. EV charger 150 m at the station car park.' },
      { topic: 'eating out', keywords: ['eat', 'pub', 'restaurant', 'dinner', 'food', 'coffee', 'bakery'], answer: 'The Anchor (3 min) for fish and a fire; Sal’s for coffee and pastries at 7am; the Thursday market on the square for cheese and bread.' },
      { topic: 'heating', keywords: ['heat', 'cold', 'radiator', 'thermostat', 'warm'], answer: 'Heating is on a schedule (6:30 to 9 and 16 to 22). Tap the dial in the hall to boost 2 hours any time. The stove does the rest.' },
      { topic: 'tv', keywords: ['tv', 'netflix', 'cast', 'telly'], answer: 'Samsung TV in the sitting room: Netflix, iPlayer and Spotify are signed in. Cast from your phone on the house Wi-Fi.' },
      { topic: 'hot tub', keywords: ['hot tub', 'hottub', 'tub', 'jacuzzi', 'spa'], answer: 'The cedar hot tub in the courtyard is heated to 38° for your arrival from October to April; in summer, press the dial by the back door and allow about four hours. Towels are in the lean-to. Lid on when you get out, no glass by the tub, and quiet after 10pm for the neighbours.' },
      { topic: 'bedrooms', keywords: ['bedroom', 'bed ', 'beds', 'sleep', 'twin', 'double', 'bathroom', 'shower', 'bath'], answer: 'The brass bedroom has a Victorian double and the chest of drawers; the attic twin has two singles and its own bathroom through the door, with the star-tiled floor. Both have blackout blinds. Extra pillows are in the hamper.' },
    ],
    faq: [
      { q: 'What time is check-in and check-out?', a: 'Self check-in from 3pm. The key safe is behind the slate plaque and the code arrives by SMS on the morning of arrival. Check-out is 10:30, with late check-out to 1pm available when the next guests are not due.' },
      { q: 'Is the price really all-in?', a: 'Yes. Linen, cleaning, heating, Wi-Fi and logs are included and nothing is added at checkout. Direct prices are at least 15% below the same dates on Airbnb and Booking.com.' },
      { q: 'Are dogs welcome?', a: 'Yes, £25 per stay with a bed, bowl and towel provided. The beach is dog-friendly all year except the main stretch from May to September.' },
      { q: 'What is the minimum stay?', a: 'Two nights, or three nights for arrivals in June, July and August. Stays of seven nights or more get 15% off.' },
      { q: 'What is the cancellation policy?', a: 'Full refund up to 14 days before arrival. A 30% deposit is taken at booking and the balance four weeks before. A £200 damage deposit is pre-authorised and never charged for honest accidents.' },
      { q: 'How far is the beach?', a: 'Four minutes on foot. Turn left out of the door and down the lane. The best swim is the cove past the groynes at mid-to-high tide.' },
    ],
  },

  local: {
    eyebrow: 'Out the door',
    title: 'The lane, the beach, the pub, the walk.',
    places: [
      { icon: '🏖️', name: 'The cove', detail: 'Sheltered, sandy at low tide', walk: '4 min' },
      { icon: '🍺', name: 'The Anchor', detail: 'Fish, fire, Sunday roast', walk: '3 min' },
      { icon: '🥐', name: 'Sal’s bakery', detail: 'Opens 7am. Go early.', walk: '2 min' },
      { icon: '🥾', name: 'Cliff path loop', detail: '9 km, pub at halfway', walk: 'from the door' },
      { icon: '🎨', name: 'Lanes and galleries', detail: 'Antiques, prints; the Carpano poster came from here', walk: '6 min' },
      { icon: '🚆', name: 'Station', detail: 'London in 1h05', walk: '9 min' },
      { icon: '🛒', name: 'Thursday market', detail: 'Cheese, bread, flowers on the square', walk: '5 min' },
      { icon: '🌅', name: 'Sunset bench', detail: 'West-facing, bring a blanket', walk: '7 min' },
    ],
    map: {
      photo: { photo: 'aerial-map', alt: 'Aerial photo looking over the rooftops to the sea, with the house at 78 High Street marked, the beach two streets ahead, a pub on the seafront and two ice-cream stops on the way' },
      eyebrow: 'Where we are',
      title: '78 High Street. Turn left, and the sea is at the end of the road.',
      text: 'The pub is on the seafront, there are two ice-cream stops on the way down, and the station is nine minutes in the other direction.',
      // PLACEHOLDER: replace with the house's own map link.
      url: 'https://maps.google.com',
    },
    today: {
      title: '12° · broken cloud',
      text: 'High tide 07:42 & 20:05 · Sunset 16:21 · Sea 13°',
      note: 'Sample figures. Live data connects to Met Office and tide APIs in production.',
    },
    gettingAround: { text: 'Station 9 min walk · Bus stop 2 min · Bikes in the yard (free) · EV charger 150 m', url: 'https://maps.google.com' },
    club: {
      title: 'Returning guests club',
      text: 'Stay once direct and you are in: 10% off every return, first access to Christmas, New Year and August, and we remember how you take your coffee.',
    },
  },

  reviews: {
    eyebrow: 'Verified stays only',
    title: 'What guests say when they get home.',
    rating: 4.96,
    count: 212,
    items: [
      { author: 'Hannah & Tom', from: 'Bristol', note: '3rd stay', date: '2026-02-20', rating: 5, badge: 'verified · Feb', text: 'We came for a rainy February week and barely left the house. The stove, the books, the lamp. It is built for weather.' },
      { author: 'Lena', from: 'Berlin', date: '2026-07-14', rating: 5, badge: 'verified · Jul', text: 'Four minutes to the sea is true. Swam before breakfast every day, then coffee in the nook with the palms.' },
      { author: 'Marcus', from: 'London', note: 'workcation', date: '2026-10-05', rating: 5, badge: 'verified · Oct', text: 'Worked from the window seat all week on fibre Wi-Fi. The midweek rate made it cheaper than my coworking space.' },
    ],
  },

  follow: {
    eyebrow: 'Follow the house',
    title: 'Letters from the beam house, and the odd photo of the sea.',
    instagram: {
      // PLACEHOLDER: handle and profile URL not confirmed by the owner.
      handle: '@thebeamhouse',
      url: 'https://www.instagram.com/',
      posts: [
        { photo: 'hottub-night', caption: 'Tub night', alt: 'The hot tub steaming at night' },
        { photo: 'ext-dusk', caption: 'Home, lights on', alt: 'The cottage from the street at dusk' },
        { photo: 'library-stove', caption: 'First fire of the season', alt: 'The wood-burner lit beside the bookshelves' },
        { photo: 'bathroom', caption: 'Stars underfoot', alt: 'Star-patterned bathroom floor tiles' },
        { photo: 'bedroom-prints', caption: 'Six birds, one bed', alt: 'Bird prints above the brass bed' },
        { photo: 'courtyard-day', caption: 'Courtyard, Sunday', alt: 'Deck chairs and palms in the courtyard' },
      ],
    },
    newsletter: {
      title: 'Four letters a year. Never more.',
      text: 'Seasonal dates before they go on the platforms, the midweek deals, a recipe from the kitchen and the best swim of the month.',
      note: 'Demo: in production this connects to a mailing tool such as Mailchimp or Buttondown, with a double opt-in email.',
    },
  },

  contact: {
    // PLACEHOLDERS: both values are stand-ins until the owner confirms them.
    email: 'hello@thebeamhouse.example',
    phone: '+44 7000 000000',
    phoneNote: 'WhatsApp',
    replyTime: 'Replies typically within the hour, 8am to 10pm, by WhatsApp or phone.',
    replyDuringStay: 'about 6 minutes',
  },

  footer: {
    credit: 'A Marea Dvīpa design, built for direct booking.',
    cancellation: 'Cancellation: full refund to 14 days before arrival. Damage deposit £200, pre-authorised, never charged for honest accidents.',
  },

  accessibility: {
    date: '8 November 2026',
    title: 'Built to be used by everyone who stays here',
    intro: 'This site aims to meet WCAG 2.2 level AA. It is one page with no page builder, so what you see is what the browser gets.',
    points: [
      'A skip link, landmarks and headings in order, and every photograph described in text.',
      'The whole site works with a keyboard: the calendar with the arrow keys and Page Up and Page Down, the dialogs with Escape, the tour and film with buttons that have names.',
      'Text can be resized to 200% and the layout reflows on a phone without sideways scrolling.',
      'Colours were checked for contrast in both the light and the dark theme, and the theme follows your system setting.',
      'Nothing moves if your system asks for reduced motion; slideshows and the film have a pause control.',
      'No cookies are set and nothing is tracked until you choose to allow it.',
    ],
    limits: 'The house film has captions but no audio description. The interactive tour’s floor plan is also offered as a list of rooms and stories for screen readers.',
    contact: 'If anything here is hard to use, tell us by WhatsApp, phone or email and we will fix it or help you book another way. We review this statement each time the site changes.',
  },

  consent: {
    intro: 'This site keeps your theme, currency and booking in progress on your device. Nothing is tracked unless you allow it.',
    analytics: 'Privacy-friendly page counts so we know which sections matter.',
    marketing: 'A reminder about dates you looked at but did not book.',
  },

  schema: {
    type: 'VacationRental',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    petsAllowed: true,
    checkinTime: '15:00',
    checkoutTime: '10:30',
    amenities: ['Wood-burning stove', 'Fibre Wi-Fi', 'Beach 4 minutes on foot', 'Free bikes', 'Parking permit', 'Cedar hot tub in the courtyard', 'Attic bathroom with the twin room'],
    // PLACEHOLDER: locality and region not yet supplied by the owner.
    address: { street: '78 High Street', locality: '[Town]', region: '[County]', country: 'GB' },
    priceRange: '£135–£245 per night, all-in',
    photos: ['ext-dusk', 'hero', 'hottub-night', 'bedroom', 'kitchen', 'dining-table'],
  },

  // Approximate point used only for the story compass; carried over from the original site.
  geo: { lat: 50.82, lon: -0.14 },

  integrations: {
    payments: null, // PLACEHOLDER: Stripe, not connected
    mailing: null, // PLACEHOLDER: mailing tool, not chosen
    analytics: null, // PLACEHOLDER: analytics, not chosen (only loads after consent)
  },
};
