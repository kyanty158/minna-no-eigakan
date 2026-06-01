import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Genre, Movie } from "@/types";

const BASE_URL = "https://minna-no-eigakan.vercel.app";
type Props = { params: Promise<{ slug: string }> };

const INTRO: Record<string, string> = {
  romance: "胸キュンから切ない純愛まで、心を動かす恋愛映画・ドラマを集めました。",
  youth: "甘酸っぱくて眩しい、青春のきらめきが詰まった作品を紹介します。",
  tearjerker: "思いきり泣いてスッキリしたい夜に。涙腺崩壊の感動作ばかりです。",
  "korean-drama": "話題の韓国映画・ドラマ。キュンと泣けるラブストーリーを厳選。",
  anime: "新海誠作品からジブリまで、大人も楽しめるアニメの名作を集めました。",
  comedy: "笑って気軽に楽しめる、気まずくならないコメディ作品を紹介します。",
  horror: "ゾクッとする恐怖を味わいたい人へ。デートでも盛り上がるホラー。",
  suspense: "先の読めない展開にハマる、考察も楽しいサスペンス・スリラー。",
};

async function getGenre(slug: string) {
  const { data } = await supabase.from("genres").select("*").eq("slug", slug).single();
  return data as Genre | null;
}

async function getFirstPoster(genreId: string): Promise<string | null> {
  const { data } = await supabase
    .from("movie_genres")
    .select("movie:movies(poster_url)")
    .eq("genre_id", genreId)
    .limit(10);
  return (
    ((data as unknown as { movie: { poster_url: string | null } }[]) ?? [])
      .map((x) => x.movie?.poster_url)
      .find(Boolean) ?? null
  );
}

async function getData(genreId: string) {
  const [{ data: links }, { data: flat }] = await Promise.all([
    supabase.from("movie_genres").select("movie:movies(id, title, slug, release_year, country, poster_url)").eq("genre_id", genreId),
    supabase.from("movie_availability").select("movie_id").eq("availability_type", "見放題").eq("is_available", true),
  ]);
  const movies = ((links as unknown as { movie: Movie }[]) ?? []).map((x) => x.movie).filter(Boolean);
  const flatSet = new Set((flat ?? []).map((r) => r.movie_id));
  return { movies, flatSet };
}

export async function generateStaticParams() {
  const { data } = await supabase.from("genres").select("slug");
  return (data ?? []).map((g: { slug: string }) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) return {};
  const canonical = `${BASE_URL}/genre/${slug}`;
  const title = `${genre.name}映画・ドラマおすすめ一覧｜VOD配信情報つき`;
  const description = `${genre.name}ジャンルの映画・ドラマを一覧で紹介。${INTRO[slug] ?? ""}各作品がどのVODで見れるかもチェックできます。`;
  const ogImage = await getFirstPoster(genre.id);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 500, height: 750, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image", title, description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) notFound();

  const { movies, flatSet } = await getData(genre.id);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: `${genre.name}の映画・ドラマ`, item: `${BASE_URL}/genre/${slug}` },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${genre.name}映画・ドラマおすすめ一覧`,
    url: `${BASE_URL}/genre/${slug}`,
    itemListElement: movies.slice(0, 20).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/movies/${m.slug}`,
      name: m.title,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <div style={{ backgroundColor: "var(--bg)" }}>
        <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
              <Link href="/" style={{ color: "var(--fg-muted)" }}>ホーム</Link><span>›</span>
              <span>{genre.name}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{genre.name}の映画・ドラマ</h1>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7 }}>
              {INTRO[slug] ?? `${genre.name}の作品を集めました。`}（全{movies.length}作品）
            </p>
          </div>
        </section>

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px" }}>
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
          {movies.length === 0 && <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "80px 0" }}>作品を準備中です。</p>}
        </div>

        {/* VOD CTA */}
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 48px" }}>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>紹介した映画をすぐ観たい方へ</p>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18 }}>無料トライアルのあるVODなら、今すぐ無料で視聴を始められます。</p>
            <Link href="/vod" style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "13px 32px", borderRadius: 10, textDecoration: "none" }}>
              おすすめVODを比較する →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
