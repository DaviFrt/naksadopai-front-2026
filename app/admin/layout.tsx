"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/use-session";

const NAV_ITEMS = [
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/igrejas", label: "Igrejas" },
  { href: "/admin/lotes", label: "Lotes" },
  { href: "/admin/relatorios", label: "Relatórios" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <p className="text-brand-cream/70">
          Você não tem permissão para acessar esta área.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-tan/20 px-6 py-4">
        <nav className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                pathname.startsWith(item.href)
                  ? "text-brand-gold"
                  : "text-brand-cream/60 hover:text-brand-tan"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => logout().then(() => router.push("/login"))}
          className="text-sm text-brand-cream/60 hover:text-red-400"
        >
          Sair
        </button>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
