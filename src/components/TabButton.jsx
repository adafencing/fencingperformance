/**
 * Tab Button Component
 * Props:
 *  - label: string
 *  - active: boolean
 *  - onClick: () => void
 */
export default function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border font-medium transition-all text-xs sm:text-sm
        ${active
          ? "bg-black text-white border-black shadow"
          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}
    >
      {label}
    </button>
  );
}
