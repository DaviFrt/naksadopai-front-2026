"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { AuthTabs } from "@/components/auth-tabs";
import type { User } from "@/lib/api";

export default function CadastroPage() {
  const router = useRouter();

  function handleSuccess(user: User) {
    router.push(user.role === "ADMIN" ? "/admin/pedidos" : "/inscricao");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Image src="/logo.png" alt="Na Ksa do Pai" width={220} height={40} priority />
      <AuthTabs initialTab="register" onSuccess={handleSuccess} />
    </div>
  );
}
