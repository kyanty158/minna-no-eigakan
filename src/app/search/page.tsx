import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/types";
import SearchBox from "@/components/ui/SearchBox";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `「${q}」の検索結果` : "作品を検索";
  return {
    title,
    description: "みんなの映画館に掲載中の映画・ドラマをタイトルで検索できます。気になる作品がどのVODで見れるかもチェックできます。",
    robots: { index: false, follow: true },
    alternates: { canonical: "https://minna-no-eigakan.vercel.app/search" },
  };
}

async function searchMovies(q: string): Promise<{ movies: Movie[]; flatSet: Set<string> }> {
  const pattern = `%${q}%`;
  const [{ data: movies }, { data: flat }] = await Promise.all([
    supabase
      .from("movies")
      .select("id, title, slug, release_year, country, poster_url")
      .or(`title.ilike.${pattern},original_title.ilike.${pattern}`)
      .order("release_year", { ascending: false })
      .limit(60),
    supabase.from("movie_availability").select("movie_id").eq("availability_type", "見放題").eq("is_available", true),
  ]);
  const flatSet = new Set((flat ?? []).map((r) => r.movie_id));
  return { movies: (movies as Movie[] | null) ?? [], flatSet };
}

const POPULAR = ["恋空", "君の膵臓をたべたい", "ラ・ラ・ランド", "アメリ", "猟奇的な彼女"];

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const { movies, flatSet } = query ? await searchMovies(query) : { movies: [], flatSet: new Set<string>() };

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "60vh" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--fg-muted)", marginBottom: 14 }}>
            <Link href="/" style={{ color: "var(--fg-muted)" }}>ホーム</Link><span>›</span>
            <span>検索</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>作品を検索</h1>
          <SearchBox variant="hero" initialValue={query} autoFocus placeholder="作品名で探す（例: 恋空）" />
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px 48px" }}>
        {query ? (
          <>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20 }}>
              「<strong style={{ color: "var(--fg)" }}>{query}</strong>」の検索結果：
              <strong style={{ color: "var(--fg)" }}>{movies.length}件</strong>
            </p>

            {movies.length > 0 ? (
              <div className="movie-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
                {movies.map((movie) => (
                  <Link key={movie.id} href={`/movies/${movie.slug}`} style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ aspectRatio: "2/3", borderRadius: 12, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)", marginBottom: 8, border: "1px solid var(--border)" }}>
                      {movie.poster_url ? (
                        <Image src={movie.poster_url} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="220px" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 40, opacity: 0.3 }}>🎬</span></div>
                      )}
                      {flatSet.has(movie.id) && (
                        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, backgroundColor: "rgba(31,122,70,0.92)", color: "#fff" }}>見放題あり</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }} className="line-clamp-2">{movie.title}</p>
                    <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>{[movie.release_year ? `${movie.release_year}年` : null, movie.country].filter(Boolean).join(" · ")}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🔍</p>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>「{query}」に一致する作品が見つかりませんでした</p>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 24 }}>
                  別のキーワードでお試しいただくか、一覧から探してみてください。
                </p>
                <Link href="/movies" style={{ display: "inline-block", backgroundColor: "var(--btn-dark)", color: "#fff", padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
                  作品一覧を見る →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20 }}>観たい作品のタイトルを入力してください。</p>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 10 }}>人気の検索ワード</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {POPULAR.map((kw) => (
                <Link key={kw} href={`/search?q=${encodeURIComponent(kw)}`} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 20, border: "1px solid var(--border)", color: "var(--fg-muted)", backgroundColor: "var(--bg-card)" }}>
                  {kw}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
