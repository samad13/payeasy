import { PublicUserResponse } from "@/types/user";

const MOCK_USERS: PublicUserResponse[] = [
  {
    user: {
      id: "user-1",
      username: "alice_wonder",
      avatarUrl: "https://i.pravatar.cc/150?u=alice_wonder",
      bio: "Avid traveler and property enthusiast. Always looking for unique stays.",
      memberSince: "2023-01-15T00:00:00.000Z",
      listingsCount: 2,
      rating: 4.8,
    },
    listings: [
      {
        id: "listing-1",
        title: "Cozy Downtown Apartment",
        price: 120,
        imageUrl: "/images/airbnb1.jpg",
        createdAt: "2023-05-20T10:00:00.000Z",
      },
      {
        id: "listing-2",
        title: "Modern Loft with City View",
        price: 180,
        imageUrl: "/images/airbnb2.jpg",
        createdAt: "2023-06-15T14:30:00.000Z",
      },
    ],
  },
  {
    user: {
      id: "user-2",
      username: "bob_builder",
      avatarUrl: null,
      bio: "Renovating homes and renting them out. Ask me about long-term stays.",
      memberSince: "2022-11-10T00:00:00.000Z",
      listingsCount: 1,
      rating: 4.5,
    },
    listings: [
      {
        id: "listing-3",
        title: "Suburban Family Home",
        price: 250,
        imageUrl: "/images/airbnb3.jpg",
        createdAt: "2023-03-10T09:00:00.000Z",
      },
    ],
  },
  {
    user: {
      id: "user-3",
      username: "charlie_chef",
      avatarUrl: "https://i.pravatar.cc/150?u=charlie_chef",
      bio: "Foodie and host. My places are near the best restaurants!",
      memberSince: "2023-08-05T00:00:00.000Z",
      listingsCount: 0,
      rating: 5.0,
    },
    listings: [],
  },
];

export function getMockUserById(id: string): PublicUserResponse | null {
  const mockUser = MOCK_USERS.find((u) => u.user.id === id);
  return mockUser || null;
}
