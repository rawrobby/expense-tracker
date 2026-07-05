"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  async function handleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleSignup() {
  setLoading(true);
  setError(null);
  
  const { error } = await supabase.auth.signUp({ email, password });
  
  if (error) {
    // Intercept the server message and replace it
    if (error.message.includes("Anonymous sign-ins")) {
      setError("Please fill out both fields.");
    } else {
      setError(error.message);
    }
    setLoading(false);
    return;
  }
  
  router.push("/");
  router.refresh();
}
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      {" "}
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
        {" "}
        <h1 className="mb-6 text-2xl font-bold">Expense Tracker</h1>{" "}
        <label className="mb-1 block text-sm font-medium">Email</label>{" "}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2"
          placeholder="you@example.com"
        />{" "}
        <label className="mb-1 block text-sm font-medium">Password</label>{" "}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border px-3 py-2"
          placeholder="At least 6 characters"
        />{" "}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}{" "}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mb-2 w-full rounded-lg bg-green-700 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {" "}
          Log In{" "}
        </button>{" "}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-lg border py-2 font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {" "}
          Create Account{" "}
        </button>{" "}
      </div>{" "}
    </main>
  );
}
