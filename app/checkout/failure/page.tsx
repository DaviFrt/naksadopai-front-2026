import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutFailurePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
        Pagamento
      </span>
      <h1 className="font-serif text-3xl font-bold text-foreground">Pagamento não aprovado</h1>
      <p className="max-w-sm text-muted-foreground">
        Algo deu errado com seu pagamento. Você pode tentar novamente.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" render={<Link href="/minhas-inscricoes" />}>
          Minhas inscrições
        </Button>
        <Button render={<Link href="/inscricao" />}>Tentar novamente</Button>
      </div>
    </div>
  );
}
