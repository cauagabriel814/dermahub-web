"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(160deg, oklch(0.975 0.005 60) 0%, oklch(0.950 0.010 65) 50%, oklch(0.920 0.010 60) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 h-96 w-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.312 0.0434 119.6)" }}
      />
      <div
        className="absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.429 0.0306 72.6)" }}
      />

      <div
        className="animate-fade-up relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "oklch(1 0 0)",
          boxShadow: "0 24px 64px oklch(0.250 0.026 50.8 / 0.12), 0 4px 16px oklch(0.250 0.026 50.8 / 0.06)",
          border: "1px solid oklch(0.878 0.015 58)",
        }}
      >
        {/* Top accent */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, oklch(0.312 0.0434 119.6), oklch(0.429 0.0306 72.6), oklch(0.327 0.0736 48.0))" }}
        />

        <div className="px-8 pt-10 pb-8">
          {/* Monogram */}
          <div className="flex justify-center mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, oklch(0.312 0.0434 119.6) 0%, oklch(0.380 0.048 118) 100%)",
                color: "oklch(0.975 0.005 60)",
                boxShadow: "0 8px 24px oklch(0.312 0.0434 119.6 / 0.4)",
                fontFamily: "var(--font-brand)",
                fontSize: "1.25rem",
              }}
            >
              DH
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-light tracking-wide"
              style={{ fontFamily: "var(--font-brand)", color: "oklch(0.250 0.026 50.8)" }}
            >
              DermaHub
            </h1>
            <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
              Área Restrita
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium tracking-wide uppercase" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="rounded-xl text-sm"
                style={{ borderColor: "oklch(0.878 0.015 58)", height: "2.75rem" }}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium tracking-wide uppercase" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-xl text-sm"
                style={{ borderColor: "oklch(0.878 0.015 58)", height: "2.75rem" }}
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-shimmer w-full rounded-xl py-3 text-sm font-medium tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ color: "oklch(0.975 0.005 60)", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
