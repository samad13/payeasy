import { NextResponse } from "next/server";

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = {
    stats: {
      totalUsers: 1284,
      activeListings: 356,
      totalPayments: 892,
      revenue: "$128,450",
    },
    recentActivities: [
      {
        id: "1",
        type: "listing",
        title: "New listing approved: Luxury Beach House",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        link: "/admin/listings/201",
      },
      {
        id: "2",
        type: "payment",
        title: "Payment dispute opened by user #4521",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        link: "/admin/payments/302",
      },
      {
        id: "3",
        type: "message",
        title: "Support ticket: Account verification issue",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        link: "/admin/messages/103",
      },
      {
        id: "4",
        type: "listing",
        title: "Listing flagged for review: Downtown Studio",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        link: "/admin/listings/205",
      },
      {
        id: "5",
        type: "payment",
        title: "Bulk payout processed: 45 transactions",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        link: "/admin/payments/payouts",
      },
      {
        id: "6",
        type: "message",
        title: "New admin notification: System update scheduled",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        link: "/admin/messages/104",
      },
    ],
    systemStatus: {
      database: "operational",
      blockchain: "operational",
      authentication: "operational",
      payments: "degraded",
    },
  };

  return NextResponse.json(data);
}
