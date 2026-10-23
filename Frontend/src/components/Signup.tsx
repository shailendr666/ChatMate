import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { toast } from "react-toastify";

type SignupData = {
  email: string;
  password: string;
};

export const SignupView = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SignupData>({ email: "", password: "" });

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating your account");

    try {
      await apiClient.post("/auth/register", {
        email: data.email,
        password: data.password,
      });

      toast.update(toastId, {
        render: "Account created!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
      navigate("/login");
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      let message = "Something went wrong. Please try again.";
      if (status === 409 || status === 400) {
        message = detail ?? "An account with this email already exists.";
      } else if (status === 422) {
        message = "Please enter a valid email and a strong password.";
      } else if (detail) {
        message = detail;
      }

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-zinc-800 rounded-lg p-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Create an account to get started.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div>
            <label className="block text-xs font-mono uppercase tracking-tight text-zinc-500 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                id="signup-email"
                type="email"
                placeholder="you@domain.com"
                value={data.email}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-tight text-zinc-500 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={data.password}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, password: e.target.value }))
                }
                name="password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Please wait..." : "Create Account"}
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-6 text-center">
          <p className="text-xs text-zinc-500">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};
