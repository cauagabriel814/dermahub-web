"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError("");
    try {
      await login(data);
      router.push("/");
    } catch {
      setError("Credenciais inválidas");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.960 0.008 70)" }}
    >
      {/* Background decoration */}
      <div
        className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, oklch(0.520 0.120 45) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, oklch(0.380 0.060 150) 0%, transparent 70%)" }}
      />

      <div
        className="animate-fade-up relative w-full max-w-[380px] rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.985 0.004 70)",
          boxShadow: "0 20px 60px oklch(0.220 0.025 45 / 0.12), 0 4px 16px oklch(0.220 0.025 45 / 0.06)",
          border: "1px solid oklch(0.900 0.010 65)",
        }}
      >
        {/* Top terracotta bar */}
        <div className="accent-bar-terracotta" style={{ height: "3px" }} />

        <div className="px-8 pt-10 pb-8">
          {/* Monogram */}
          <div className="flex justify-center mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold"
              style={{
                background: "linear-gradient(135deg, oklch(0.220 0.025 45) 0%, oklch(0.300 0.025 48) 100%)",
                color: "oklch(0.940 0.010 60)",
                boxShadow: "0 6px 20px oklch(0.220 0.025 45 / 0.35)",
              }}
            >
              DH
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-semibold tracking-tight"
              style={{ color: "oklch(0.220 0.025 45)" }}
            >
              DermaHub
            </h1>
            <p className="text-[11px] tracking-[0.2em] uppercase mt-1.5 font-medium" style={{ color: "oklch(0.520 0.015 60)" }}>
              Área Restrita
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "oklch(0.520 0.015 60)" }}>
                E-mail
              </Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                className="rounded-lg text-sm h-11"
                style={{ borderColor: "oklch(0.900 0.010 65)", background: "oklch(0.970 0.005 70)" }}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "oklch(0.520 0.015 60)" }}>
                Senha
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-lg text-sm h-11"
                style={{ borderColor: "oklch(0.900 0.010 65)", background: "oklch(0.970 0.005 70)" }}
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-xs text-center font-medium" style={{ color: "oklch(0.540 0.200 25)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-shimmer w-full rounded-lg py-3 text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ border: "none", cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
