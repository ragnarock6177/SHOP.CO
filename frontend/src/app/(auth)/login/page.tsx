"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowRight,
  Phone,
  CheckCircle2,
  Eye,
  EyeOff,
  Edit2,
} from "lucide-react";
import { ConfirmationResult } from "firebase/auth";
import {
  RealPhoneInput,
  isValidPhoneNumber,
} from "@/components/ui/RealPhoneInput";
import { checkUserApi, loginApi, registerFirebaseApi } from "@/lib/authApi";
import {
  signInWithGoogleFirebase,
  initRecaptchaVerifier,
  resetRecaptchaVerifier,
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// Zod Validation Schemas for Step 1
const mobileStepSchema = z.object({
  identifier: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (val) => !!val && isValidPhoneNumber(val),
      "Please enter a valid 10-digit mobile number for selected country",
    ),
});

const emailStepSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, "Email address is required")
    .max(100, "Email address cannot exceed 100 characters")
    .email("Please enter a valid email address (e.g. name@example.com)"),
});

// Zod Validation Schema for Password Step
const passwordStepSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password cannot exceed 16 characters limit"),
});

type Step1FormData = {
  identifier: string;
};

type PasswordFormData = {
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { saveAuth } = useAuth();

  const [inputMode, setInputMode] = useState<"mobile" | "email">("mobile");
  const [step, setStep] = useState<"input" | "otp" | "password" | "success">(
    "input",
  );
  const [savedIdentifier, setSavedIdentifier] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Firebase Phone Auth ConfirmationResult state
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // OTP State
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const firebaseToken = await signInWithGoogleFirebase();
      const authData = await registerFirebaseApi("google", firebaseToken);
      saveAuth(authData);
      setStep("success");
      toast.success(
        `Welcome, ${authData.user.email || authData.user.firstName || "User"}!`,
      );
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Google Sign-In failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect for OTP resend
  useEffect(() => {
    if (step !== "otp") return;
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // React Hook Form for Step 1 (Mobile or Email)
  const activeStep1Schema =
    inputMode === "mobile" ? mobileStepSchema : emailStepSchema;

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    reset: resetStep1,
    control: controlStep1,
    formState: { errors: errorsStep1 },
  } = useForm<Step1FormData>({
    resolver: zodResolver(activeStep1Schema),
    mode: "onTouched",
    defaultValues: {
      identifier: "",
    },
  });

  // React Hook Form for Password Step
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordStepSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
    },
  });

  const passwordVal = watchPassword("password") || "";

  // Switch between Mobile & Email input mode
  const handleToggleInputMode = () => {
    resetRecaptchaVerifier("recaptcha-container-login");
    setConfirmationResult(null);
    const nextMode = inputMode === "mobile" ? "email" : "mobile";
    setInputMode(nextMode);
    resetStep1({ identifier: "" });
  };

  // Step 1 Submission Handlers (Valid & Invalid)
  const onStep1Submit = async (data: Step1FormData) => {
    setIsLoading(true);
    setSavedIdentifier(data.identifier);

    try {
      const payload =
        inputMode === "mobile"
          ? { phone: data.identifier, phoneNumber: data.identifier }
          : { email: data.identifier };

      const checkResult = await checkUserApi(payload);

      if (checkResult.isRegistered) {
        if (inputMode === "mobile") {
          // Instantly show the OTP screen for maximum UI responsiveness
          setStep("otp");
          setResendTimer(30);
          setOtpValues(Array(6).fill(""));
          setConfirmationResult(null);

          // Dispatch SMS OTP sending in background
          try {
            const verifier = initRecaptchaVerifier("recaptcha-container-login");
            sendFirebasePhoneOtp(data.identifier, verifier)
              .then((confirmationRes) => {
                setConfirmationResult(confirmationRes);
                toast.success(`SMS OTP code sent to ${data.identifier}`);
              })
              .catch((fbErr: any) => {
                toast.error(
                  fbErr.message ||
                    "Failed to send SMS OTP via Firebase. Please check configuration.",
                );
              });
          } catch (fbErr: any) {
            toast.error(
              fbErr.message ||
                "Failed to send SMS OTP via Firebase. Please check configuration.",
            );
          }
        } else {
          if (checkResult.authProvider === "GOOGLE") {
            toast.error(
              "This account is registered with Google. Please sign in with Google"
            );
            return;
          } else {
            setStep("password");
            resetPassword({ password: "" });
            toast.info("Account found! Please enter your account password.");
          }
        }
      } else {
        router.push(
          `/signup?identifier=${encodeURIComponent(data.identifier)}&mode=${inputMode}`,
        );
      }
    } catch (err: any) {
      toast.error(
        err.message || "Failed to check user existence. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onStep1Invalid = (errors: FieldErrors<Step1FormData>) => {
    if (errors.identifier?.message) {
      toast.error(errors.identifier.message);
    }
  };

  // OTP Handling Functions
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;

    const newOtp = [...otpValues];
    newOtp[index] = clean.slice(-1);
    setOtpValues(newOtp);

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e
      .clipboardData.getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpValues(newOtp);

    if (pasted.length < 6) {
      otpRefs.current[pasted.length]?.focus();
    } else {
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");

    if (fullOtp.length < 6) {
      toast.error("Please enter all 6 digits of the OTP code.");
      return;
    }

    if (!confirmationResult) {
      toast.info("Sending OTP code... Please wait a moment for the SMS to arrive.");
      return;
    }

    setIsLoading(true);
    try {
      const firebaseToken = await verifyFirebasePhoneOtp(
        confirmationResult,
        fullOtp,
      );
      const authData = await registerFirebaseApi("phone", firebaseToken);
      saveAuth(authData);
      setStep("success");
      toast.success("Logged in successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const verifier = initRecaptchaVerifier("recaptcha-container-login");
      const confirmationRes = await sendFirebasePhoneOtp(
        savedIdentifier,
        verifier,
      );
      setConfirmationResult(confirmationRes);
      setResendTimer(30);
      setOtpValues(Array(6).fill(""));
      toast.success(
        `A new 6-digit SMS OTP code has been sent to ${savedIdentifier}`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to resend SMS OTP code.");
    } finally {
      setIsLoading(false);
    }
  };



  // Password Submission Handlers
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const authData = await loginApi(savedIdentifier, data.password);
      saveAuth(authData);
      setStep("success");
      toast.success("Logged in successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordInvalid = (errors: FieldErrors<PasswordFormData>) => {
    if (errors.password?.message) {
      toast.error(errors.password.message);
    }
  };

  // Go back to input step
  const handleGoBack = () => {
    resetRecaptchaVerifier("recaptcha-container-login");
    setConfirmationResult(null);
    setStep("input");
  };

  return (
    <>
      <div id="recaptcha-container-login" />
      <div className="max-w-md mx-auto px-4 pt-12 sm:pt-6 space-y-6 text-black">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            {step === "otp"
              ? "VERIFY OTP"
              : step === "password"
                ? "ENTER PASSWORD"
                : "WELCOME BACK"}
          </h1>
          <p className="text-xs text-gray-500">
            {step === "otp"
              ? "We sent a 6-digit OTP code to your mobile number."
              : step === "password"
                ? "Please enter your account password to sign in."
                : "Sign in to your AIRAVÉ account to view orders and checkout faster."}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* STEP: SUCCESS */}
          {step === "success" ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-be-vietnam-pro-black text-2xl font-black text-black uppercase">
                  LOGGED IN SUCCESSFULLY!
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Welcome back to AIRAVÉ. You are signed in as{" "}
                  <span className="font-bold text-black">
                    {savedIdentifier || "User"}
                  </span>
                  .
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-flex w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Go to My Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : step === "otp" ? (
            /* STEP: OTP VERIFICATION */
            <div className="space-y-6">
              {/* Top Edit Number Header */}
              <div className="bg-[#F0F0F0] rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-4 h-4 text-gray-600 shrink-0" />
                  <span className="text-gray-600">Code sent to:</span>
                  <span className="font-bold text-black truncate">
                    {savedIdentifier}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="text-[11px] font-bold text-black underline flex items-center gap-1 hover:text-gray-600 shrink-0 ml-2 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-3 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-10 h-12 sm:w-11 sm:h-13 text-center text-base sm:text-lg font-bold text-black bg-[#F0F0F0] border border-transparent rounded-2xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Code Section */}
                <div className="text-center text-xs text-gray-500">
                  {resendTimer > 0 ? (
                    <p>
                      Resend code in{" "}
                      <span className="font-bold text-black">
                        {resendTimer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-black underline hover:text-gray-700 cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>

                {/* Submit OTP */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 font-bold text-xs uppercase rounded-full flex items-center justify-center gap-2 disabled:opacity-50 bg-black border border-black text-white hover:text-black relative overflow-hidden transition-all duration-500 ease-in-out shadow-md hover:shadow-lg z-10 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-white before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0 cursor-pointer"
                >
                  <span>{isLoading ? "Verifying..." : "Verify & Continue"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : step === "password" ? (
            /* STEP: PASSWORD FOR EMAIL */
            <div className="space-y-6">
              {/* Top Edit Email Header */}
              <div className="bg-[#F0F0F0] rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-gray-600 shrink-0" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-bold text-black truncate">
                    {savedIdentifier}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="text-[11px] font-bold text-black underline flex items-center gap-1 hover:text-gray-600 shrink-0 ml-2 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Password Form */}
              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit, onPasswordInvalid)}
                className="space-y-4"
                noValidate
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase text-gray-700 block">
                      Password
                    </label>
                    {passwordVal.length > 0 && (
                      <span
                        className={`text-[10px] font-bold select-none transition-colors ${
                          passwordVal.length === 16
                            ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordVal.length === 16
                          ? "16/16 (Max limit reached!)"
                          : `${passwordVal.length}/16`}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                        errorsPassword.password
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      maxLength={16}
                      placeholder="enter your password"
                      {...registerPassword("password")}
                      className={`w-full bg-[#F0F0F0] rounded-full pl-11 pr-11 py-3 text-xs text-black placeholder-gray-400 focus:outline-none transition-all ${
                        errorsPassword.password
                          ? "border border-red-500 bg-red-50/40 ring-2 ring-red-500/20 shadow-xs shadow-red-500/10"
                          : passwordVal.length === 16
                            ? "border border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30"
                            : "focus:ring-2 focus:ring-black/10 focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-black rounded"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info("Password reset link sent to your email.");
                    }}
                    className="hover:text-black font-semibold text-xs cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Password Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-6 font-bold text-xs uppercase rounded-full flex items-center justify-center gap-2 disabled:opacity-50 bg-black border border-black text-white hover:text-black relative overflow-hidden transition-all duration-500 ease-in-out shadow-md hover:shadow-lg z-10 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-white before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0 cursor-pointer"
                >
                  <span>{isLoading ? "Signing in..." : "Log In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* STEP: INPUT SCREEN (MOBILE OR EMAIL ONLY) */
            <>
              {/* Google Social Login */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
                </button>
              </div>


              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold uppercase text-gray-400 absolute">
                  OR
                </span>
              </div>

              {/* Step 1 Input Form */}
              <form
                onSubmit={handleSubmitStep1(onStep1Submit, onStep1Invalid)}
                className="space-y-4"
                noValidate
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase text-gray-700">
                      {inputMode === "mobile"
                        ? "Mobile Number"
                        : "Email Address"}
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleInputMode}
                      disabled={isLoading}
                      className="text-[11px] font-semibold text-black hover:text-gray-700 flex items-center gap-1 bg-[#F0F0F0] hover:bg-gray-200 px-2.5 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      {inputMode === "mobile" ? (
                        <>
                          <Mail className="w-3 h-3 text-gray-600" />
                          <span>Login with Email</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3 h-3 text-gray-600" />
                          <span>Login with Mobile</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    {inputMode === "mobile" ? (
                      <Controller
                        name="identifier"
                        control={controlStep1}
                        render={({ field }) => (
                          <RealPhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            error={!!errorsStep1.identifier}
                            disabled={isLoading}
                            placeholder="Enter mobile number"
                            defaultCountry="IN"
                          />
                        )}
                      />
                    ) : (
                      <>
                        <Mail
                          className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                            errorsStep1.identifier
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="email"
                          disabled={isLoading}
                          placeholder="enter your email address"
                          {...registerStep1("identifier")}
                          className={`w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-gray-400 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            errorsStep1.identifier
                              ? "border border-red-500 bg-red-50/40 ring-2 ring-red-500/20 shadow-xs shadow-red-500/10"
                              : "focus:ring-2 focus:ring-black/10 focus:bg-white"
                          }`}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Step 1 Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-6 font-bold text-xs uppercase rounded-full flex items-center justify-center gap-2 disabled:opacity-50 bg-black border border-black text-white hover:text-black relative overflow-hidden transition-all duration-500 ease-in-out shadow-md hover:shadow-lg z-10 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-white before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0 cursor-pointer"
                >
                  <span>{isLoading ? "Checking..." : "Continue"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* Switch to SignUp */}
          {step === "input" && (
            <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100 mt-6">
              Don't have an account yet?{" "}
              <Link href="/signup" className="font-bold text-black underline">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
