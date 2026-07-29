export type TestimonialStatus = "pending" | "approved" | "rejected";
export type Sentiment = "positive" | "neutral" | "negative";

export interface Testimonial {
  id: string;
  name: string;
  email: string;
  company: string | null;
  content: string;
  rating: number;
  photo_url: string | null;
  status: TestimonialStatus;
  sentiment: Sentiment | null;
  created_at: string;
  updated_at: string;
}

/** Shape the public wall/widget are allowed to see — no email, ever. */
export type PublicTestimonial = Omit<Testimonial, "email">;

export interface NewTestimonialInput {
  name: string;
  email: string;
  company?: string;
  content: string;
  rating: number;
  photo_url?: string;
}

export interface Settings {
  id: 1;
  business_name: string;
  accent_color: string;
  layout: "grid" | "list";
  updated_at: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
