"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthService } from "@/lib/AuthService";
import { ManagerRegisterRequestDto } from "@/types/user";

export default function ManagerRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // 🔹 Validation function
  const validate = () => {
    const newErrors: string[] = [];

    if (!email.includes("@")) {
      newErrors.push("Email must be valid.");
    }
    if (password.length < 6) {
      newErrors.push("Password must be at least 6 characters.");
    }
    if (fullName.trim().length < 2) {
      newErrors.push("Full name must be at least 2 characters.");
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
      newErrors.push("Phone number must be valid.");
    }
    if (experience && Number(experience) < 0) {
      newErrors.push("Experience must be a positive number.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validate()) {
      setLoading(false);
      return;
    }

    const registerData: ManagerRegisterRequestDto = {
      email,
      password,
      name: fullName,
      phone,
      nationality,
      experience: experience ? String(experience) : "undefined",
      languages,
      bio,
    };

    try {
      const user = await AuthService.registerManager(registerData);
      console.log("Manager registered:", user);
      router.push("/auth/login"); // redirect to login
    } catch (err: any) {
      console.error(err);

      // Extract validation errors from backend response
      const responseData = err.response?.data;

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        // Case: backend returned a list of errors
        setErrors(responseData.errors);
      } else if (responseData?.details) {
        // Case: backend returned a field->error map
        setErrors(Object.values(responseData.details));
      } else if (responseData?.message) {
        // Case: single message
        setErrors([responseData.message]);
      } else {
        setErrors(["Registration failed"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-base-200 min-h-screen">
      <div className="flex justify-center pt-20">
        <div className="card w-full max-w-lg shadow-lg bg-base-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Manager Register</h2>

          {/* 🔹 Show validation errors */}
          {errors.length > 0 && (
            <div className="alert alert-error mb-4">
              <ul className="list-disc list-inside text-sm">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 🔹 Show backend error */}
          {error && <div className="alert alert-error mb-4">{error}</div>}

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

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <button
              className="link link-primary"
              onClick={() => router.push("/auth/register/user")}
            >
              Register as user
            </button>
            <button className="link" onClick={() => router.push("/auth/login")}>
              Go to login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
