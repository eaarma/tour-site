"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/authService";
import { UserRegisterRequestDto } from "@/types/user";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api/ApiError";

export default function UserRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 🔹 Inline validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!email || !email.includes("@")) {
      newErrors.email = "Email must be valid.";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
      newErrors.phone = "Phone number must be valid.";
    }
    if (!nationality.trim()) {
      newErrors.nationality = "Nationality is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      toast.success("User registered successfully ✅");
      router.push("/auth/login");
    }  catch (err) {
  console.error(err);

  if (err instanceof ApiError && err.data) {
    if (err.data.errors?.length) {
      setErrors({ general: err.data.errors.join(", ") });
    } else if (err.data.details) {
      setErrors({ general: Object.values(err.data.details).join(", ") });
    } else if (err.data.message) {
      setErrors({ general: err.data.message });
    } else {
      setErrors({ general: "Registration failed." });
    }
  } else {
    setErrors({ general: "Registration failed." });
  }
} finally {
  setLoading(false);
}

  };

  return (
    <main className="flex items-start justify-center min-h-screen bg-base-200 pt-24">
      <div className="card w-full max-w-md shadow-lg bg-base-100 p-6">
        <h2 className="text-2xl font-bold mb-4">User Registration</h2>

        {errors.general && (
          <div className="alert alert-error mb-4 text-sm">{errors.general}</div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              className="input input-bordered w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              className="input input-bordered w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Nationality"
              className="input input-bordered w-full"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
            {errors.nationality && (
              <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
            )}
          </div>

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
