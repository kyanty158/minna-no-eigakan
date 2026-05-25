import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://minna-no-eigakan.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [moviesRes, genresRes, scenesRes, articlesRes] = await Promise.all([
    supabase.from("movies").select("slug, updated_at"),
    supabase.from("genres").select("slug"),
    supabase.from("scenes").select("slug"),
    supabase.from("articles").select("slug, updated_at").eq("status", "published"),
  ]);

  const movieUrls: MetadataRoute.Sitemap = (moviesRes.data ?? []).map((m) => ({
    url: `${BASE_URL}/movies/${m.slug}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const genreUrls: MetadataRoute.Sitemap = (genresRes.data ?? []).map((g) => ({
    url: `${BASE_URL}/genre/${g.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const sceneUrls: MetadataRoute.Sitemap = (scenesRes.data ?? []).map((s) => ({
    url: `${BASE_URL}/scene/${s.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleUrls: MetadataRoute.Sitemap = (articlesRes.data ?? []).map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/movies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/articles`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/vod`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...movieUrls,
    ...genreUrls,
    ...sceneUrls,
    ...articleUrls,
  ];
}
