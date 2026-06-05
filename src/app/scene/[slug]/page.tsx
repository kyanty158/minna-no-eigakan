import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Scene, Movie } from "@/types";

const BASE_URL = "https://minna-no-eigakan.vercel.app";
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
  youth: "甘酸っぱくて眩しい、青春のきらめきが詰まった作品を紹介します。",
};

const FAQ: Record<string, { q: string; a: string }[]> = {
  couple: [
    { q: "カップルで見るのにおすすめの映画はどこで見れますか？", a: "Amazon Prime Video（月額600円・30日間無料）やU-NEXT（月額2,189円・31日間無料）で多くのカップル映画が見放題です。無料トライアル中に解約すれば料金はかかりません。" },
    { q: "デートで気まずくならない映画のポイントは？", a: "ラブコメや青春映画など、笑いと感動が混在する作品がおすすめです。過激な暴力描写やR指定シーンが少ない作品を選ぶと安心です。" },
  ],
  "home-date": [
    { q: "おうちデートにおすすめの映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）で自宅にいながら映画を楽しめます。月額600円で見放題作品が多数あります。" },
    { q: "おうちデートで盛り上がる映画ジャンルは？", a: "ラブコメ・アクション・ホラー（怖さを共有）など、リアクションが出やすいジャンルがおすすめです。ホラーは距離が縮まるきっかけにも。" },
  ],
  "after-breakup": [
    { q: "失恋した日に見る映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで泣ける恋愛映画が多数見放題です。『花束みたいな恋をした』『(500)日のサマー』などが人気です。" },
    { q: "振られた夜におすすめの映画は？", a: "『エターナル・サンシャイン』『ビフォア・サンセット』『パスト・ライブス』などがおすすめです。共感できる切ない恋愛映画が心に寄り添ってくれます。" },
    { q: "失恋後に前向きになれる映画は？", a: "『はじまりのうた』『シング・ストリート』など音楽映画や、『プラダを着た悪魔』など自己成長系の作品がおすすめです。" },
  ],
  "cry-alone": [
    { q: "一人で泣ける映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで感動作が多数見放題です。『ショーシャンクの空に』『フォレスト・ガンプ』もAmazon Primeで視聴できます。" },
    { q: "涙腺崩壊の映画のおすすめは？", a: "『世界の中心で愛をさけぶ』『花束みたいな恋をした』『余命10年』などが人気です。日本映画から洋画まで厳選しています。" },
  ],
  "rainy-day": [
    { q: "雨の日に見るのにおすすめの映画は？", a: "しっとりした恋愛映画や、ほっこりする日本映画がおすすめです。『言の葉の庭』『アメリ』などが人気です。Amazon PrimeやU-NEXTで視聴できます。" },
    { q: "雨の日の映画をどこで見れますか？", a: "Amazon Prime Video（30日間無料）が自宅で手軽に視聴するのに最適です。月額600円で見放題作品多数。" },
  ],
  heartwarming: [
    { q: "心温まる映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで心温まる作品が多数配信中です。日本映画・韓国映画・洋画まで幅広く揃っています。" },
    { q: "家族で見られる心温まる映画は？", a: "『みらい』『おおかみこどもの雨と雪』『コーダ あいのうた』などがおすすめです。世代を超えて楽しめる名作ばかりです。" },
  ],
  anniversary: [
    { q: "記念日に見るロマンチックな映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで記念日向けの恋愛映画が多数配信中です。特別な夜を演出する作品を厳選しています。" },
    { q: "記念日デートにおすすめの映画は？", a: "『ラ・ラ・ランド』『ノッティングヒルの恋人』『タイタニック』などが人気です。Amazon PrimeやU-NEXTで視聴できます。" },
  ],
  "long-distance": [
    { q: "遠距離恋愛中に見るおすすめの映画は？", a: "『ビフォア・サンライズ』三部作、『今、会いにゆきます』などが人気です。離れていても想い合う感情を丁寧に描いた作品を集めました。" },
  ],
  "not-awkward": [
    { q: "気まずくない映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）で過激なシーンの少ないコメディ・ラブコメ・青春映画が多数視聴できます。" },
  ],
  "before-dating": [
    { q: "付き合う前に見るおすすめの映画はどこで見れますか？", a: "Amazon Prime VideoやU-NEXTで恋の始まりを描いた作品が多数配信中です。一緒に観て気持ちが高まる作品を厳選しています。" },
  ],
};

async function getScene(slug: string) {
  const { data } = await supabase.from("scenes").select("*").eq("slug", slug).single();
  return data as Scene | null;
}

async function getFirstPoster(sceneId: string): Promise<string | null> {
  const { data } = await supabase
    .from("movie_scenes")
    .select("movie:movies(poster_url)")
    .eq("scene_id", sceneId)
    .limit(10);
  return (
    ((data as unknown as { movie: { poster_url: string | null } }[]) ?? [])
      .map((x) => x.movie?.poster_url)
      .find(Boolean) ?? null
  );
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

export async function generateStaticParams() {
  const { data } = await supabase.from("scenes").select("slug");
  return (data ?? []).map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scene = await getScene(slug);
  if (!scene) return {};
  const canonical = `${BASE_URL}/scene/${slug}`;
  const title = `${scene.name}映画おすすめ一覧【Amazon Prime・U-NEXT配信情報つき】`;
  const description = `${scene.name}にぴったりな映画・ドラマを厳選。${INTRO[slug] ?? ""}Amazon Prime Video・U-NEXT・HuluなどどのVODで見放題か一覧でチェックできます。`;
  const ogImage = await getFirstPoster(scene.id);
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

export default async function ScenePage({ params }: Props) {
  const { slug } = await params;
  const scene = await getScene(slug);
  if (!scene) notFound();

  const { movies, flatSet } = await getData(scene.id);

  const faqItems = FAQ[slug] ?? [];
  const faqLd = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: `${scene.name}の映画・ドラマ`, item: `${BASE_URL}/scene/${slug}` },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${scene.name}におすすめの映画・ドラマ一覧`,
    url: `${BASE_URL}/scene/${slug}`,
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
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
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

          {/* FAQ */}
          {faqItems.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>よくある質問</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {faqItems.map((f) => (
                  <div key={f.q} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", backgroundColor: "var(--bg-card)" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--accent)" }}>Q.</span>{f.q}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.8, paddingLeft: 22 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amazon Prime CTA */}
          <div style={{ marginTop: 40, border: "2px solid var(--accent)", borderRadius: 14, padding: "28px 24px", textAlign: "center", backgroundColor: "var(--accent-light)" }}>
            <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>紹介した映画をすぐ観るなら</p>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 4 }}>Amazon Prime Video — 月額600円・30日間無料</p>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 20 }}>見放題作品多数。期間内に解約すれば料金はかかりません。</p>
            <Link href="/go/amazon-prime" style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 40px", borderRadius: 10, textDecoration: "none" }}>
              Amazon Primeを30日間無料で試す →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
