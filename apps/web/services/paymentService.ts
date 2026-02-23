import { Payment } from "../types/payment";

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_1",
    user_id: "user_123",
    listing_name: "Modern Downtown Apartment",
    amount: 1500,
    status: "completed",
    transaction_hash: "9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
    network: "testnet",
    created_at: new Date("2024-02-15T10:30:00Z").toISOString(),
  },
  {
    id: "pay_2",
    user_id: "user_123",
    listing_name: "Cozy Studio near Park",
    amount: 850,
    status: "pending",
    transaction_hash: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    network: "testnet",
    created_at: new Date("2024-02-20T14:15:00Z").toISOString(),
  },
  {
    id: "pay_3",
    user_id: "user_123",
    listing_name: "Luxury Beachfront Condo",
    amount: 3200,
    status: "failed",
    transaction_hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    network: "mainnet",
    created_at: new Date("2024-01-05T09:00:00Z").toISOString(),
  },
  {
    id: "pay_4",
    user_id: "user_123",
    listing_name: "Suburban Family Home",
    amount: 2100,
    status: "completed",
    transaction_hash: "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    network: "testnet",
    created_at: new Date("2024-03-01T16:45:00Z").toISOString(),
  },
  {
    id: "pay_5",
    user_id: "user_123",
    listing_name: "Urban Loft",
    amount: 1200,
    status: "completed",
    transaction_hash: "0000000000000000000000000000000000000000000000000000000000000001",
    network: "testnet",
    created_at: new Date("2024-03-10T11:20:00Z").toISOString(),
  },
];

export async function getUserPayments(userId: string): Promise<Payment[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real app, we would filter by userId. 
  // For this mock, we'll return all mock payments if userId matches, 
  // or a subset if we wanted to test different scenarios.
  // Here we just return all of them sorted by date DESC.
  
  return [...MOCK_PAYMENTS].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
