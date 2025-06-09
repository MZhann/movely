"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CircleArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/auth/login", data);
      // console.log(response.data);
      // alert(response.data.message);
      const { token, userId, name, role } = response.data; // Destructure userId, name, and role

      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", userId); // Store user ID
      localStorage.setItem("userName", name); // Store user name

      if (role) {
        localStorage.setItem("role", role); // Store role
        if (role === "worker") {
          router.replace("/worker");
        } else {
          router.replace("/main");
        }
      } else {
        router.replace("/main"); // Default redirect if no role
      }

      // If refresh token is provided, store it as well
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError(e.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white relative">
      <div className="absolute top-10 left-10">
        <button className="" onClick={() => router.push("/")}>
          <CircleArrowLeft />
        </button>
      </div>

      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input
            className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
            placeholder="Email"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-400 text-sm">{errors.email.message}</span>
          )}
          <input
            className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
            placeholder="Password"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-400 text-sm">
              {errors.password.message}
            </span>
          )}
          <button
            type="submit"
            className="py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          {error && (
            <div className="text-red-400 text-center mt-2">{error}</div>
          )}
        </form>
        <div className="text-center mt-4">
          <a href="/register" className="text-yellow-400 underline">
            Create new account
          </a>
        </div>
      </div>
    </div>
  );
}
