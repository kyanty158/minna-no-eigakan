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

const FAQ: Record<string, { q: string; a: string }[]> = {
  romance: [
    { q: "恋愛映画はどこで見れますか？", a: "Amazon Prime Video（月額600円・30日間無料）やU-NEXT（月額2,189円・31日間無料）などのVODで多くの恋愛映画が見放題です。無料トライアル期間内に解約すれば料金はかかりません。" },
    { q: "カップルで見るのにおすすめの恋愛映画は？", a: "『ラ・ラ・ランド』『ノッティングヒルの恋人』『ビフォア・サンライズ』などが定番です。当サイトでは「カップルで見る」シーンからも絞り込めます。" },
    { q: "泣ける恋愛映画のおすすめは？", a: "『世界の中心で愛をさけぶ』『花束みたいな恋をした』『余命10年』などが人気です。いずれもAmazon PrimeやU-NEXTで配信されています。" },
  ],
  tearjerker: [
    { q: "泣ける映画はどこで見れますか？", a: "Amazon Prime Video（月額600円・30日間無料）やU-NEXT（月額2,189円・31日間無料）で多くの感動作が見放題です。『ショーシャンクの空に』『フォレスト・ガンプ』もAmazon Primeで見放題です。" },
    { q: "一人で泣きたい夜におすすめの映画は？", a: "『エターナル・サンシャイン』『花束みたいな恋をした』『世界の中心で愛をさけぶ』などが人気です。Amazon PrimeやU-NEXTで今すぐ視聴できます。" },
    { q: "感動映画を無料で見る方法は？", a: "Amazon Prime Videoの30日間無料トライアルを使えば、見放題作品が実質0円で視聴できます。期間内に解約すれば料金はかかりません。" },
  ],
  "korean-drama": [
    { q: "韓国映画はどこで見れますか？", a: "Amazon Prime Video、U-NEXT、Huluなどで多くの韓国映画が見放題配信されています。『パラサイト』『タクシー運転手』『弁護人』などの名作も視聴できます。" },
    { q: "無料で韓国映画を観る方法は？", a: "Amazon Prime Videoの30日間無料トライアルがおすすめです。韓国映画が充実しており、期間内に解約すれば料金はかかりません。" },
    { q: "韓国映画の泣ける作品は？", a: "『タクシー運転手』『弁護人』『ビューティー・インサイド』『建築学概論』などが人気です。感動とカタルシスを味わえる傑作ばかりです。" },
  ],
  anime: [
    { q: "アニメ映画はどこで見れますか？", a: "Amazon Prime Video、U-NEXT、Huluなどで多くのアニメ映画が見放題です。『鬼滅の刃 無限列車編』『ONE PIECE FILM RED』もAmazon Primeで見放題配信中です。" },
    { q: "ジブリ映画はどこで見れますか？", a: "Amazon Prime VideoやNetflixなどで配信されています。配信状況は変わる場合があるため、最新情報は各公式サイトでご確認ください。" },
    { q: "新海誠の映画はどこで見れますか？", a: "『君の名は。』『天気の子』『すずめの戸締まり』などがU-NEXTやAmazon Primeで配信されています。" },
  ],
  comedy: [
    { q: "コメディ映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで多くのコメディ映画が見放題です。お笑い系からロマコメまで幅広く楽しめます。" },
    { q: "デートで見ても気まずくないコメディ映画は？", a: "『プリティ・ウーマン』『ハングオーバー！』『ドント・ルック・アップ』などがおすすめです。笑えて後味も爽やかな作品を厳選しています。" },
  ],
  horror: [
    { q: "ホラー映画はどこで見れますか？", a: "Amazon Prime Video、U-NEXT、Huluなどで多くのホラー映画が見放題です。洋画・邦画・韓国ホラーなど幅広いラインナップがあります。" },
    { q: "デートで見るおすすめのホラー映画は？", a: "『ゲット・アウト』『シャイニング』などが人気です。ドキドキ感を共有でき、二人の距離が縮まるきっかけになります。" },
  ],
  suspense: [
    { q: "サスペンス映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで多くのサスペンス映画が見放題です。『ゴーン・ガール』『インセプション』もAmazon Prime・U-NEXTで視聴できます。" },
    { q: "どんでん返し映画のおすすめは？", a: "『ゴーン・ガール』『プレステージ』『ナイブズ・アウト』などが人気です。最後まで目が離せない展開で、観終わった後も余韻が続きます。" },
  ],
  youth: [
    { q: "青春映画はどこで見れますか？", a: "Amazon Prime Video（30日間無料）やU-NEXTで多くの青春映画が見放題です。日本映画の青春作品も豊富に揃っています。" },
    { q: "甘酸っぱい青春映画のおすすめは？", a: "『君の名は。』『四月は君の嘘』『心が叫びたがってるんだ。』などが人気です。Amazon Primeや U-NEXTで視聴できます。" },
  ],
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
  const title = `${genre.name}映画・ドラマおすすめ一覧【Amazon Prime・U-NEXT配信情報つき】`;
  const description = `${genre.name}映画・ドラマのおすすめ一覧。${INTRO[slug] ?? ""}Amazon Prime Video・U-NEXT・HuluなどどのVODで見放題かも一覧でチェックできます。`;
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
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
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

        {/* FAQ */}
        {faqItems.length > 0 && (
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 32px" }}>
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
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 48px" }}>
          <div style={{ border: "2px solid var(--accent)", borderRadius: 14, padding: "28px 24px", textAlign: "center", backgroundColor: "var(--accent-light)" }}>
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
