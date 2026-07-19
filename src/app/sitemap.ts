import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/legal/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const { data: courses } = await supabase
    .from("courses")
    .select("slug, updated_at")
    .eq("status", "published")
    .limit(5000);

  const courseRoutes: MetadataRoute.Sitemap = (courses ?? []).map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
