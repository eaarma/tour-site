"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      fullName,
      email,
      password,
      phone,
      nationality,
    };

    // TODO: Send userData to your backend API
    console.log("Registering user:", userData);

    // Redirect or show success message as needed
    // router.push("/auth/login/user");
  };

  return (
    <main className="flex items-start justify-center min-h-screen bg-base-200 pt-24">
      <div className="card w-full max-w-md shadow-lg bg-base-100 p-6">
        <h2 className="text-2xl font-bold mb-4">User Registration</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="input input-bordered w-full"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
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
          <input
            type="tel"
            placeholder="Phone Number"
            className="input input-bordered w-full"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nationality (optional)"
            className="input input-bordered w-full"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
          <button className="btn btn-primary w-full" type="submit">
            Register
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <button
            className="link link-primary"
            onClick={() => router.push("/auth/login")}
          >
            Already have an account?
          </button>
          <button
            className="link"
            onClick={() => router.push("/auth/register/manager")}
          >
            Register as manager
          </button>
        </div>
      </div>
    </main>
  );
}
