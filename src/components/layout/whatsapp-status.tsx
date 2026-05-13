"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { connectWhatsApp, getWhatsAppStatus } from "@/services/whatsapp";

const STATUS_INFO: Record<string, { label: string; color: string; dot: string }> = {
  connected:    { label: "Conectado",    color: "oklch(0.380 0.060 150)",       dot: "oklch(0.380 0.060 150)" },
  connecting:   { label: "Conectando",   color: "oklch(0.600 0.090 65)",        dot: "oklch(0.600 0.090 65)" },
  disconnected: { label: "Desconectado", color: "oklch(0.540 0.200 25)",        dot: "oklch(0.540 0.200 25)" },
  unknown:      { label: "Desconhecido", color: "oklch(0.560 0.025 55)",        dot: "oklch(0.560 0.025 55)" },
};

export function WhatsAppStatus() {
  const [open, setOpen] = useState(false);

  const { data: status, refetch: refetchStatus, isFetching } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: getWhatsAppStatus,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  const connectMut = useMutation({
    mutationFn: connectWhatsApp,
  });

  const currentStatus = status?.status || "unknown";
  const info = STATUS_INFO[currentStatus];

  async function handleOpen() {
    setOpen(true);
    // If disconnected, fetch QR right away
    if (currentStatus !== "connected" && !connectMut.isPending) {
      connectMut.mutate();
    }
  }

  function handleRefresh() {
    refetchStatus();
    if (currentStatus !== "connected") {
      connectMut.mutate();
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium tracking-wide transition-all duration-200"
        style={{
          color: "oklch(0.920 0.010 60 / 0.85)",
          background: "oklch(0.280 0.022 48 / 0.4)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.300 0.025 48 / 0.6)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.280 0.022 48 / 0.4)"; }}
        title={`WhatsApp: ${info.label}`}
      >
        <MessageCircle className="h-[16px] w-[16px]" />
        <span className="flex-1 text-left">WhatsApp</span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: info.dot,
              boxShadow: `0 0 6px ${info.dot}`,
              animation: currentStatus === "connecting" ? "pulse 1.5s infinite" : undefined,
            }}
          />
          <span className="text-[10px]" style={{ color: info.color }}>
            {info.label}
          </span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-fade-in"
            style={{ background: "oklch(0.180 0.022 44 / 0.55)", backdropFilter: "blur(8px)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-md animate-fade-up rounded-2xl overflow-hidden"
            style={{
              background: "var(--cream)",
              border: "1px solid oklch(0.520 0.120 45 / 0.12)",
              boxShadow: "0 24px 80px oklch(0.220 0.025 45 / 0.18)",
            }}
          >
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, var(--terracotta), oklch(0.600 0.100 50))" }} />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-7 py-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageCircle className="h-5 w-5" style={{ color: "var(--brown-deep)" }} />
                <h2 className="text-lg font-semibold" style={{ color: "var(--brown-deep)", fontFamily: "var(--font-brand)" }}>
                  WhatsApp da Clínica
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${info.color}1a`, color: info.color }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: info.dot, animation: currentStatus === "connecting" ? "pulse 1.5s infinite" : undefined }}
                />
                {info.label}
              </div>

              {currentStatus === "connected" ? (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-14 w-14" style={{ color: "var(--green)" }} />
                  <p className="text-sm" style={{ color: "var(--brown-medium)" }}>
                    Tudo certo! O WhatsApp da clínica está conectado e enviando as mensagens normalmente.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <p className="text-sm" style={{ color: "var(--brown-medium)" }}>
                    Para conectar, abra o WhatsApp da clínica no celular, vá em <strong>Aparelhos conectados</strong> e leia o QR code abaixo:
                  </p>
                  <div
                    className="mx-auto rounded-xl flex items-center justify-center"
                    style={{
                      background: "white",
                      border: "1px solid var(--border)",
                      width: 260,
                      height: 260,
                    }}
                  >
                    {connectMut.isPending ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Gerando QR Code...</p>
                      </div>
                    ) : connectMut.data?.qrcode ? (
                      <img
                        src={connectMut.data.qrcode.startsWith("data:") ? connectMut.data.qrcode : `data:image/png;base64,${connectMut.data.qrcode}`}
                        alt="QR Code WhatsApp"
                        className="rounded-lg"
                        style={{ width: 240, height: 240 }}
                      />
                    ) : (
                      <p className="text-xs px-4 text-center" style={{ color: "var(--muted-foreground)" }}>
                        Clique em &quot;Atualizar&quot; para gerar o QR Code.
                      </p>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                    O QR code expira em alguns segundos. Se não conseguir ler, clique em Atualizar.
                  </p>
                </div>
              )}
            </div>

            <div
              className="flex items-center justify-end gap-2 px-7 py-4"
              style={{ borderTop: "1px solid oklch(0.520 0.120 45 / 0.06)" }}
            >
              <button
                onClick={handleRefresh}
                disabled={isFetching || connectMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ color: "var(--terracotta)", background: "oklch(0.520 0.120 45 / 0.08)" }}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching || connectMut.isPending ? "animate-spin" : ""}`} />
                Atualizar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
