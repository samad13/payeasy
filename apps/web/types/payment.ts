export interface Payment {
  id: string;
  user_id: string;
  listing_name: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  transaction_hash: string;
  network: "testnet" | "mainnet";
  created_at: string;
}
