"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  RealPhoneInput,
  isValidPhoneNumber,
} from "@/components/ui/RealPhoneInput";
import { ConfirmationResult } from "firebase/auth";
import { FormFieldError } from "@/components/ui/FormFieldError";
import {
  checkUserApi,
  registerEmailApi,
} from "@/lib/authApi";
import {
  initRecaptchaVerifier,
  resetRecaptchaVerifier,
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// Zod Validation Schema for Registration Form
const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters long")
      .max(30, "First name cannot exceed 30 characters")
      .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters long")
      .max(30, "Last name cannot exceed 30 characters")
      .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),

    email: z
      .string()
      .trim()
      .min(5, "Email address is required")
      .max(100, "Email address cannot exceed 100 characters")
      .email("Please enter a valid email address (e.g. name@example.com)"),

    mobileNumber: z
      .string()
      .min(1, "Mobile number is required")
      .refine(
        (val) => !!val && isValidPhoneNumber(val),
        "Please enter a valid 10-digit mobile number for selected country",
      ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(16, "Password cannot exceed 16 characters limit")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain at least 1 uppercase, 1 lowercase letter, and 1 number",
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    agreeTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must agree to the Terms & Conditions",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match. Please re-enter identical passwords.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveAuth } = useAuth();

  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Firebase Phone Auth ConfirmationResult state
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // OTP State (6 digits)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpError, setOtpError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      agreeTerms: true,
    },
  });

  // Prefill identifier from URL query if user was redirected from Login page
  useEffect(() => {
    const paramIdentifier = searchParams.get("identifier");
    const paramMode = searchParams.get("mode");
    if (paramIdentifier) {
      if (paramMode === "email") {
        setValue("email", paramIdentifier);
      } else if (paramMode === "mobile") {
        setValue("mobileNumber", paramIdentifier);
      }
    }
  }, [searchParams, setValue]);

  const passwordVal = watch("password") || "";
  const confirmPasswordVal = watch("confirmPassword") || "";

  // Resend Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Valid Form Submission -> Check user existence then Send OTP
  const onValidDetailsSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const checkResult = await checkUserApi({
        email: data.email,
        phone: data.mobileNumber,
        phoneNumber: data.mobileNumber,
      });

      if (checkResult.isRegistered) {
        if (checkResult.authProvider === "GOOGLE") {
          toast.error(
            "This account is registered with Google. Please sign in with Google",
          );
        } else {
          toast.error(
            "An account with this email or mobile number already exists. Please log in.",
          );
        }
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        return;
      }

      setStep("otp");
      setResendTimer(30);
      setConfirmationResult(null);

      try {
        const verifier = initRecaptchaVerifier("recaptcha-container-signup");
        sendFirebasePhoneOtp(data.mobileNumber, verifier)
          .then((confirmationRes) => {
            setConfirmationResult(confirmationRes);
            toast.success(`OTP code sent to ${data.mobileNumber}`);
          })
          .catch((fbErr: any) => {
            toast.error(
              fbErr.message ||
                "Failed to send SMS OTP code. Please check mobile number or try again.",
            );
          });
      } catch (fbErr: any) {
        toast.error(
          fbErr.message ||
            "Failed to send SMS OTP code. Please check mobile number or try again.",
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
      setOtpError("");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setOtpError("");
    try {
      const mobileNumber = getValues("mobileNumber");
      const verifier = initRecaptchaVerifier("recaptcha-container-signup");
      const confirmationRes = await sendFirebasePhoneOtp(
        mobileNumber,
        verifier,
      );
      setConfirmationResult(confirmationRes);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      toast.success(
        `A new 6-digit SMS OTP code has been sent to ${mobileNumber}`,
      );
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend OTP.");
      toast.error(err.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    try {
      let firebaseToken: string | undefined;
      if (confirmationResult) {
        firebaseToken = await verifyFirebasePhoneOtp(
          confirmationResult,
          enteredOtp,
        );
      }

      const formData = getValues();
      const authData = await registerEmailApi({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.mobileNumber,
        firebaseToken,
      });

      saveAuth(authData);
      setStep("success");
      toast.success("Account created & mobile number verified successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      setOtpError(err.message || "OTP verification or registration failed.");
      toast.error(err.message || "OTP verification or registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div id="recaptcha-container-signup" />
      <div className="max-w-md mx-auto px-3.5 py-6 sm:py-10 space-y-5 text-black font-be-vietnam-pro">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="font-be-vietnam-pro-black text-xl sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-tight">
            JOIN AIRAVÉ
          </h1>
          <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
            Create your account and enjoy 20% off your first fashion order.
          </p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-5 shadow-xs">
          {step === "details" && (
            <>
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200/80 text-red-700 rounded-2xl p-3 text-xs font-medium flex items-center gap-2 animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>Please correct the highlighted fields below to continue.</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onValidDetailsSubmit)}
                className="space-y-3.5"
                noValidate
              >
                {/* First Name & Last Name Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="First name"
                        {...register("firstName")}
                        className="w-full bg-[#F4F4F4] rounded-full pl-9 pr-3 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>
                    <FormFieldError message={errors.firstName?.message} />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Last name"
                        {...register("lastName")}
                        className="w-full bg-[#F4F4F4] rounded-full pl-9 pr-3 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>
                    <FormFieldError message={errors.lastName?.message} />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      {...register("email")}
                      className="w-full bg-[#F4F4F4] rounded-full pl-10 pr-3 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                    />
                  </div>
                  <FormFieldError message={errors.email?.message} />
                </div>

                {/* Real Phone Input */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase text-gray-700 block mb-1">
                    Mobile Number
                  </label>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                      <RealPhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!errors.mobileNumber}
                        placeholder="Enter mobile number"
                        defaultCountry="IN"
                      />
                    )}
                  />
                  <FormFieldError message={errors.mobileNumber?.message} />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-extrabold uppercase text-gray-700">
                      Password
                    </label>
                    {passwordVal.length > 0 && (
                      <span className="text-[10px] font-bold text-gray-400">
                        {passwordVal.length}/16
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      maxLength={16}
                      placeholder="Create password"
                      {...register("password")}
                      className="w-full bg-[#F4F4F4] rounded-full pl-10 pr-10 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FormFieldError message={errors.password?.message} />
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-extrabold uppercase text-gray-700">
                      Confirm Password
                    </label>
                    {confirmPasswordVal.length > 0 && (
                      <span className="text-[10px] font-bold text-gray-400">
                        {confirmPasswordVal.length}/16
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      maxLength={16}
                      placeholder="Confirm password"
                      {...register("confirmPassword")}
                      className="w-full bg-[#F4F4F4] rounded-full pl-10 pr-10 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FormFieldError message={errors.confirmPassword?.message} />
                </div>

                {/* Terms Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-gray-500">
                    <input
                      type="checkbox"
                      {...register("agreeTerms")}
                      className="accent-black rounded mt-0.5"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="#" className="underline text-black font-bold">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="underline text-black font-bold">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  <FormFieldError message={errors.agreeTerms?.message} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-5 font-extrabold text-xs uppercase rounded-full flex items-center justify-center gap-2 disabled:opacity-50 bg-black text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
                >
                  <span>
                    {isLoading ? "Sending OTP..." : "Get OTP Verification"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-black/5 text-black rounded-full flex items-center justify-center mx-auto mb-1">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="font-be-vietnam-pro-black text-lg font-bold text-black uppercase">
                  OTP VERIFICATION
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Enter the 6-digit verification code sent to{" "}
                  <span className="font-bold text-black">
                    {getValues("mobileNumber")}
                  </span>
                  .
                </p>
              </div>

              {otpError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-2.5 text-xs font-medium text-center flex items-center justify-center gap-1.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-9 h-11 sm:w-11 sm:h-13 text-center text-base sm:text-lg font-bold text-black bg-[#F4F4F4] border border-transparent rounded-xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span>Didn't receive code?</span>
                  {resendTimer > 0 ? (
                    <span className="font-semibold text-black">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-black underline flex items-center gap-1 hover:text-gray-700 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 font-extrabold text-xs uppercase rounded-full flex items-center justify-center gap-2 disabled:opacity-50 bg-black text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
                  >
                    <span>
                      {isLoading
                        ? "Verifying..."
                        : "Verify OTP & Create Account"}
                    </span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetRecaptchaVerifier("recaptcha-container-signup");
                      setConfirmationResult(null);
                      setStep("details");
                    }}
                    className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-black flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Edit Mobile Number
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="font-be-vietnam-pro-black text-xl font-black text-black uppercase">
                  WELCOME, {getValues("firstName").toUpperCase()}!
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Your account has been successfully verified & created. You can
                  now shop AIRAVÉ collection.
                </p>
              </div>
              <Link
                href="/product"
                className="inline-flex w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Switch to Login */}
          {step === "details" && (
            <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-black underline">
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500 font-be-vietnam-pro">Loading...</div>}>
      <SignUpFormContent />
    </Suspense>
  );
}
