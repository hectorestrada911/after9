export type HostEventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  ticket_price: number;
  tickets_available: number;
  visibility: "public" | "private";
  age_restriction: "all_ages" | "age_18_plus" | "age_21_plus";
  dress_code: string | null;
  instructions: string | null;
  location_note: string | null;
};

export type OrderRow = {
  id: string;
  buyer_name: string;
  buyer_email: string;
  quantity: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

export type WorkspaceBundle =
  | { kind: "unauth" }
  | { kind: "no_profile" }
  | { kind: "missing" }
  | {
      kind: "ok";
      event: HostEventRow;
      orders: OrderRow[];
      ticketsTotal: number;
      ticketsCheckedIn: number;
    };
