// src/components/Stepper.jsx
/**
 * Reusable +/- stepper with themed colors (mobile-friendly, equal button widths)
 * Props:
 *  - value: number
 *  - onChange: (nextValue:number) => void
 *  - theme: { wrap:string, btn:string, txt:string } // from actionThemes.js
 *  - min?: number (default 0)
 *  - step?: number (default 1)
 *  - className?: string
 */
export default function Stepper({
  value = 0,
  onChange,
  theme,
  min = 0,
  step = 1,
  className = "",
}) {
  const safe = (n) => (Number.isFinite(n) ? n : 0);
  const dec = () => onChange(Math.max(min, safe(value) - step));
  const inc = () => onChange(safe(value) + step);

  return (
    <div
      className={`mx-auto w-full max-w-[220px] sm:max-w-[240px] md:max-w-[260px] shrink-0
                  flex items-center rounded-xl border overflow-hidden ${theme.wrap} ${className}`}
      role="group"
      aria-label="Stepper"
    >
      {/* Fixed-size left button */}
      <button
        type="button"
        onClick={dec}
        className={`flex items-center justify-center
                    w-11 h-11 sm:w-12 sm:h-12
                    text-2xl leading-none font-bold select-none active:scale-[0.98]
                    border-r ${theme.btn}`}
        aria-label="Decrement"
      >
        –
      </button>

      {/* Value cell (fixed height; flexible width) */}
      <div
        className={`flex-1 h-11 sm:h-12 px-3
                    flex items-center justify-center
                    font-semibold text-base sm:text-lg ${theme.txt}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {safe(value)}
      </div>

      {/* Fixed-size right button (identical width to left) */}
      <button
        type="button"
        onClick={inc}
        className={`flex items-center justify-center
                    w-11 h-11 sm:w-12 sm:h-12
                    text-2xl leading-none font-bold select-none active:scale-[0.98]
                    border-l ${theme.btn}`}
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
}


