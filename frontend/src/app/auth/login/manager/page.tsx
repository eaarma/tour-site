"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ManagerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in manager:", { email, password });
  };

  return (
    <main className="bg-base-200 min-h-screen">
      <div className="flex justify-center pt-20">
        <div className="card w-full max-w-md shadow-lg bg-base-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Manager Login</h2>
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
            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <button
              className="link link-primary"
              onClick={() => router.push("/auth/register/manager")}
            >
              Register as Manager
            </button>
            <button
              className="link"
              onClick={() => router.push("/auth/login/user")}
            >
              User login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
