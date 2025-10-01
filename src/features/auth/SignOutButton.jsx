import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut(auth)}
      className="px-3 py-2 rounded-xl bg-gray-800 text-white"
    >
      Sign Out
    </button>
  );
}
