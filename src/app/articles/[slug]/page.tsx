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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

const vodServices = [
  { slug: "unext", name: "U-NEXT", trial: "31日間無料" },
  { slug: "dmm-tv", name: "DMM TV", trial: "30日間無料" },
  { slug: "hulu", name: "Hulu", trial: "2週間無料" },
  { slug: "abema", name: "ABEMA", trial: "2週間無料" },
];

const RANK_COLORS = ["#c07840", "#8b9aac", "#9c7c5a"];

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const articleMovies = await getArticleMovies(article.id);

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* ── Hero ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px" }}>
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              padding: "14px 0",
              fontSize: 12,
              color: "var(--fg-muted)",
            }}
          >
            <Link href="/" style={{ color: "var(--fg-muted)" }}>ホーム</Link>
            <span>›</span>
            <Link href="/articles" style={{ color: "var(--fg-muted)" }}>特集・まとめ</Link>
            <span>›</span>
            <span>{article.title}</span>
          </div>
        </div>

        {/* Hero split */}
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: 280,
            overflow: "hidden",
          }}
        >
          {/* Text side */}
          <div style={{ padding: "32px 20px 48px" }}>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                color: "var(--fg-muted)",
                marginBottom: 16,
              }}
            >
              特集・まとめ
            </div>
            <h1
              style={{
                fontSize: "clamp(22px, 3vw, 38px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                marginBottom: 16,
              }}
            >
              {article.title}
            </h1>
            {article.excerpt && (
              <p style={{ color: "var(--fg-muted)", lineHeight: 1.8, marginBottom: 20, fontSize: 15 }}>
                {article.excerpt}
              </p>
            )}
            {article.published_at && (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 12,
                  color: "var(--fg-muted)",
                }}
              >
                <span>
                  🗓 {new Date(article.published_at).toLocaleDateString("ja-JP")} 公開
                </span>
                <span>⏱ 約{Math.ceil(articleMovies.length * 0.5 + 3)}分で読めます</span>
              </div>
            )}
          </div>

          {/* Visual side */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3f5c 0%, #0f2237 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 40% 50%, rgba(100,160,220,0.2) 0%, transparent 60%)",
              }}
            />
            <span style={{ fontSize: 72, opacity: 0.2, position: "relative" }}>🎬</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className="article-body-grid"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "48px 20px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        {/* Sidebar ToC */}
        <div className="article-toc" style={{ position: "sticky", top: 80 }}>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              backgroundColor: "var(--bg-card)",
              padding: "20px",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>この記事の目次</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
              <li style={{ marginBottom: 8 }}>
                <a href="#intro" style={{ color: "var(--fg-muted)" }}>はじめに</a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="#movies" style={{ color: "var(--fg-muted)", fontWeight: 600 }}>
                  映画リスト（{articleMovies.length}選）
                </a>
              </li>
              {articleMovies.length > 5 && (
                <li style={{ marginBottom: 8, paddingLeft: 12 }}>
                  <a href="#movies" style={{ color: "var(--fg-muted)", fontSize: 12 }}>
                    1〜5位
                  </a>
                </li>
              )}
              <li style={{ marginBottom: 8 }}>
                <a href="#vod" style={{ color: "var(--fg-muted)" }}>
                  おすすめの配信サービス
                </a>
              </li>
            </ul>
          </div>

          {/* Share */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              backgroundColor: "var(--bg-card)",
              padding: "16px",
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>シェアする</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["X (旧Twitter)", "Facebook", "LINEで送る"].map((s) => (
                <button
                  key={s}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    fontSize: 10,
                    cursor: "pointer",
                    color: "var(--fg-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div>
          {/* PR notice */}
          <p
            style={{
              fontSize: 11,
              color: "var(--fg-muted)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 32,
              backgroundColor: "var(--bg-card)",
            }}
          >
            本ページは広告・アフィリエイトリンクを含みます。
          </p>

          {/* Movie list header */}
          {articleMovies.length > 0 && (
            <section id="movies">
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 6,
                  paddingBottom: 14,
                  borderBottom: "2px solid var(--border)",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                }}
              >
                映画リスト（{articleMovies.length}選）
                <span style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 400 }}>
                  ※ランキングは編集部のおすすめ順です
                </span>
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                {articleMovies.map(({ movie, comment }, index) => {
                  const rank = index + 1;
                  const rankColor =
                    rank <= 3 ? RANK_COLORS[rank - 1] : "var(--fg-muted)";
                  return (
                    <div
                      key={movie.id}
                      className="ranking-item"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "44px 140px 1fr auto",
                        gap: 16,
                        alignItems: "start",
                        padding: "20px",
                        border: "1px solid var(--border)",
                        borderRadius: 14,
                        backgroundColor: "var(--bg-card)",
                      }}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: rankColor,
                          lineHeight: 1,
                          paddingTop: 4,
                        }}
                      >
                        {rank}
                      </div>

                      {/* Poster */}
                      <Link href={`/movies/${movie.slug}`}>
                        <div
                          style={{
                            aspectRatio: "2/3",
                            borderRadius: 10,
                            overflow: "hidden",
                            background:
                              "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {movie.poster_url ? (
                            <img
                              src={movie.poster_url}
                              alt={movie.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <span style={{ fontSize: 32, opacity: 0.3 }}>🎬</span>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div>
                        <Link href={`/movies/${movie.slug}`}>
                          <h3
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              marginBottom: 6,
                              lineHeight: 1.3,
                            }}
                          >
                            {movie.title}
                          </h3>
                        </Link>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--fg-muted)",
                            marginBottom: 8,
                          }}
                        >
                          {[movie.release_year, movie.country].filter(Boolean).join(" · ")}
                        </div>
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: "var(--fg-muted)",
                          }}
                          className="line-clamp-3"
                        >
                          {comment ?? movie.summary}
                        </p>
                      </div>

                      {/* Meta + CTA */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 8,
                          minWidth: 110,
                        }}
                      >
                        {movie.release_year && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: "var(--fg-muted)" }}>公開年</div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>
                              {movie.release_year}年
                            </div>
                          </div>
                        )}
                        <Link
                          href={`/movies/${movie.slug}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: "var(--btn-dark)",
                            color: "#fff",
                            padding: "9px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          どこで見れる？ →
                        </Link>
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
          <section id="vod" style={{ marginTop: 48 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "2px solid var(--border)",
              }}
            >
              おすすめの配信サービスで観る
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
                marginBottom: 12,
              }}
            >
              {vodServices.map((v) => (
                <div
                  key={v.slug}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "16px 12px",
                    backgroundColor: "var(--bg-card)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
                    {v.trial}
                  </div>
                  <Link
                    href={`/go/${v.slug}`}
                    style={{
                      display: "block",
                      backgroundColor: "var(--btn-dark)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    登録する →
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
  );
}
