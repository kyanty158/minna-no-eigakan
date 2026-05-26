import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/types";
import MoviesBrowser, { type BrowserMovie } from "@/components/movies/MoviesBrowser";

export const metadata: Metadata = {
  title: "作品一覧｜映画・ドラマを探す",
  description: "みんなの映画館に掲載している映画・ドラマの作品一覧です。ジャンル・制作国・見放題で絞り込み、気になる作品が「どのVODで見れるか」をまとめてチェックできます。",
  alternates: { canonical: "https://minna-no-eigakan.vercel.app/movies" },
};

// ジャンル表示順
const GENRE_ORDER = ["romance", "youth", "tearjerker", "korean-drama", "anime", "comedy", "horror", "suspense"];
// 制作国の表示順（掲載数の多い順を想定）
const COUNTRY_ORDER = ["日本", "アメリカ", "韓国", "フランス", "イギリス", "台湾", "中国", "イタリア"];

export default async function MoviesPage() {
  const [{ data: movies }, { data: flat }, { data: genreLinks }, { data: genres }] = await Promise.all([
    supabase.from("movies").select("id, title, slug, release_year, country, poster_url"),
    supabase.from("movie_availability").select("movie_id").eq("availability_type", "見放題").eq("is_available", true),
    supabase.from("movie_genres").select("movie_id, genre_id"),
    supabase.from("genres").select("id, name, slug"),
  ]);

  const list = (movies as Movie[] | null) ?? [];
  const flatSet = new Set((flat ?? []).map((r) => r.movie_id));

  // genre_id -> slug/name
  const genreById = new Map<string, { slug: string; name: string }>();
  for (const g of genres ?? []) genreById.set(g.id, { slug: g.slug, name: g.name });

  // movie_id -> genreSlugs
  const genreSlugsByMovie = new Map<string, string[]>();
  for (const link of genreLinks ?? []) {
    const g = genreById.get(link.genre_id);
    if (!g) continue;
    const arr = genreSlugsByMovie.get(link.movie_id) ?? [];
    arr.push(g.slug);
    genreSlugsByMovie.set(link.movie_id, arr);
  }

  const browserMovies: BrowserMovie[] = list.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    release_year: m.release_year,
    country: m.country,
    poster_url: m.poster_url,
    isFlat: flatSet.has(m.id),
    genreSlugs: genreSlugsByMovie.get(m.id) ?? [],
  }));

  // 実在するジャンルのみ、定義順で
  const presentGenreSlugs = new Set(browserMovies.flatMap((m) => m.genreSlugs));
  const genreOptions = GENRE_ORDER
    .map((slug) => {
      const g = (genres ?? []).find((x) => x.slug === slug);
      return g ? { slug: g.slug, name: g.name } : null;
    })
    .filter((g): g is { slug: string; name: string } => g !== null && presentGenreSlugs.has(g.slug));

  // 実在する国のみ、定義順で（その他は末尾）
  const presentCountries = new Set(browserMovies.map((m) => m.country).filter((c): c is string => !!c));
  const orderedCountries = [
    ...COUNTRY_ORDER.filter((c) => presentCountries.has(c)),
    ...[...presentCountries].filter((c) => !COUNTRY_ORDER.includes(c)).sort((a, b) => a.localeCompare(b, "ja")),
  ];

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>作品一覧</h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7 }}>
            掲載中の映画・ドラマ <strong style={{ color: "var(--fg)" }}>{list.length}作品</strong>。
            ジャンル・制作国・見放題で絞り込んで、配信中のVODで今すぐ楽しめます。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px 48px" }}>
        {browserMovies.length > 0 ? (
          <MoviesBrowser movies={browserMovies} genres={genreOptions} countries={orderedCountries} />
        ) : (
          <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "80px 0" }}>作品を準備中です。</p>
        )}
      </div>
    </div>
  );
}
