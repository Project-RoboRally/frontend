'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type AnchorRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
};

/**
 * Hover/focus tooltip rendered in a portal with fixed positioning so sidebar
 * overflow does not clip it.
 * @author Elias
 */
export function FloatingTooltip({
  label,
  description,
  children,
  disabled = false,
  maxWidth = 280,
}: {
  label?: string;
  description: string;
  children: (props: {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
    'aria-describedby'?: string;
  }) => ReactNode;
  disabled?: boolean;
  maxWidth?: number;
}) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function captureAnchor(target: EventTarget | null) {
    if (!(target instanceof HTMLElement) || disabled) {
      return;
    }
    const rect = target.getBoundingClientRect();
    setAnchor({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    });
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setAnchor(null);
    setPlacement(null);
  }

  useLayoutEffect(() => {
    if (!open || !anchor || !tooltipRef.current) {
      return;
    }

    const tip = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 8;

    let top = anchor.top - tip.height - gap;
    if (top < viewportPadding) {
      top = anchor.bottom + gap;
    }
    if (top + tip.height > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, window.innerHeight - tip.height - viewportPadding);
    }

    let left = anchor.left + anchor.width / 2 - tip.width / 2;
    left = Math.min(
      Math.max(left, viewportPadding),
      window.innerWidth - tip.width - viewportPadding,
    );

    setPlacement({ top, left });
  }, [open, anchor, description, label, maxWidth]);

  return (
    <>
      {children({
        onMouseEnter: (event) => captureAnchor(event.currentTarget),
        onMouseLeave: close,
        onFocus: (event) => captureAnchor(event.currentTarget),
        onBlur: close,
        'aria-describedby': open ? tooltipId : undefined,
      })}

      {mounted &&
        open &&
        !disabled &&
        createPortal(
          <div
            id={tooltipId}
            ref={tooltipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[200] rounded-md border border-cobber-light bg-charcoal p-3 text-left text-xs font-normal text-bone shadow-xl"
            style={{
              top: placement?.top ?? -9999,
              left: placement?.left ?? -9999,
              width: maxWidth,
              maxWidth: `min(${maxWidth}px, calc(100vw - 16px))`,
              visibility: placement ? 'visible' : 'hidden',
            }}
          >
            {label ? (
              <div className="mb-1 text-[10px] font-bold uppercase text-cobber-light">{label}</div>
            ) : null}
            <p className="leading-snug">{description}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
