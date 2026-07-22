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
export type ShirtSize = "PP" | "P" | "M" | "G" | "GG" | "XG";
export type UserRole = "ADMIN" | "STAFF" | "USER";
export type OrderStatus = "PENDING" | "PAID" | "EXEMPT" | "CANCELLED" | "EXPIRED" | "REFUNDED";
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
}

export type PublicBatchStatus = "em-breve" | "ativo" | "esgotado";

export interface PublicBatch {
  id: string;
  name: string;
  price: string;
  start_date: string;
  end_date: string;
  status: PublicBatchStatus;
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
  shirtSize: ShirtSize;
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
}

export type ShirtReport = Record<Gender, Partial<Record<ShirtSize, number>>>;

export interface ChurchReportParticipant {
  id: string;
  name: string;
  birthDate: string;
  shirtSize: ShirtSize;
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
  total_exempt: number;
  by_payment_method: Record<string, number>;
}
