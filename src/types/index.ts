export type AvailabilityType = "見放題" | "レンタル" | "購入" | "配信なし" | "不明";
export type ArticleStatus = "draft" | "published";

export interface Movie {
  id: string;
  title: string;
  slug: string;
  original_title: string | null;
  release_year: number | null;
  description: string | null;
  summary: string | null;
  runtime_minutes: number | null;
  country: string | null;
  age_rating: string | null;
  poster_url: string | null;
  created_at: string;
  updated_at: string;
  genres?: Genre[];
  scenes?: Scene[];
  availability?: MovieAvailability[];
}

export interface VodService {
  id: string;
  name: string;
  slug: string;
  monthly_price: number | null;
  free_trial_text: string | null;
  official_url: string;
  affiliate_url: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovieAvailability {
  id: string;
  movie_id: string;
  vod_service_id: string;
  availability_type: AvailabilityType;
  is_available: boolean;
  note: string | null;
  checked_at: string | null;
  vod_service?: VodService;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Scene {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  article_type: string | null;
  thumbnail_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  updated_at: string;
  movies?: Movie[];
}

export interface ArticleMovie {
  article_id: string;
  movie_id: string;
  display_order: number;
  comment: string | null;
}

export interface AffiliateLink {
  id: string;
  vod_service_id: string;
  asp_name: string | null;
  campaign_name: string | null;
  url: string;
  is_active: boolean;
  reward_memo: string | null;
  created_at: string;
  updated_at: string;
  vod_service?: VodService;
}
