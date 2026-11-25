'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Native modal <dialog>: the browser traps focus, makes the page inert and closes on Escape.
 * This adds backdrop-click to close and returns focus to whatever opened it.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handle = () => {
      onCloseRef.current();
      const o = opener.current;
      if (o && o.isConnected) o.focus();
    };
    d.addEventListener('close', handle);
    return () => d.removeEventListener('close', handle);
  }, []);

  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      aria-label={label}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button className="btn ghost sm icon" type="button" onClick={onClick} aria-label={label}>
      ✕
    </button>
  );
}
