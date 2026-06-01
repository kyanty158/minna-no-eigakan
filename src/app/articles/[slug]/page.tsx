import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Article, Movie } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as Article | null;
}

async function getArticleMovies(articleId: string) {
  const { data } = await supabase
    .from("article_movies")
    .select("*, movie:movies(id, title, slug, release_year, country, poster_url, summary)")
    .eq("article_id", articleId)
    .order("display_order");
  return (data as unknown as { movie: Movie; comment: string | null }[]) ?? [];
}

async function getBestFlatAvailability(movieIds: string[]): Promise<Record<string, { slug: string; name: string; free_trial_text: string | null }>> {
  if (movieIds.length === 0) return {};
  const { data } = await supabase
    .from("movie_availability")
    .select("movie_id, vod_service:vod_services(slug, name, free_trial_text)")
    .in("movie_id", movieIds)
    .eq("is_available", true)
    .eq("availability_type", "見放題");

  const map: Record<string, { slug: string; name: string; free_trial_text: string | null }> = {};
  for (const row of (data ?? []) as unknown as { movie_id: string; vod_service: { slug: string; name: string; free_trial_text: string | null } }[]) {
    if (!map[row.movie_id]) {
      map[row.movie_id] = row.vod_service;
    }
  }
  return map;
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((a: { slug: string }) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const canonical = `https://minna-no-eigakan.vercel.app/articles/${slug}`;
  const description = article.excerpt ?? `${article.title}。映画・ドラマのおすすめまとめ記事です。`;
  return {
    title: article.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description,
      url: canonical,
      type: "article",
      ...(article.published_at ? { publishedTime: article.published_at } : {}),
      ...(article.thumbnail_url ? { images: [{ url: article.thumbnail_url, width: 1280, height: 720, alt: article.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(article.thumbnail_url ? { images: [article.thumbnail_url] } : {}),
    },
  };
}

const vodServices = [
  { slug: "unext", name: "U-NEXT", trial: "31日間無料", price: "2,189円/月" },
  { slug: "dmm-tv", name: "DMM TV", trial: "30日間無料", price: "550円/月" },
  { slug: "hulu", name: "Hulu", trial: "2週間無料", price: "1,026円/月" },
  { slug: "abema", name: "ABEMA", trial: "2週間無料", price: "960円/月" },
];

const RANK_COLORS = ["#c07840", "#8b9aac", "#9c7c5a"];

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const articleMovies = await getArticleMovies(article.id);
  const movieIds = articleMovies.map((am) => am.movie.id);
  const bestFlatMap = await getBestFlatAvailability(movieIds);

  const BASE_URL = "https://minna-no-eigakan.vercel.app";
  const pageUrl = `${BASE_URL}/articles/${slug}`;
  const shareText = `${article.title} | みんなの映画館`;
  const flatCount = movieIds.filter((id) => bestFlatMap[id]).length;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.excerpt ?? undefined,
        url: pageUrl,
        ...(article.published_at ? { datePublished: article.published_at } : {}),
        dateModified: article.updated_at,
        author: { "@type": "Organization", name: "みんなの映画館編集部" },
        publisher: { "@type": "Organization", name: "みんなの映画館", url: BASE_URL },
        inLanguage: "ja-JP",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "特集・まとめ", item: `${BASE_URL}/articles` },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <div style={{ backgroundColor: "var(--bg)" }}>
      {/* ── Hero ── */}
      <div style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "14px 0", fontSize: 12, color: "var(--fg-muted)" }}>
            <Link href="/" style={{ color: "var(--fg-muted)" }}>ホーム</Link>
            <span>›</span>
            <Link href="/articles" style={{ color: "var(--fg-muted)" }}>特集・まとめ</Link>
            <span>›</span>
            <span>{article.title}</span>
          </div>
        </div>

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 48px" }}>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border)", color: "var(--fg-muted)", marginBottom: 16 }}>
            特集・まとめ
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 16, maxWidth: 800 }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ color: "var(--fg-muted)", lineHeight: 1.8, marginBottom: 20, fontSize: 15, maxWidth: 720 }}>
              {article.excerpt}
            </p>
          )}
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--fg-muted)", flexWrap: "wrap", alignItems: "center" }}>
            {article.published_at && (
              <span>🗓 {new Date(article.published_at).toLocaleDateString("ja-JP")} 公開</span>
            )}
            <span>⏱ 約{Math.ceil(articleMovies.length * 0.5 + 3)}分で読めます</span>
            {flatCount > 0 && (
              <span style={{ backgroundColor: "#e7f3ec", color: "#1f7a46", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                見放題あり {flatCount}本
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className="article-body-grid"
        style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 40, alignItems: "start" }}
      >
        {/* Sidebar ToC */}
        <div className="article-toc" style={{ position: "sticky", top: 80 }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "20px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "var(--fg-muted)", letterSpacing: "0.08em" }}>目 次</h3>
            <ol style={{ listStyle: "decimal", paddingLeft: 16, margin: 0, fontSize: 13, lineHeight: 2 }}>
              {article.body && <li><a href="#intro" style={{ color: "var(--fg-muted)" }}>はじめに</a></li>}
              <li>
                <a href="#movies" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  映画リスト（{articleMovies.length}選）
                </a>
              </li>
              <li><a href="#vod" style={{ color: "var(--fg-muted)" }}>おすすめの配信サービス</a></li>
            </ol>
          </div>

          {/* Share */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "16px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>シェアする</p>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 7, border: "1px solid var(--border)", backgroundColor: "var(--bg)", fontSize: 11, color: "var(--fg-muted)", fontWeight: 600 }}
              >
                X (旧Twitter)
              </a>
              <a
                href={`https://line.me/R/msg/text/?${encodeURIComponent(shareText + "\n" + pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 7, border: "1px solid var(--border)", backgroundColor: "var(--bg)", fontSize: 11, color: "var(--fg-muted)", fontWeight: 600 }}
              >
                LINEで送る
              </a>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div>
          {/* PR notice */}
          <p style={{ fontSize: 11, color: "var(--fg-muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", marginBottom: 32, backgroundColor: "var(--bg-card)" }}>
            ※本ページは広告・アフィリエイトリンクを含みます。
          </p>

          {/* はじめに */}
          {article.body && (
            <section id="intro" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent)" }}>▶</span>はじめに
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--fg-muted)" }}>{article.body}</p>
            </section>
          )}

          {/* Movie list */}
          {articleMovies.length > 0 && (
            <section id="movies" style={{ scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, paddingBottom: 14, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ color: "var(--accent)" }}>▶</span>
                映画リスト（{articleMovies.length}選）
                <span style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 400 }}>
                  ※ランキングは編集部のおすすめ順です
                </span>
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                {articleMovies.map(({ movie, comment }, index) => {
                  const rank = index + 1;
                  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : "var(--fg-muted)";
                  const bestFlat = bestFlatMap[movie.id];

                  return (
                    <div
                      key={movie.id}
                      className="ranking-item"
                      style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", overflow: "hidden" }}
                    >
                      {/* ランク帯 */}
                      <div style={{ backgroundColor: rank <= 3 ? rankColor : "#f0ede8", padding: "6px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: rank <= 3 ? "#fff" : "var(--fg-muted)" }}>
                          No.{rank}
                        </span>
                        {bestFlat && (
                          <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#e7f3ec", color: "#1f7a46", padding: "2px 10px", borderRadius: 20 }}>
                            見放題あり
                          </span>
                        )}
                      </div>

                      {/* カード本体 */}
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 16, padding: "16px 20px", alignItems: "start" }}>
                        {/* Poster */}
                        <Link href={`/movies/${movie.slug}`}>
                          <div style={{ aspectRatio: "2/3", borderRadius: 8, overflow: "hidden", background: "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                            {movie.poster_url ? (
                              <img src={movie.poster_url} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: 28, opacity: 0.3 }}>🎬</span>
                            )}
                          </div>
                        </Link>

                        {/* Info */}
                        <div>
                          <Link href={`/movies/${movie.slug}`}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
                              {movie.title}
                            </h3>
                          </Link>
                          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 10 }}>
                            {[movie.release_year, movie.country].filter(Boolean).join(" · ")}
                          </div>
                          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)" }} className="line-clamp-3">
                            {comment ?? movie.summary}
                          </p>

                          {/* 配信情報 */}
                          {bestFlat ? (
                            <div style={{ marginTop: 12, fontSize: 13, color: "#1f7a46", fontWeight: 600 }}>
                              ✓ {bestFlat.name}で見放題配信中
                              {bestFlat.free_trial_text && (
                                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--fg-muted)", marginLeft: 6 }}>
                                  ({bestFlat.free_trial_text})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div style={{ marginTop: 12, fontSize: 13, color: "var(--fg-muted)" }}>
                              配信状況を確認する →
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="ranking-meta" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 120 }}>
                          {bestFlat ? (
                            <Link
                              href={`/go/${bestFlat.slug}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "#1f7a46", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
                            >
                              無料で観る →
                            </Link>
                          ) : (
                            <Link
                              href={`/movies/${movie.slug}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "var(--btn-dark)", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                            >
                              どこで見れる？ →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(!articleMovies || articleMovies.length === 0) && (
            <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "48px 0" }}>
              作品を準備中です。
            </p>
          )}

          {/* VOD section */}
          <section id="vod" style={{ marginTop: 48, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: "3px solid var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>▶</span>おすすめの配信サービスで観る
            </h2>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20, lineHeight: 1.8 }}>
              上記の映画を観るなら以下のVODサービスがおすすめです。無料トライアルを活用すれば実質0円で視聴できます。
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 12 }}>
              {vodServices.map((v, i) => (
                <div
                  key={v.slug}
                  style={{ border: i === 0 ? "2px solid #1f7a46" : "1px solid var(--border)", borderRadius: 12, padding: "20px 16px", backgroundColor: "var(--bg-card)", position: "relative" }}
                >
                  {i === 0 && (
                    <span style={{ position: "absolute", top: -10, left: 16, backgroundColor: "#1f7a46", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                      イチオシ
                    </span>
                  )}
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 4 }}>{v.price}</div>
                  <div style={{ fontSize: 13, color: "#1f7a46", fontWeight: 600, marginBottom: 14 }}>{v.trial}</div>
                  <Link
                    href={`/go/${v.slug}`}
                    style={{ display: "block", textAlign: "center", backgroundColor: i === 0 ? "#1f7a46" : "var(--btn-dark)", color: "#fff", padding: "10px 12px", borderRadius: 7, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                  >
                    無料で試す →
                  </Link>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              ※配信状況は記事更新時点の情報です。最新情報は各公式サイトでご確認ください。
            </p>
          </section>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 48px" }}>
        <Link href="/articles" style={{ fontSize: 13, color: "var(--fg-muted)" }}>
          ← 記事一覧に戻る
        </Link>
      </div>
    </div>
    </>
  );
}
