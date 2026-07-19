// ============================================================
// LearnSphere — shared domain types
// These mirror the Postgres schema in supabase/migrations.
// For fully generated types, run `npm run db:types` once the
// Supabase project is linked (see README).
// ============================================================

export type UserRole = "student" | "instructor" | "admin" | "support";
export type CourseStatus = "draft" | "published" | "archived";
export type LessonType = "video" | "pdf" | "quiz" | "assignment";
export type OrderStatus = "created" | "paid" | "failed" | "refunded";
export type PaymentGateway = "razorpay" | "cashfree";
export type WithdrawStatus = "pending" | "approved" | "rejected" | "paid";
export type Language = "en" | "bn";

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  bio: string | null;
  language: Language;
  referral_code: string;
  referred_by: string | null;
  streak_count: number;
  last_activity_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  display_order: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  category_id: string | null;
  instructor_id: string;
  price: number;
  discount_price: number | null;
  currency: string;
  level: "beginner" | "intermediate" | "advanced" | null;
  language: string;
  status: CourseStatus;
  duration_minutes: number;
  total_students: number;
  average_rating: number;
  total_reviews: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // joined fields (populated by API layer, not raw columns)
  category?: Category;
  instructor?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  display_order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  type: LessonType;
  video_url: string | null;
  video_duration_seconds: number | null;
  pdf_url: string | null;
  content: string | null;
  is_preview: boolean;
  display_order: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  order_id: string | null;
  enrolled_at: string;
  completed_at: string | null;
  progress_percent: number;
  course?: Course;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  user?: Pick<Profile, "full_name" | "avatar_url">;
}

export interface Order {
  id: string;
  user_id: string;
  course_id: string;
  coupon_id: string | null;
  base_amount: number;
  discount_amount: number;
  final_amount: number;
  currency: string;
  gateway: PaymentGateway;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  status: OrderStatus;
  invoice_number: string | null;
  invoice_url: string | null;
  referral_code_used: string | null;
  created_at: string;
  paid_at: string | null;
  course?: Pick<Course, "title" | "thumbnail_url" | "slug">;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "flat" | "percent";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  applicable_course_ids: string[] | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: "referral_commission" | "withdrawal" | "refund_adjustment" | "admin_adjustment";
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  order_id: string;
  commission_amount: number;
  status: "credited" | "reversed";
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  payout_method_id: string | null;
  status: WithdrawStatus;
  admin_note: string | null;
  requested_at: string;
  processed_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: "info" | "payment" | "course" | "referral" | "system";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
