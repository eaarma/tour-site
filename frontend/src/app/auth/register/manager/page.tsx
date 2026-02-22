"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthService } from "@/lib/authService";
import { ManagerRegisterRequestDto } from "@/types/user";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api/ApiError";

const LANGUAGE_OPTIONS = [
  "English",
  "German",
  "Spanish",
  "Estonian",
  "French",
  "Italian",
  "Portuguese",
  "Dutch",
  "Polish",
  "Czech",
  "Hungarian",
  "Greek",
];

export default function ManagerRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageToAdd, setLanguageToAdd] = useState("");

  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (selectedLanguages.length > 0) {
      setErrors((prev) => {
        const { languages, ...rest } = prev;
        void languages; // explicitly mark as intentionally unused
        return rest;
      });
    }
  }, [selectedLanguages]);

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
    if (selectedLanguages.length === 0) {
      newErrors.languages = "Please select at least one language.";
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
      languages: selectedLanguages.join(","),
      bio,
    };

    try {
      const user = await AuthService.registerManager(registerData);
      console.log("Manager registered:", user);

      toast.success("Manager registered successfully ✅");
      router.push("/auth/login");
    } catch (err) {
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
    <div className="bg-base-100 min-h-screen">
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
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  className="select select-bordered w-full"
                  value={languageToAdd}
                  onChange={(e) => setLanguageToAdd(e.target.value)}
                >
                  <option value="">Select language</option>
                  {LANGUAGE_OPTIONS.filter(
                    (lang) => !selectedLanguages.includes(lang),
                  ).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!languageToAdd}
                  onClick={() => {
                    setSelectedLanguages((prev) => [...prev, languageToAdd]);
                    setLanguageToAdd("");
                  }}
                >
                  Add
                </button>
              </div>

              {errors.languages && (
                <p className="text-red-500 text-sm">{errors.languages}</p>
              )}
              {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="badge badge-outline flex items-center gap-1 px-3 py-2"
                    >
                      {lang}
                      <button
                        type="button"
                        className="ml-1 text-xs hover:text-red-500"
                        onClick={() =>
                          setSelectedLanguages((prev) =>
                            prev.filter((l) => l !== lang),
                          )
                        }
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
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
    </div>
  );
}
