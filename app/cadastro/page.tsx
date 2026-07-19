"use client";

import { useRouter } from "next/navigation";
import { AuthTabs } from "@/components/auth-tabs";
import type { User } from "@/lib/api";

export default function CadastroPage() {
  const router = useRouter();

  function handleSuccess(user: User) {
    router.push(user.role === "ADMIN" ? "/admin/pedidos" : "/inscricao");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <AuthTabs initialTab="register" onSuccess={handleSuccess} />
    </div>
  );
}
