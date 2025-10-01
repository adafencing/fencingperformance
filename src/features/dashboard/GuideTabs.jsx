export default function GuideTabs({ active, setActive }) {
  const Tab = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActive(id)}
      className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition
        ${active === id
          ? "bg-black text-white border-black"
          : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Tab id="CES" label="CES" />
      <Tab id="SE"  label="SE" />
      <Tab id="TSE" label="TSE" />
    </div>
  );
}
