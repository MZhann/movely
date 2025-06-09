"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { CircleArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const customerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const workerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  carModel: z.string().min(1),
  carNumber: z.string().min(1),
  notifyByEmail: z.boolean().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;
type WorkerForm = z.infer<typeof workerSchema>;

type Role = "customer" | "worker";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Customer form
  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    formState: { errors: errorsCustomer },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  // Worker form
  const {
    register: registerWorker,
    handleSubmit: handleSubmitWorker,
    formState: { errors: errorsWorker },
  } = useForm<WorkerForm>({
    resolver: zodResolver(workerSchema),
  });

  const onSubmitCustomer = async (data: CustomerForm) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/register", { ...data, role: "customer" });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitWorker = async (data: WorkerForm) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/register", { ...data, role: "worker" });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151513] text-white">
        <div className="bg-[#151513] p-8 rounded-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Registration successful!</h2>
          <p className="mb-4">You can now log in with your credentials.</p>
          <a href="/login" className="text-yellow-400 underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#151513] text-white">
      <button className="absolute top-10 left-10" onClick={() => router.push('/')}>
        <CircleArrowLeft />
      </button>

      <div className="bg-[#151513] p-8 rounded-xl  w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create an account
        </h2>
        {!role && (
          <div className="flex flex-col gap-4">
            <button
              className="py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg transition hover:brightness-105 cursor-pointer hover:scale-105"
              onClick={() => setRole("customer")}
            >
              I am a Customer
            </button>
            <button
              className="py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg transition hover:brightness-105 cursor-pointer hover:scale-105"
              onClick={() => setRole("worker")}
            >
              I am a Worker
            </button>
          </div>
        )}
        {role === "customer" && (
          <form
            className="flex flex-col gap-4 mt-4"
            onSubmit={handleSubmitCustomer(onSubmitCustomer)}
          >
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Name"
              {...registerCustomer("name")}
            />
            {errorsCustomer.name && (
              <span className="text-red-400 text-sm">
                {errorsCustomer.name.message}
              </span>
            )}
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Email"
              type="email"
              {...registerCustomer("email")}
            />
            {errorsCustomer.email && (
              <span className="text-red-400 text-sm">
                {errorsCustomer.email.message}
              </span>
            )}
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Password"
              type="password"
              {...registerCustomer("password")}
            />
            {errorsCustomer.password && (
              <span className="text-red-400 text-sm">
                {errorsCustomer.password.message}
              </span>
            )}
            <button
              type="submit"
              className="py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register as Customer"}
            </button>
            <button
              type="button"
              className="text-gray-400 underline mt-2"
              onClick={() => setRole(null)}
            >
              Back
            </button>
            {error && (
              <div className="text-red-400 text-center mt-2">{error}</div>
            )}
          </form>
        )}
        {role === "worker" && (
          <form
            className="flex flex-col gap-4 mt-4"
            onSubmit={handleSubmitWorker(onSubmitWorker)}
          >
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Name"
              {...registerWorker("name")}
            />
            {errorsWorker.name && (
              <span className="text-red-400 text-sm">
                {errorsWorker.name.message}
              </span>
            )}
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Email"
              type="email"
              {...registerWorker("email")}
            />
            {errorsWorker.email && (
              <span className="text-red-400 text-sm">
                {errorsWorker.email.message}
              </span>
            )}
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Password"
              type="password"
              {...registerWorker("password")}
            />
            {errorsWorker.password && (
              <span className="text-red-400 text-sm">
                {errorsWorker.password.message}
              </span>
            )}
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Car Model"
              {...registerWorker("carModel")}
            />
            {errorsWorker.carModel && (
              <span className="text-red-400 text-sm">
                {errorsWorker.carModel.message}
              </span>
            )}
            <input
              className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
              placeholder="Car Number"
              {...registerWorker("carNumber")}
            />
            {errorsWorker.carNumber && (
              <span className="text-red-400 text-sm">
                {errorsWorker.carNumber.message}
              </span>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...registerWorker("notifyByEmail")}
                className="accent-yellow-400"
              />
              <span className="text-gray-300">Notify me by email</span>
            </label>
            <button
              type="submit"
              className="py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register as Worker"}
            </button>
            <button
              type="button"
              className="text-gray-400 underline mt-2"
              onClick={() => setRole(null)}
            >
              Back
            </button>
            {error && (
              <div className="text-red-400 text-center mt-2">{error}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
