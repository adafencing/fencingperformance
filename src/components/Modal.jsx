import { useEffect } from "react";

/**
 * Modal component (mobile-safe: scrollable body, sticky header, safe-area insets)
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string
 *  - children: ReactNode
 */
export default function Modal({ open, onClose, title, children }) {
  const onEsc = (e) => e.key === "Escape" && onClose?.();

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock background scroll
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className="
          relative z-10 w-full sm:w-[min(720px,92vw)]
          h-[100dvh] sm:h-auto sm:max-h-[85vh]
          bg-white rounded-none sm:rounded-2xl shadow-xl
          flex flex-col
        "
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 border-b bg-white/95 backdrop-blur">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 px-5 py-4 overflow-y-auto text-sm sm:text-base leading-6 text-slate-700"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
