"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/AuthService";
import { UserRegisterRequestDto } from "@/types/user";

export default function UserRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Client-side validation
  const validate = () => {
    const newErrors: string[] = [];

    if (!fullName.trim()) {
      newErrors.push("Full name is required.");
    }
    if (!email.includes("@")) {
      newErrors.push("Email must be valid.");
    }
    if (password.length < 6) {
      newErrors.push("Password must be at least 6 characters.");
    }
    if (!/^\+?[0-9. ()-]{7,25}$/.test(phone)) {
      newErrors.push("Phone number must be valid.");
    }
    if (!nationality.trim()) {
      newErrors.push("Nationality is required.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    if (!validate()) {
      setLoading(false);
      return;
    }

    const userData: UserRegisterRequestDto = {
      name: fullName,
      email,
      password,
      phone,
      nationality,
    };

    try {
      const user = await AuthService.registerUser(userData);
      console.log("User registered:", user);
      router.push("/auth/login");
    } catch (err: any) {
      console.error(err);
      const responseData = err.response?.data;

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        setErrors(responseData.errors);
      } else if (responseData?.details) {
        setErrors(Object.values(responseData.details));
      } else if (responseData?.message) {
        setErrors([responseData.message]);
      } else {
        setErrors(["Registration failed"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-start justify-center min-h-screen bg-base-200 pt-24">
      <div className="card w-full max-w-md shadow-lg bg-base-100 p-6">
        <h2 className="text-2xl font-bold mb-4">User Registration</h2>

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
            placeholder="Nationality"
            className="input input-bordered w-full"
            required
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />

          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
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
