import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function VerifyEmailBanner({ user }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.emailVerified) return null;

  async function resend() {
    setError("");
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (e) {
      setError(e?.message ?? "Could not send verification email.");
    }
  }

  return (
    <div className="mb-4 p-3 rounded-xl border bg-yellow-50">
      <p className="text-sm">
        Please verify your email to unlock all features:{" "}
        <span className="font-medium">{user.email}</span>
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button className="px-3 py-1 rounded-lg bg-black text-white" onClick={resend}>
          {sent ? "Verification sent ✓" : "Resend verification email"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
