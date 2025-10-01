import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Basic fields you can extend later
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [sport, setSport] = useState("Fencing");
  const [role, setRole] = useState("Coach"); // Coach | Athlete | Admin | Analyst

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setMsg("");
      setErr("");

      try {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          if (!isMounted) return;
          setDisplayName(data.displayName || user.displayName || "");
          setCountry(data.country || "");
          setSport(data.sport || "Fencing");
          setRole(data.role || "Coach");
        } else {
          // Prefill from auth, create lazily on first Save
          if (!isMounted) return;
          setDisplayName(user.displayName || "");
          setSport("Fencing");
          setRole("Coach");
        }
      } catch (e) {
        if (!isMounted) return;
        setErr(e?.message ?? "Failed to load profile.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");

    try {
      const ref = doc(db, "profiles", user.uid);
      await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? "",
        displayName: displayName ?? "",
        country: country ?? "",
        sport: sport ?? "",
        role: role ?? "",
        updatedAt: serverTimestamp(),
        // createdAt only set on first write; safe to set if missing
        createdAt: serverTimestamp(),
      }, { merge: true });

      setMsg("Profile saved ✓");
    } catch (e) {
      setErr(e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-4 text-sm">Loading profile…</div>;
  }

  return (
    <div className="max-w-xl mx-auto rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">My Profile</h2>
      <p className="text-xs text-slate-500 mb-4">
        Your profile is private. Only you can view/edit it.
      </p>

      {msg && <div className="mb-3 text-sm text-green-700">{msg}</div>}
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

      <form onSubmit={handleSave} className="grid gap-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded-xl px-3 py-2 bg-gray-100"
            value={user.email || ""}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Display name</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Marko M."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Country</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Serbia"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Sport</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="e.g. Fencing"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Coach</option>
              <option>Athlete</option>
              <option>Admin</option>
              <option>Analyst</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full md:w-auto px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
