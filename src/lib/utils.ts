export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  aprovado: { label: "Aprovado", color: "bg-blue-100 text-blue-800" },
  separado: { label: "Separado", color: "bg-purple-100 text-purple-800" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};
