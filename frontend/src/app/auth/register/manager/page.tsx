"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import AuthPageShell from "@/components/auth/AuthPageShell";
import PhoneInput from "@/components/common/PhoneInput";
import { ApiError } from "@/lib/api/ApiError";
import { AuthService } from "@/lib/auth/authService";
import { ManagerRegisterRequestDto } from "@/types/user";

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
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageToAdd, setLanguageToAdd] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
  }, []);

  useEffect(() => {
    if (selectedLanguages.length > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.languages;
        return next;
      });
    }
  }, [selectedLanguages]);

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
    if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      newErrors.phone = "Phone number must include country code.";
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
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
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
      await AuthService.registerManager(registerData);

      toast.success("Manager registered successfully.");
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

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthPageShell
      formEyebrow="Guide Registration"
      formTitle="Create your manager account"
      formDescription="Set up your guide profile with experience, languages, and contact details so you can start working inside shops."
    >
      {errors.general && (
        <div className="mb-5 rounded-2xl border border-error/20 bg-error/5 p-4 text-sm leading-6 text-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">
              Email
            </label>
            <input
              type="email"
              placeholder="guide@example.com"
              className="input input-bordered h-12 w-full bg-base-100"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-error">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              className="input input-bordered h-12 w-full bg-base-100"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            {errors.fullName && (
              <p className="text-sm text-error">{errors.fullName}</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className="input input-bordered h-12 w-full bg-base-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-error">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Repeat your password"
              className={`input input-bordered h-12 w-full bg-base-100 ${
                passwordsMatch
                  ? "input-success"
                  : passwordsMismatch
                    ? "input-error"
                    : ""
              }`}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {passwordsMatch && (
              <p className="text-sm text-success">Passwords match.</p>
            )}
            {passwordsMismatch && (
              <p className="text-sm text-error">Passwords do not match.</p>
            )}
            {errors.confirmPassword && (
              <p className="text-sm text-error">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content/80">
            Phone Number
          </label>
          <PhoneInput value={phone} onChange={handlePhoneChange} />
          {errors.phone && <p className="text-sm text-error">{errors.phone}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">
              Nationality
            </label>
            <input
              type="text"
              placeholder="Your nationality"
              className="input input-bordered h-12 w-full bg-base-100"
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
            />
            {errors.nationality && (
              <p className="text-sm text-error">{errors.nationality}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/80">
              Experience
            </label>
            <input
              type="number"
              placeholder="Years of experience"
              className="input input-bordered h-12 w-full bg-base-100"
              min={0}
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            />
            {errors.experience && (
              <p className="text-sm text-error">{errors.experience}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content/80">
            Languages
          </label>
          <div className="flex gap-2">
            <select
              className="select select-bordered h-12 w-full bg-base-100"
              value={languageToAdd}
              onChange={(event) => setLanguageToAdd(event.target.value)}
            >
              <option value="">Select language</option>
              {LANGUAGE_OPTIONS.filter(
                (language) => !selectedLanguages.includes(language),
              ).map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-primary h-12 px-5"
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
            <p className="text-sm text-error">{errors.languages}</p>
          )}

          {selectedLanguages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedLanguages.map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/55 px-3 py-2 text-sm text-base-content"
                >
                  {language}
                  <button
                    type="button"
                    className="text-xs text-base-content/55 hover:text-error"
                    onClick={() =>
                      setSelectedLanguages((prev) =>
                        prev.filter((item) => item !== language),
                      )
                    }
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content/80">
            Short Bio
          </label>
          <textarea
            placeholder="Tell shops and travelers a little about your guiding background"
            className="textarea textarea-bordered min-h-32 w-full bg-base-100"
            rows={5}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
          {errors.bio && <p className="text-sm text-error">{errors.bio}</p>}
        </div>

        <button
          className="btn btn-primary h-12 w-full text-base"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating guide account..." : "Create Guide Account"}
        </button>
      </form>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          className="btn btn-outline h-12 w-full"
          onClick={() => router.push("/auth/register/user")}
        >
          Register as User
        </button>
        <button
          className="btn btn-outline h-12 w-full"
          onClick={() => router.push("/auth/login")}
        >
          Go to Login
        </button>
      </div>
    </AuthPageShell>
  );
}

