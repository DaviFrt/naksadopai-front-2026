const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      // Evita a página de aviso do ngrok (plano grátis) substituir a resposta
      // JSON real quando a API está exposta via túnel.
      "ngrok-skip-browser-warning": "true",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type Gender = "MALE" | "FEMALE";
export type ShirtSize = "PP" | "P" | "M" | "G" | "GG" | "XG" | "XGG";
// Tamanhos extras (infantil, por idade) — só usados em camisetas avulsas,
// nunca na inscrição de participantes do evento.
export type InfantShirtSize = "INF2" | "INF4" | "INF6" | "INF8" | "INF10" | "INF12" | "INF14";
export type AvulsaShirtSize = ShirtSize | InfantShirtSize;

export const AVULSA_SHIRT_SIZES: AvulsaShirtSize[] = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "XGG",
  "INF2",
  "INF4",
  "INF6",
  "INF8",
  "INF10",
  "INF12",
  "INF14",
];

export const SHIRT_SIZE_LABEL: Record<AvulsaShirtSize, string> = {
  PP: "PP",
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
  XG: "XG",
  XGG: "XGG",
  INF2: "2 anos",
  INF4: "4 anos",
  INF6: "6 anos",
  INF8: "8 anos",
  INF10: "10 anos",
  INF12: "12 anos",
  INF14: "14 anos",
};
export type UserRole = "ADMIN" | "STAFF" | "USER";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "EXEMPT"
  | "SHIRT_CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";
export type PaymentMethod = "INFINITE_PAY" | "PIX_MANUAL" | "CASH" | "CARD_MANUAL";
export type OrderSource = "SITE" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Batch {
  id: string;
  name: string;
  price: string;
  end_date: string;
  min_participant_age: number | null;
  includes_shirt: boolean;
}

export type PublicBatchStatus = "em-breve" | "ativo" | "esgotado";

export interface PublicBatch {
  id: string;
  name: string;
  price: string;
  start_date: string;
  end_date: string;
  status: PublicBatchStatus;
  includes_shirt: boolean;
}

export interface Church {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  birthDate: string;
  gender: Gender;
  shirtSize: ShirtSize | null;
  churchId: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  participants: Participant[];
}

export interface AdminOrder extends Order {
  userId: string;
  batchId: string;
  source: OrderSource;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
}

export interface AdminOrdersResponse {
  data: AdminOrder[];
  page: number;
  page_size: number;
  total: number;
}

export interface AdminBatch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  price: string;
  includesShirt: boolean;
}

export type ShirtReport = Record<Gender, Partial<Record<AvulsaShirtSize, number>>>;

export interface ShirtsReportResponse {
  total: ShirtReport;
  avulsas: ShirtReport;
}

export interface ChurchReportParticipant {
  id: string;
  name: string;
  birthDate: string;
  shirtSize: ShirtSize | null;
  gender: Gender;
}

export interface ChurchReport {
  id: string;
  name: string;
  participant_count: number;
  participants: ChurchReportParticipant[];
}

export interface FinancialReport {
  total_paid: number;
  total_pending: number;
  total_pending_guest_church: number;
  total_exempt: number;
  by_payment_method: Record<string, number>;
  shirt_orders: {
    total_paid: number;
    total_pending: number;
    total_exempt: number;
  };
}

export interface ShirtOrderItem {
  id: string;
  name: string;
  gender: Gender;
  shirtSize: AvulsaShirtSize;
}

export interface ShirtOrder {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  totalAmount: string;
  createdAt: string;
  items: ShirtOrderItem[];
}
