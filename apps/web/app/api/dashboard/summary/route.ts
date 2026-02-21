import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = {
    user: {
      name: "Michael",
    },
    stats: {
      listingsCount: 12,
      paymentsCount: 5,
      unreadMessages: 3,
    },
    recentActivities: [
      {
        id: "1",
        type: "listing",
        title: "New listing created: Ocean View Apartment",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        link: "/listings/123",
      },
      {
        id: "2",
        type: "payment",
        title: "Payment received for Downtown Loft",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        link: "/payments/456",
      },
      {
        id: "3",
        type: "message",
        title: "New message from Sarah regarding Villa Stay",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        link: "/messages/789",
      },
      {
        id: "4",
        type: "listing",
        title: "Updated listing: Mountain Cabin",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        link: "/listings/101",
      },
      {
        id: "5",
        type: "payment",
        title: "Payout processed to your bank account",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        link: "/payments/payouts",
      },
    ],
  };

  return NextResponse.json(data);
}
