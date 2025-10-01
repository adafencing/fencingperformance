import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function PasswordReset({ onDone }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(err?.message ?? "Could not send reset email.");
    }
  }

  if (sent) {
    return (
      <div className="max-w-sm mx-auto p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">Check your inbox</h2>
        <p className="text-sm text-slate-600">
          If an account exists for <span className="font-medium">{email}</span>, a password reset email was sent.
        </p>
        <button className="mt-4 w-full py-2 rounded-xl bg-black text-white" onClick={onDone}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-2">Reset your password</h2>
      <form onSubmit={handleReset} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full py-2 rounded-xl bg-blue-600 text-white">Send reset link</button>
      </form>
      <button className="mt-3 w-full py-2 rounded-xl bg-gray-200" onClick={onDone}>Back</button>
    </div>
  );
}
