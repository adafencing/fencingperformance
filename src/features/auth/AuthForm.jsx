// src/features/auth/AuthForm.jsx
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import PasswordReset from "./PasswordReset";

export default function AuthForm() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) await updateProfile(cred.user, { displayName });
        // Send verification email
        await sendEmailVerification(cred.user);
        setInfo("Account created. Please check your email to verify your address before signing in.");
      } else if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err?.message ?? "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "reset") {
    return <PasswordReset onDone={() => setMode("signin")} />;
  }

  return (
    <div className="max-w-sm mx-auto p-4 rounded-2xl shadow">
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 py-2 rounded-xl ${mode === "signin" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
          type="button"
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-2 rounded-xl ${mode === "signup" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
          type="button"
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1">Name (optional)</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="e.g. Marko"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        )}

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

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}

        <button
          className="w-full py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? (mode === "signup" ? "Creating account..." : "Signing in...")
            : (mode === "signup" ? "Create account" : "Sign in")}
        </button>

        <button
          className="w-full py-2 rounded-xl bg-gray-100"
          type="button"
          onClick={() => setMode("reset")}
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}

