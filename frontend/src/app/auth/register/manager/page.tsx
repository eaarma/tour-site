"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthService } from "@/lib/AuthService";
import { ManagerRegisterRequestDto } from "@/types/user";
import toast from "react-hot-toast";

export default function ManagerRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 🔹 Inline validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email || !email.includes("@")) {
      newErrors.email = "Email must be valid.";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    }
    if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
      newErrors.phone = "Phone number must be valid.";
    }
    if (!nationality.trim()) {
      newErrors.nationality = "Nationality is required.";
    }
    if (!experience || Number(experience) < 0) {
      newErrors.experience = "Experience must be a positive number.";
    }
    if (!languages.trim()) {
      newErrors.languages = "Languages field is required.";
    }
    if (!bio.trim()) {
      newErrors.bio = "Bio field is required.";
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

    const registerData: ManagerRegisterRequestDto = {
      email,
      password,
      name: fullName,
      phone,
      nationality,
      experience,
      languages,
      bio,
    };

    try {
      const user = await AuthService.registerManager(registerData);
      console.log("Manager registered:", user);

      toast.success("Manager registered successfully ✅");
      router.push("/auth/login");
    } catch (err: any) {
      console.error(err);

      const responseData = err.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        setErrors({ general: responseData.errors.join(", ") });
      } else if (responseData?.details) {
        setErrors({ general: Object.values(responseData.details).join(", ") });
      } else if (responseData?.message) {
        setErrors({ general: responseData.message });
      } else {
        setErrors({ general: "Registration failed." });
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

          {errors.general && (
            <div className="alert alert-error mb-4 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.nationality}
                </p>
              )}
            </div>

            <div>
              <input
                type="number"
                placeholder="Experience (years)"
                className="input input-bordered w-full"
                min={0}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Languages Spoken (comma separated)"
                className="input input-bordered w-full"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
              />
              {errors.languages && (
                <p className="text-red-500 text-sm mt-1">{errors.languages}</p>
              )}
            </div>

            <div>
              <textarea
                placeholder="Short Bio / Description"
                className="textarea textarea-bordered w-full"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
              )}
            </div>

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
