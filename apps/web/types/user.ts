export interface PublicUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  memberSince: string;
  listingsCount: number;
  rating?: number;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  createdAt: string;
}

export interface PublicUserResponse {
  user: PublicUser;
  listings: Listing[];
}
