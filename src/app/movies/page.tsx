import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/types";

export const metadata: Metadata = {
  title: "作品一覧｜映画・ドラマを探す",
  description: "みんなの映画館に掲載している映画・ドラマの作品一覧です。気になる作品が「どのVODで見れるか」をまとめてチェックできます。",
};

export default async function MoviesPage() {
  const [{ data: movies }, { data: flat }] = await Promise.all([
    supabase.from("movies").select("id, title, slug, release_year, country, poster_url").order("release_year", { ascending: false }),
    supabase.from("movie_availability").select("movie_id").eq("availability_type", "見放題").eq("is_available", true),
  ]);

  const flatSet = new Set((flat ?? []).map((r) => r.movie_id));
  const list = (movies as Movie[] | null) ?? [];

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>作品一覧</h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7 }}>
            掲載中の映画・ドラマ <strong style={{ color: "var(--fg)" }}>{list.length}作品</strong>。
            気になる作品の「どこで見れる？」をチェックして、配信中のVODで今すぐ楽しめます。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px" }}>
        <div className="movie-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {list.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.slug}`} style={{ display: "block", textDecoration: "none" }}>
              <div style={{ aspectRatio: "2/3", borderRadius: 12, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)", marginBottom: 8, border: "1px solid var(--border)" }}>
                {movie.poster_url ? (
                  <Image src={movie.poster_url} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="220px" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 40, opacity: 0.3 }}>🎬</span></div>
                )}
                {flatSet.has(movie.id) && (
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, backgroundColor: "rgba(31,122,70,0.92)", color: "#fff" }}>
                    見放題あり
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }} className="line-clamp-2">{movie.title}</p>
              <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>{[movie.release_year ? `${movie.release_year}年` : null, movie.country].filter(Boolean).join(" · ")}</p>
            </Link>
          ))}
        </div>
        {list.length === 0 && <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "80px 0" }}>作品を準備中です。</p>}
      </div>
    </div>
  );
}
