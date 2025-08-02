"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ManagerRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const registerData = {
      email,
      password,
      fullName,
      phone,
      nationality,
      experience: experience ? Number(experience) : undefined,
      languages,
      bio,
    };

    console.log("Registering manager:", registerData);

    // TODO: Add your registration API call here
  };

  return (
    <main className="bg-base-200 min-h-screen">
      <div className="flex justify-center pt-20">
        <div className="card w-full max-w-lg shadow-lg bg-base-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Manager Register</h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
              type="text"
              placeholder="Full Name"
              className="input input-bordered w-full"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
            <input
              type="number"
              placeholder="Experience (years, optional)"
              className="input input-bordered w-full"
              min={0}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
            <input
              type="text"
              placeholder="Languages Spoken (optional, comma separated)"
              className="input input-bordered w-full"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
            <textarea
              placeholder="Short Bio / Description (optional)"
              className="textarea textarea-bordered w-full"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>

            <button className="btn btn-primary" type="submit">
              Register
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
      </div>
    </main>
  );
}
