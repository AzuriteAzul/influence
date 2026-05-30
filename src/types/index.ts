export interface Influencer {
  id: string;
  name: string;
  slug: string;
  category: string;
  bio: string | null;
  profile_image_url: string | null;
  social_links: Record<string, string>;
  website: string | null;
  status: "pending" | "generating" | "pending_review" | "approved" | "rejected";
  rejection_reason: string | null;
  submitted_by: string | null;
  claimed_by: string | null;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  influencer_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface InfluencerWithStats extends Influencer {
  rating_distribution?: Record<number, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SortOption = "highest_rated" | "most_reviewed" | "newest";
