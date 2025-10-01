/**
 * Reusable +/- stepper with themed colors
 * Props:
 *  - value: number
 *  - onChange: (nextValue:number) => void
 *  - theme: { wrap:string, btn:string, txt:string }  // from actionThemes.js
 *  - min?: number (default 0)
 *  - step?: number (default 1)
 *  - className?: string (optional extra classes on wrapper)
 */
export default function Stepper({
  value = 0,
  onChange,
  theme,
  min = 0,
  step = 1,
  className = "",
}) {
  const dec = () => onChange(Math.max(min, (value || 0) - step));
  const inc = () => onChange((value || 0) + step);

  return (
    <div
      className={`mx-auto flex items-stretch rounded-xl border overflow-hidden ${theme.wrap} ${className}`}
      role="group"
      aria-label="Stepper"
    >
      <button
        type="button"
        onClick={dec}
        className={`px-4 py-3 border-r text-2xl leading-none font-bold ${theme.btn}`}
        aria-label="Decrement"
      >
        –
      </button>
      <div
        className={`w-16 sm:w-20 px-3 py-3 text-center font-semibold text-base sm:text-lg ${theme.txt}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {Number.isFinite(value) ? value : 0}
      </div>
      <button
        type="button"
        onClick={inc}
        className={`px-4 py-3 border-l text-2xl leading-none font-bold ${theme.btn}`}
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
}


