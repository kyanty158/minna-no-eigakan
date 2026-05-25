import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Scene, Movie } from "@/types";

type Props = { params: Promise<{ slug: string }> };

const INTRO: Record<string, string> = {
  couple: "一緒に笑って、キュンとして。二人の時間がもっと特別になる映画を集めました。",
  "home-date": "ソファでまったり。気まずくならず二人で楽しめるおうちデート映画。",
  "rainy-day": "雨音をBGMに。しっとり・ほっこり、雨の日の気分に寄り添う名作。",
  "before-dating": "気になるあの人と距離が縮まる、恋の始まりを描いた映画。",
  anniversary: "記念日の特別な夜に。ロマンチックな余韻に浸れる作品を厳選。",
  "after-breakup": "つらい失恋の夜にそっと寄り添う、泣けて前を向ける作品。",
  "not-awkward": "誰と観ても安心。気まずいシーンが少なく楽しめる映画。",
  "cry-alone": "一人で思いきり泣きたい夜に。涙腺崩壊の感動作ばかり。",
  "long-distance": "離れていても想い合う。遠距離恋愛中に刺さる作品。",
  heartwarming: "心がじんわり温まる、優しい気持ちになれる映画。",
};

async function getScene(slug: string) {
  const { data } = await supabase.from("scenes").select("*").eq("slug", slug).single();
  return data as Scene | null;
}

async function getData(sceneId: string) {
  const [{ data: links }, { data: flat }] = await Promise.all([
    supabase.from("movie_scenes").select("movie:movies(id, title, slug, release_year, country, poster_url)").eq("scene_id", sceneId),
    supabase.from("movie_availability").select("movie_id").eq("availability_type", "見放題").eq("is_available", true),
  ]);
  const movies = ((links as unknown as { movie: Movie }[]) ?? []).map((x) => x.movie).filter(Boolean);
  const flatSet = new Set((flat ?? []).map((r) => r.movie_id));
  return { movies, flatSet };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scene = await getScene(slug);
  if (!scene) return {};
  const canonical = `https://minna-no-eigakan.vercel.app/scene/${slug}`;
  const title = `${scene.name}におすすめの映画・ドラマ一覧｜VOD配信情報つき`;
  const description = `${scene.name}にぴったりな映画・ドラマを厳選紹介。${INTRO[slug] ?? ""}U-NEXT・DMM TVなどどのVODで見れるかもチェックできます。`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ScenePage({ params }: Props) {
  const { slug } = await params;
  const scene = await getScene(slug);
  if (!scene) notFound();

  const { movies, flatSet } = await getData(scene.id);

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
            <Link href="/" style={{ color: "var(--fg-muted)" }}>ホーム</Link><span>›</span>
            <span>{scene.name}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{scene.name}映画・ドラマ</h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7 }}>
            {INTRO[slug] ?? `${scene.name}にぴったりな映画・ドラマを紹介します。`}（全{movies.length}作品）
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

        {/* VOD CTA */}
        <div style={{ marginTop: 40, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>紹介した映画をすぐ観たい方へ</p>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18 }}>無料トライアルのあるVODなら、今すぐ無料で視聴を始められます。</p>
          <Link href="/vod" style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "13px 32px", borderRadius: 10, textDecoration: "none" }}>
            おすすめVODを比較する →
          </Link>
        </div>
      </div>
    </div>
  );
}
