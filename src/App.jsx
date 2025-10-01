// src/App.jsx
import { useState } from "react";
import TabButton from "./components/TabButton";
import Dashboard from "./features/dashboard/Dashboard";
import TrainingBoutForm from "./features/training/TrainingBoutForm";
import CompetitionBoutForm from "./features/competition/CompetitionBoutForm";
import LessonForm from "./features/lessons/LessonForm";
import { useLocalStorage } from "./lib/storage";
import ProfileScreen from "./features/profile/ProfileScreen";

// Auth bits
import AuthForm from "./features/auth/AuthForm";
import SignOutButton from "./features/auth/SignOutButton";
import VerifyEmailBanner from "./features/auth/VerifyEmailBanner";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth(); // live Firebase auth state
  const [tab, setTab] = useState("dashboard");

  // Persisted datasets (local for now; later you can sync with Firestore per user)
  const [trainingBouts, setTrainingBouts] = useLocalStorage("trainingBouts", []);
  const [compBouts, setCompBouts] = useLocalStorage("competitionBouts", []);
  const [lessons, setLessons] = useLocalStorage("lessons", []);

  // Optional: block saves until email is verified
  const mustBeVerified = () => {
    if (!user?.emailVerified) {
      alert("Please verify your email first. Check your inbox or use 'Resend verification' in the banner.");
      return false;
    }
    return true;
  };

  // Save helpers
  const saveTraining = (row) => {
    if (!mustBeVerified()) return;
    const updated = [row, ...trainingBouts];
    setTrainingBouts(updated);
    alert("Training bout saved ✔");
  };

  const saveCompetition = (row) => {
    if (!mustBeVerified()) return;
    const updated = [row, ...compBouts];
    setCompBouts(updated);
    alert("Competition bout saved ✔");
  };

  const saveLesson = (payload) => {
    if (!mustBeVerified()) return;
    const row = { ...payload, createdAt: new Date().toISOString() };
    const updated = [row, ...lessons];
    setLessons(updated);
    alert("Lesson saved ✔");
  };

  // Loading session from Firebase
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-sm">Loading session…</div>
      </div>
    );
  }

  // Not authenticated → show Auth form
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 text-center">Fencing Performance</h1>
          <AuthForm />
        </div>
      </div>
    );
    }

  // Authenticated → show full app
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fencing Performance</h1>
            <p className="text-xs text-slate-500">
              Signed in as <span className="font-medium">{user.displayName || user.email}</span>
            </p>
          </div>
          <SignOutButton />
        </header>

        {/* 🔔 Email verification banner (shown only if not verified) */}
        <VerifyEmailBanner user={user} />

        {/* Tabs */}
        <nav className="mb-6 grid grid-cols-5 gap-2">
          <TabButton label="Dashboard"        active={tab === "dashboard"}   onClick={() => setTab("dashboard")} />
          <TabButton label="Training Bout"     active={tab === "training"}    onClick={() => setTab("training")} />
          <TabButton label="Competition Bout"  active={tab === "competition"} onClick={() => setTab("competition")} />
          <TabButton label="Lesson"            active={tab === "lesson"}      onClick={() => setTab("lesson")} />
          <TabButton label="Profile"           active={tab === "profile"}     onClick={() => setTab("profile")} />
        </nav>

        {tab === "dashboard" && (
          <Dashboard
            trainingBouts={trainingBouts}
            compBouts={compBouts}
            lessons={lessons}
          />
        )}

        {tab === "training" && (
          <TrainingBoutForm
            onSave={saveTraining}
            trainingBouts={trainingBouts} // for CSV export inside the form
          />
        )}

        {tab === "competition" && (
          <CompetitionBoutForm
            onSave={saveCompetition}
            compBouts={compBouts} // for CSV export inside the form
          />
        )}

        {tab === "lesson" && <LessonForm onSave={saveLesson} />}

        {tab === "profile" && <ProfileScreen />}
      </div>
    </div>
  );
}






