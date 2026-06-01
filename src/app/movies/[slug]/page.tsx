import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Movie, MovieAvailability, VodService } from "@/types";
import AdBanner from "@/components/ui/AdBanner";

type Props = { params: Promise<{ slug: string }> };

async function getMovie(slug: string) {
  const { data } = await supabase.from("movies").select("*").eq("slug", slug).single();
  return data as Movie | null;
}

async function getAvailability(movieId: string) {
  const { data } = await supabase
    .from("movie_availability")
    .select("*, vod_service:vod_services(*)")
    .eq("movie_id", movieId)
    .eq("is_available", true)
    .order("availability_type");
  return (data as unknown as MovieAvailability[]) ?? [];
}

async function getMovieTags(movieId: string) {
  const [g, s] = await Promise.all([
    supabase.from("movie_genres").select("genre:genres(name, slug)").eq("movie_id", movieId),
    supabase.from("movie_scenes").select("scene:scenes(name, slug)").eq("movie_id", movieId),
  ]);
  const genres = ((g.data as unknown as { genre: { name: string; slug: string } }[]) ?? []).map((x) => x.genre).filter(Boolean);
  const scenes = ((s.data as unknown as { scene: { name: string; slug: string } }[]) ?? []).map((x) => x.scene).filter(Boolean);
  return { genres, scenes };
}

async function getRelatedMovies(movieId: string): Promise<Movie[]> {
  const { data: genreLinks } = await supabase.from("movie_genres").select("genre_id").eq("movie_id", movieId).limit(3);
  if (!genreLinks || genreLinks.length === 0) return [];
  const genreIds = genreLinks.map((g) => g.genre_id);
  const { data: relatedLinks } = await supabase
    .from("movie_genres")
    .select("movie:movies(id, title, slug, release_year, poster_url, country)")
    .in("genre_id", genreIds)
    .neq("movie_id", movieId)
    .limit(20);
  if (!relatedLinks) return [];
  const seen = new Set<string>();
  const unique: Movie[] = [];
  for (const { movie } of relatedLinks as unknown as { movie: Movie }[]) {
    if (movie && !seen.has(movie.id)) {
      seen.add(movie.id);
      unique.push(movie);
      if (unique.length >= 6) break;
    }
  }
  return unique;
}

const TYPE_RANK: Record<string, number> = { 見放題: 0, レンタル: 1, 購入: 2, 不明: 3, 配信なし: 4 };

const TYPE_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  見放題: { icon: "◎", color: "#1f7a46", bg: "#e7f3ec" },
  レンタル: { icon: "△", color: "#9a6516", bg: "#fbf0dd" },
  購入: { icon: "△", color: "#4a5568", bg: "#eef0f4" },
  不明: { icon: "△", color: "#888", bg: "#f5f5f5" },
  配信なし: { icon: "×", color: "#c0392b", bg: "#fdf0ef" },
};

const RECO_BY_GENRE: Record<string, string[]> = {
  romance: ["胸キュンする恋愛映画が観たい", "デートや記念日に観る作品を探している"],
  tearjerker: ["思いきり泣いてスッキリしたい", "余韻が長く残る感動作が好き"],
  youth: ["甘酸っぱい青春の物語が観たい", "学生時代を思い出したい"],
  anime: ["美しい映像のアニメ映画が観たい", "大人も楽しめる名作を探している"],
  "korean-drama": ["話題の韓国作品をチェックしたい", "切ない恋愛ストーリーが好き"],
  comedy: ["笑って気軽に楽しみたい", "気まずくならない作品を観たい"],
  horror: ["ゾクッとする恐怖を味わいたい", "二人で盛り上がれる作品を探している"],
  suspense: ["先の読めない展開にハマりたい", "考察しながら観るのが好き"],
};

function buildReco(genreSlugs: string[]): string[] {
  const out: string[] = [];
  for (const g of genreSlugs) for (const r of RECO_BY_GENRE[g] ?? []) if (!out.includes(r)) out.push(r);
  if (out.length < 2) out.push("じっくり物語に浸れる作品を探している");
  return out.slice(0, 4);
}

const VOD_POINTS: Record<string, string[]> = {
  unext: ["見放題作品数280,000本以上（業界最大級）", "毎月1,200ポイント付与でレンタル・購入にも使える", "最大4アカウントで家族シェア可能", "最新作の見放題追加が早い"],
  "dmm-tv": ["月額550円（税込）で業界最安水準", "アニメ・映画のラインナップが充実", "DMMポイントで課金作品も視聴可能", "解約後も購入済み作品は視聴継続できる"],
  hulu: ["海外ドラマ・国内ドラマが圧倒的に充実", "プロフィール6つまで作成でき家族利用に最適", "ダウンロード機能でオフライン視聴可能", "スポーツ・ニュースもカバー"],
  abema: ["ABEMAニュース・生配信スポーツも見放題", "最新アニメを最速配信", "月額960円で若年層に人気", "字幕・吹き替え両方対応作品が多い"],
  "amazon-prime": ["Amazon配送特典・Music等とセットでコスパ最高", "月額600円（年払い換算）で業界随一の安さ", "プライムビデオチャンネルで追加拡張可能", "ダウンロード機能あり"],
  lemino: ["NTTドコモ系でドコモユーザーは特典あり", "通信料合算払いで登録簡単", "独自のオリジナルコンテンツが充実", "スポーツ・音楽ライブも配信"],
};

// 吹き出しCTA ボックス
function CalloutCTA({ movieTitle, vod }: { movieTitle: string; vod: VodService }) {
  return (
    <div style={{ margin: "32px 0" }}>
      <div style={{ backgroundColor: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: "10px 10px 0 0", textAlign: "center" }}>
        ＼ 実質無料で『{movieTitle}』を見るなら ／
      </div>
      <div style={{ border: "2px solid var(--accent)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "24px 20px", backgroundColor: "var(--bg-card)", textAlign: "center" }}>
        <p style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{vod.name}</p>
        {vod.free_trial_text && (
          <p style={{ fontSize: 14, color: "#1f7a46", fontWeight: 600, marginBottom: 18 }}>
            {vod.free_trial_text}の無料トライアルあり
          </p>
        )}
        <Link
          href={`/go/${vod.slug}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#1f7a46", color: "#fff", padding: "16px 48px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}
        >
          今すぐ無料で観る →
        </Link>
        {vod.monthly_price && (
          <p style={{ marginTop: 10, fontSize: 11, color: "var(--fg-muted)" }}>
            ※{vod.free_trial_text ?? "無料期間"}終了後は月額{vod.monthly_price.toLocaleString()}円（税込）。期間内の解約で料金はかかりません。
          </p>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { data } = await supabase.from("movies").select("slug");
  return (data ?? []).map((m: { slug: string }) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) return {};
  const canonical = `https://minna-no-eigakan.vercel.app/movies/${slug}`;
  const title = `『${movie.title}』はどこで見れる？配信中のVODを紹介`;
  const rawDesc = `『${movie.title}』(${movie.release_year ?? ""}) が視聴できるVODサービスを紹介。無料トライアルで実質0円で観る方法も解説。${movie.summary ?? ""}`;
  const description = rawDesc.length > 158 ? rawDesc.slice(0, 157) + "…" : rawDesc;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: movie.poster_url ? [{ url: movie.poster_url, width: 500, height: 750, alt: movie.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: movie.poster_url ? [movie.poster_url] : undefined,
    },
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) notFound();

  const [availability, relatedMovies, tags] = await Promise.all([
    getAvailability(movie.id),
    getRelatedMovies(movie.id),
    getMovieTags(movie.id),
  ]);

  const sortedAvail = [...availability].sort((a, b) => {
    const t = (TYPE_RANK[a.availability_type] ?? 9) - (TYPE_RANK[b.availability_type] ?? 9);
    if (t !== 0) return t;
    return (a.vod_service?.monthly_price ?? 9999) - (b.vod_service?.monthly_price ?? 9999);
  });
  const bestFlat = sortedAvail.find((a) => a.availability_type === "見放題");

  const pageUrl = `https://minna-no-eigakan.vercel.app/movies/${slug}`;
  const shareText = `『${movie.title}』はどこで見れる？ | みんなの映画館`;

  const faqItems = [
    {
      q: `『${movie.title}』はどこで見れる？`,
      a: bestFlat
        ? `${bestFlat.vod_service?.name}で見放題配信中です。${bestFlat.vod_service?.free_trial_text ? `${bestFlat.vod_service.free_trial_text}の無料トライアルを使えば実質0円で視聴できます。` : ""}`
        : sortedAvail.length > 0
          ? `${sortedAvail.slice(0, 3).map((a) => a.vod_service?.name).join("・")}でレンタル・購入できます。`
          : "現時点では主要VODサービスでの配信は確認できていません。配信状況は随時変わりますので各サービスでご確認ください。",
    },
    {
      q: `『${movie.title}』は無料で観られる？`,
      a: bestFlat
        ? `${bestFlat.vod_service?.name}の${bestFlat.vod_service?.free_trial_text ?? "無料トライアル"}を使えば実質無料で視聴できます。期間内に解約すれば料金はかかりません。`
        : "見放題配信は確認できていませんが、各VODの無料トライアル期間中に最新の配信状況を確認することをおすすめします。",
    },
    {
      q: `『${movie.title}』はNetflixやAmazonプライムで観られる？`,
      a: `現時点でNetflix・Amazon Prime Videoでの配信は確認できていません。${bestFlat ? `代わりに${bestFlat.vod_service?.name}での見放題配信をおすすめします。` : "U-NEXTやDMM TVでの配信状況をご確認ください。"}`,
    },
    {
      q: "VODの無料トライアルはどのくらいの期間？",
      a: "U-NEXTは31日間、DMM TVは30日間、Huluは2週間の無料トライアルがあります。いずれも期間内に解約すれば料金は一切かかりません。",
    },
  ];

  const BASE_URL = "https://minna-no-eigakan.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Movie",
        name: movie.title,
        ...(movie.original_title ? { alternateName: movie.original_title } : {}),
        ...(movie.release_year ? { datePublished: `${movie.release_year}` } : {}),
        ...(movie.description ? { description: movie.description } : {}),
        ...(movie.poster_url ? { image: movie.poster_url } : {}),
        ...(movie.runtime_minutes ? { duration: `PT${movie.runtime_minutes}M` } : {}),
        ...(movie.country ? { countryOfOrigin: { "@type": "Country", name: movie.country } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "作品を探す", item: `${BASE_URL}/movies` },
          { "@type": "ListItem", position: 3, name: movie.title, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ backgroundColor: "var(--bg)" }}>
        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #2d1f15 0%, #1a1208 100%)", borderBottom: "1px solid var(--border)" }}>
          <div className="detail-hero-grid" style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 40, alignItems: "start" }}>
            <div className="detail-poster" style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "2/3", background: "linear-gradient(135deg, #3d1f10 0%, #6b3520 50%, #8b5030 100%)", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              {movie.poster_url ? (
                <Image src={movie.poster_url} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="280px" priority />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 64, opacity: 0.3 }}>🎬</span>
                </div>
              )}
            </div>

            <div style={{ color: "#fff" }}>
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", fontSize: 12, padding: "4px 12px", borderRadius: 20, marginBottom: 14, color: "rgba(255,255,255,0.7)" }}>
                ✦ みんなの映画館
              </div>
              <h1 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
                {movie.title}
              </h1>
              {movie.original_title && (
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>{movie.original_title}</p>
              )}
              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16, flexWrap: "wrap" }}>
                {movie.release_year && <span>{movie.release_year}年</span>}
                {movie.runtime_minutes && <><span>｜</span><span>{movie.runtime_minutes}分</span></>}
                {movie.country && <><span>｜</span><span>{movie.country}</span></>}
                {tags.genres.slice(0, 3).map((g) => (
                  <Link key={g.slug} href={`/genre/${g.slug}`} style={{ fontSize: 12, padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}>
                    {g.name}
                  </Link>
                ))}
              </div>
              {movie.summary && (
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", marginBottom: 24 }}>{movie.summary}</p>
              )}
              {bestFlat ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(231,243,236,0.15)", border: "1px solid rgba(120,200,150,0.4)", color: "#9fe0b8", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 8, marginBottom: 20 }}>
                  ✓ {bestFlat.vod_service?.name} で見放題配信中
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>無料トライアルのあるVODで探せます</div>
              )}
              <Link href="#availability" style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#fff", color: "var(--fg)", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                どこで見れる？ →
              </Link>
            </div>
          </div>
        </div>

        {/* ── 記事本文（1カラム） ── */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>

          {/* PR notice */}
          <p style={{ fontSize: 11, color: "var(--fg-muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", marginBottom: 24, backgroundColor: "var(--bg-card)" }}>
            ※本ページは広告・アフィリエイトリンクを含みます。
          </p>

          {/* 結論ボックス */}
          {bestFlat ? (
            <div style={{ backgroundColor: "#e7f3ec", border: "2px solid #1f7a46", borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1f7a46", marginBottom: 8, letterSpacing: "0.05em" }}>✓ 結論</p>
              <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>
                『{movie.title}』は<span style={{ color: "#1f7a46" }}>{bestFlat.vod_service?.name}</span>で見放題配信中！
              </p>
              {bestFlat.vod_service?.free_trial_text && (
                <p style={{ fontSize: 13, color: "#2d6a43", marginBottom: 18, lineHeight: 1.7 }}>
                  {bestFlat.vod_service.free_trial_text}の無料トライアルあり。期間内に解約すれば料金はかかりません。
                </p>
              )}
              <Link href={`/go/${bestFlat.vod_service?.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#1f7a46", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                {bestFlat.vod_service?.name}で今すぐ無料で観る →
              </Link>
            </div>
          ) : sortedAvail.length > 0 ? (
            <div style={{ backgroundColor: "#fbf0dd", border: "2px solid #c98a2a", borderRadius: 14, padding: "24px 28px", marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9a6516", marginBottom: 8, letterSpacing: "0.05em" }}>✓ 結論</p>
              <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>
                『{movie.title}』は{sortedAvail[0].vod_service?.name}などでレンタル視聴できます
              </p>
              <Link href="#availability" style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#9a6516", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                配信サービスを確認する →
              </Link>
            </div>
          ) : null}

          {/* 目次 */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "18px 24px", marginBottom: 40, backgroundColor: "var(--bg-card)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--fg-muted)", letterSpacing: "0.08em" }}>目 次</p>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2.2, fontSize: 14 }}>
              <li><a href="#availability" style={{ color: "var(--accent)", textDecoration: "none" }}>どこで見れる？（配信サービス比較）</a></li>
              {bestFlat && <li><a href="#vod-detail" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>{bestFlat.vod_service?.name}で観る方法</a></li>}
              {movie.description && <li><a href="#story" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>あらすじ</a></li>}
              <li><a href="#recommend" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>こんな人におすすめ</a></li>
              <li><a href="#faq" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>よくある質問</a></li>
            </ol>
          </div>

          {/* ── 配信サービス比較 ── */}
          <section id="availability" style={{ marginBottom: 8, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>▶</span>
              {`『${movie.title}』はどこで見れる？`}
            </h2>

            {sortedAvail.length > 0 ? (
              <>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20, lineHeight: 1.8 }}>
                  {bestFlat
                    ? `${bestFlat.vod_service?.name}で見放題配信中です。${bestFlat.vod_service?.free_trial_text ? `${bestFlat.vod_service.free_trial_text}の無料トライアルを使えば実質0円で視聴できます。` : ""}下記の比較表でご確認ください。`
                    : `見放題配信はありませんが、${sortedAvail[0].vod_service?.name}などでレンタル・購入が可能です。`}
                </p>

                {/* 比較テーブル */}
                <div style={{ overflowX: "auto", marginBottom: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#2d1f15", color: "#fff" }}>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>配信サービス</th>
                        <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 13 }}>配信状況</th>
                        <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 13 }}>月額料金</th>
                        <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 13 }}>無料トライアル</th>
                        <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 13 }}>視聴する</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAvail.map((a, i) => {
                        const ti = TYPE_ICON[a.availability_type] ?? { icon: "△", color: "#888", bg: "#f5f5f5" };
                        const isTop = i === 0;
                        return (
                          <tr
                            key={a.id}
                            style={{
                              backgroundColor: isTop ? "#f9fdf9" : (i % 2 === 0 ? "var(--bg-card)" : "var(--bg)"),
                              borderBottom: "1px solid var(--border)",
                              outline: isTop ? "2px solid #1f7a46" : "none",
                              outlineOffset: -1,
                            }}
                          >
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700 }}>{a.vod_service?.name}</span>
                                {isTop && (
                                  <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#1f7a46", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>
                                    イチオシ
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                              <span style={{ fontSize: 18, fontWeight: 800, color: ti.color }}>{ti.icon}</span>
                              <span style={{ display: "block", fontSize: 11, color: ti.color, fontWeight: 600 }}>{a.availability_type}</span>
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--fg-muted)", fontSize: 13 }}>
                              {a.vod_service?.monthly_price ? `${a.vod_service.monthly_price.toLocaleString()}円/月` : "—"}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                              {a.vod_service?.free_trial_text ? (
                                <span style={{ fontSize: 13, color: "#1f7a46", fontWeight: 600 }}>{a.vod_service.free_trial_text}</span>
                              ) : (
                                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                              <Link
                                href={`/go/${a.vod_service?.slug}`}
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: isTop ? "#1f7a46" : "var(--btn-dark)", color: "#fff", padding: "8px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
                              >
                                {a.availability_type === "見放題" ? "無料で観る" : "今すぐ観る"} →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 8, lineHeight: 1.7 }}>
                  ※配信状況は記事更新時点の情報です。最新情報・無料トライアルの条件は各公式サイトでご確認ください。
                </p>
              </>
            ) : (
              <div style={{ padding: "28px 24px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", marginBottom: 8 }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>主要な定額見放題での配信は確認できませんでした</p>
                <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16, lineHeight: 1.7 }}>
                  配信状況は入れ替わることがあります。無料トライアルのあるVODで最新の配信ラインナップをご確認ください。
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {[{ slug: "unext", name: "U-NEXT", trial: "31日間無料" }, { slug: "dmm-tv", name: "DMM TV", trial: "30日間無料" }].map((v) => (
                    <Link key={v.slug} href={`/go/${v.slug}`} style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "center", backgroundColor: "var(--btn-dark)", color: "#fff", padding: "12px", borderRadius: 8, textDecoration: "none" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</span>
                      <span style={{ fontSize: 11, opacity: 0.85 }}>{v.trial}で試す →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 吹き出しCTA #1 */}
          {bestFlat?.vod_service && <CalloutCTA movieTitle={movie.title} vod={bestFlat.vod_service} />}

          {/* ── イチオシVOD詳細セクション ── */}
          {bestFlat?.vod_service && (
            <section id="vod-detail" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent)" }}>▶</span>
                {bestFlat.vod_service.name}で視聴する方法
              </h2>

              <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "24px", marginBottom: 16 }}>
                {/* 料金グリッド */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ textAlign: "center", padding: "16px", backgroundColor: "var(--bg)", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>月額料金</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                      {bestFlat.vod_service.monthly_price ? `${bestFlat.vod_service.monthly_price.toLocaleString()}円` : "要確認"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>（税込）</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#e7f3ec", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#1f7a46", marginBottom: 4 }}>無料トライアル</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#1f7a46" }}>
                      {bestFlat.vod_service.free_trial_text ?? "あり"}
                    </div>
                    <div style={{ fontSize: 11, color: "#2d6a43" }}>期間内解約で無料</div>
                  </div>
                </div>

                {/* おすすめポイント */}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>おすすめポイント</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(VOD_POINTS[bestFlat.vod_service.slug] ?? ["豊富なコンテンツで映画・ドラマが楽しめる"]).map((point) => (
                    <li key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.6 }}>
                      <span style={{ color: "#1f7a46", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 登録ステップ */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "24px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>無料トライアルの始め方</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    `${bestFlat.vod_service.name}の公式サイトにアクセス`,
                    "「無料トライアル開始」ボタンをタップ",
                    "メールアドレス・パスワードを入力して会員登録",
                    "支払い方法を設定（クレジットカード等）",
                    `登録完了 → 『${movie.title}』を検索してすぐ視聴！`,
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 14, lineHeight: 1.7, paddingTop: 4 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <Link
                    href={`/go/${bestFlat.vod_service.slug}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#1f7a46", color: "#fff", padding: "14px 36px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}
                  >
                    {bestFlat.vod_service.name}で無料登録する →
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* 吹き出しCTA #2 */}
          {bestFlat?.vod_service && <CalloutCTA movieTitle={movie.title} vod={bestFlat.vod_service} />}

          {/* 広告スロット */}
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
            <AdBanner size="leaderboard" />
          </div>

          {/* あらすじ */}
          {movie.description && (
            <section id="story" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent)" }}>▶</span>あらすじ
              </h2>
              <p style={{ lineHeight: 1.9, color: "var(--fg-muted)", fontSize: 15 }}>{movie.description}</p>
            </section>
          )}

          {/* 作品情報（コンパクト横並び） */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 40 }}>
            {movie.release_year && (
              <div><span style={{ fontSize: 11, color: "var(--fg-muted)" }}>公開年</span><br /><span style={{ fontWeight: 600 }}>{movie.release_year}年</span></div>
            )}
            {movie.runtime_minutes && (
              <div><span style={{ fontSize: 11, color: "var(--fg-muted)" }}>上映時間</span><br /><span style={{ fontWeight: 600 }}>{movie.runtime_minutes}分</span></div>
            )}
            {movie.country && (
              <div><span style={{ fontSize: 11, color: "var(--fg-muted)" }}>製作国</span><br /><span style={{ fontWeight: 600 }}>{movie.country}</span></div>
            )}
            {movie.age_rating && (
              <div><span style={{ fontSize: 11, color: "var(--fg-muted)" }}>映倫</span><br /><span style={{ fontWeight: 600 }}>{movie.age_rating}</span></div>
            )}
            {tags.genres.length > 0 && (
              <div>
                <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>ジャンル</span><br />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                  {tags.genres.map((g) => (
                    <Link key={g.slug} href={`/genre/${g.slug}`} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border)", color: "var(--fg-muted)" }}>
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* こんな人におすすめ */}
          <section id="recommend" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>▶</span>こんな人におすすめ
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {buildReco(tags.genres.map((g) => g.slug)).map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", fontSize: 14 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {text}
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section id="faq" style={{ marginBottom: 8, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>▶</span>よくある質問
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {faqItems.map((f, i) => (
                <details key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, backgroundColor: "var(--bg-card)", overflow: "hidden" }}>
                  <summary style={{ padding: "16px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}>
                    <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>Q.</span>
                      {f.q}
                    </span>
                    <span style={{ fontSize: 20, color: "var(--fg-muted)", flexShrink: 0, marginLeft: 12 }}>＋</span>
                  </summary>
                  <div style={{ padding: "0 20px 16px", paddingLeft: 44, fontSize: 14, lineHeight: 1.8, color: "var(--fg-muted)", borderTop: "1px solid var(--border)" }}>
                    <span style={{ display: "block", paddingTop: 12 }}>{f.a}</span>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* 吹き出しCTA #3 */}
          {bestFlat?.vod_service && <CalloutCTA movieTitle={movie.title} vod={bestFlat.vod_service} />}

          {/* シェア */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, backgroundColor: "var(--bg-card)", padding: "16px 20px", marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>この記事をシェアする</p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", fontSize: 13, fontWeight: 600, color: "var(--fg-muted)" }}>
                X (旧Twitter)
              </a>
              <a href={`https://line.me/R/msg/text/?${encodeURIComponent(shareText + "\n" + pageUrl)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", fontSize: 13, fontWeight: 600, color: "var(--fg-muted)" }}>
                LINEで送る
              </a>
            </div>
          </div>

          <Link href="/movies" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>
            ← 作品一覧に戻る
          </Link>
        </div>

        {/* ── 関連映画 ── */}
        {relatedMovies.length > 0 && (
          <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}>
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>この映画が好きな方へ</h2>
              <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
                {relatedMovies.map((m) => (
                  <Link key={m.id} href={`/movies/${m.slug}`} style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "2/3", position: "relative", background: "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)", marginBottom: 8 }}>
                      {m.poster_url ? (
                        <Image src={m.poster_url} alt={m.title} fill style={{ objectFit: "cover" }} sizes="180px" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 24, opacity: 0.3 }}>🎬</span>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }} className="line-clamp-2">{m.title}</p>
                    <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>{m.release_year}年</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
