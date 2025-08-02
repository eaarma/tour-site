"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in:", { email, password });
    // TODO: Call your login API here
  };

  return (
    <main className="flex items-start justify-center min-h-screen bg-base-200 pt-24">
      <div className="card w-full max-w-md shadow-lg bg-base-100 p-6">
        <h2 className="text-2xl font-bold mb-4">User Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary w-full" type="submit">
            Login
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <button
            className="link link-primary"
            onClick={() => router.push("/auth/register/user")}
          >
            Register as user
          </button>
          <button
            className="link"
            onClick={() => router.push("/auth/login/manager")}
          >
            Manager login
          </button>
        </div>
      </div>
    </main>
  );
}
