import { useState } from "react";
import { apiCall } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Book, Shield, MapPin, Star, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const data = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      if (data.requiresOtp) {
        setStep("otp");
        toast.success("Verification code sent to your email!");
      } else {
        localStorage.setItem("token", data.token);
        await refreshProfile();
        toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      const data = await apiCall("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      
      localStorage.setItem("token", data.token);
      await refreshProfile();
      
      toast.success(isLogin ? "Login successful!" : "Account verified successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await apiCall("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStep("reset-password");
      toast.success("Password reset code sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !newPassword) {
      toast.error("Please enter valid code and new password");
      return;
    }
    setLoading(true);
    try {
      await apiCall("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setStep("credentials");
      setIsLogin(true);
      setOtp("");
      setNewPassword("");
      toast.success("Password reset successfully! You can now log in.");
    } catch (error) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-stone-50/50 rounded-3xl p-8 text-center max-w-2xl mx-auto border border-stone-200">
      <div className="bg-stone-900 p-6 rounded-3xl mb-8 animate-bounce shadow-2xl">
        <Book className="w-12 h-12 text-white" />
      </div>
      <h1 className="font-display text-5xl font-bold mb-4 text-stone-900 leading-tight">
        Your Next Chapter Starts Here
      </h1>
      <p className="text-stone-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
        Join a premium marketplace of book collectors. Buy, sell, and trade
        second-hand treasures with ease.
      </p>

      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 text-left">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {step === "otp" ? "Verify Email" : step === "forgot-password" ? "Reset Password" : step === "reset-password" ? "Set New Password" : isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {step === "forgot-password" ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Enter your email address to receive a reset code
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-stone-600 hover:text-stone-900 text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : step === "reset-password" ? (
          <form onSubmit={handleResetPassword} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Enter 6-digit code sent to {email}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all tracking-[0.5em] font-mono text-lg"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-stone-600 hover:text-stone-900 text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Enter 6-digit verification code sent to {email}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all tracking-[0.5em] font-mono text-lg"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-stone-600 hover:text-stone-900 text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-stone-700">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setStep("forgot-password")}
                      className="text-sm text-stone-600 hover:text-stone-900 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-stone-600 hover:text-stone-900 font-medium text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-stone-500 text-sm">
        By continuing, you agree to our Terms of Collector's Conduct and Privacy
        Policy.
      </p>
    </div>
  );
}
