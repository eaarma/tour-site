"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import AuthPageShell from "@/components/auth/AuthPageShell";
import PhoneInput from "@/components/common/PhoneInput";
import { ApiError } from "@/lib/api/ApiError";
import { AuthService } from "@/lib/auth/authService";
import { UserRegisterRequestDto } from "@/types/user";

export default function UserRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
  }, []);

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
    if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      newErrors.phone = "Phone number must include country code.";
    }
    if (!nationality.trim()) {
      newErrors.nationality = "Nationality is required.";
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

    const userData: UserRegisterRequestDto = {
      name: fullName,
      email,
      password,
      phone,
      nationality,
    };

    try {
      await AuthService.registerUser(userData);

      toast.success("User registered successfully.");
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
      formEyebrow="User Registration"
      formTitle="Create your traveler account"
      formDescription="Set up a personal account so booking details, checkout, and future tours are easier to manage."
    >
      {errors.general && (
        <div className="mb-5 rounded-2xl border border-error/20 bg-error/5 p-4 text-sm leading-6 text-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content/80">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered h-12 w-full bg-base-100"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && <p className="text-sm text-error">{errors.email}</p>}
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

        <button
          className="btn btn-primary h-12 w-full text-base"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          className="btn btn-outline h-12 w-full"
          onClick={() => router.push("/auth/login")}
        >
          Already have an account?
        </button>
        <button
          className="btn btn-outline h-12 w-full"
          onClick={() => router.push("/auth/register/manager")}
        >
          Register as Guide
        </button>
      </div>
    </AuthPageShell>
  );
}

