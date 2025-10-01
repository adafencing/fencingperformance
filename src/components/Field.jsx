/**
 * Field wrapper for form inputs
 * Props:
 *  - label: string
 *  - required?: boolean
 *  - children: ReactNode
 */
export default function Field({ label, required, children }) {
  return (
    <label className="block mb-4">
      <div className="mb-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </label>
  );
}
