import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main
            className="flex-1 overflow-y-auto p-6 relative"
            style={{
              background: "linear-gradient(160deg, oklch(0.960 0.008 70) 0%, oklch(0.945 0.012 65) 40%, oklch(0.955 0.006 75) 100%)",
            }}
          >
            {/* Decorative glow spots */}
            <div
              className="pointer-events-none absolute top-0 right-0 h-[350px] w-[350px] rounded-full opacity-[0.045]"
              style={{ background: "radial-gradient(circle, oklch(0.520 0.120 45) 0%, transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full opacity-[0.03]"
              style={{ background: "radial-gradient(circle, oklch(0.380 0.060 150) 0%, transparent 70%)" }}
            />
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </Providers>
  );
}
