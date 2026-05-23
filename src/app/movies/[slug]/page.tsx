import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Movie, MovieAvailability } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getMovie(slug: string) {
  const { data } = await supabase
    .from("movies")
    .select("*")
    .eq("slug", slug)
    .single();
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) return {};
  return {
    title: `『${movie.title}』はどこで見れる？配信中のVODを紹介`,
    description: `『${movie.title}』が視聴できるVODサービスを紹介します。${movie.summary ?? ""}`,
  };
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <span style={{ color: "var(--star)", letterSpacing: 2, fontSize: 18 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

const SAMPLE_RATING = 4.2;
const SAMPLE_REVIEWS = 12845;

export default async function MovieDetailPage({ params }: Props) {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) notFound();

  const availability = await getAvailability(movie.id);

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #2d1f15 0%, #1a1208 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "48px 20px",
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* Poster */}
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              aspectRatio: "2/3",
              background: "linear-gradient(135deg, #3d1f10 0%, #6b3520 50%, #8b5030 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 40% 50%, rgba(200,120,60,0.3) 0%, transparent 60%)",
                  }}
                />
                <span style={{ fontSize: 64, opacity: 0.3, position: "relative" }}>🎬</span>
              </>
            )}
          </div>

          {/* Info */}
          <div style={{ color: "#fff" }}>
            <div
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.1)",
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 20,
                marginBottom: 14,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              ✦ 今日のおすすめ
            </div>
            <h1
              style={{
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              {movie.title}
            </h1>
            {movie.original_title && (
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 14,
                }}
              >
                {movie.original_title}
              </p>
            )}

            {/* Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <StarRating rating={SAMPLE_RATING} />
              <span style={{ fontWeight: 700, fontSize: 18 }}>{SAMPLE_RATING}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                ({SAMPLE_REVIEWS.toLocaleString()}件)
              </span>
            </div>

            {/* Meta row */}
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 16,
              }}
            >
              {movie.release_year && <span>{movie.release_year}年</span>}
              {movie.runtime_minutes && <span>｜</span>}
              {movie.runtime_minutes && <span>{movie.runtime_minutes}分</span>}
              {movie.country && <span>｜</span>}
              {movie.country && <span>{movie.country}</span>}
            </div>

            {/* Summary */}
            {movie.summary && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.75)",
                  marginBottom: 28,
                }}
              >
                {movie.summary}
              </p>
            )}

            {/* CTA */}
            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href="#availability"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#fff",
                  color: "var(--fg)",
                  padding: "14px 28px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                どこで見れる？ →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>
        {/* Left column */}
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

          {/* あらすじ */}
          {movie.description && (
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: "2px solid var(--border)",
                }}
              >
                あらすじ
              </h2>
              <p style={{ lineHeight: 1.9, color: "var(--fg-muted)", fontSize: 15 }}>
                {movie.description}
              </p>
            </section>
          )}

          {/* こんな人におすすめ */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "2px solid var(--border)",
              }}
            >
              こんな人におすすめ
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: "♡", text: "リアルな恋愛映画が観たい" },
                { icon: "!", text: "切なくて余韻が残る作品が好き" },
                { icon: "◎", text: "等身大の2人の物語に共感したい" },
                { icon: "☆", text: "感情を揺さぶられたい" },
              ].map((item) => (
                <div
                  key={item.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-card)",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-light)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </section>

          {/* 配信サービス */}
          <section id="availability" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "2px solid var(--border)",
              }}
            >
              配信サービス
            </h2>
            {availability.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                  {availability.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: "16px",
                        backgroundColor: "var(--bg-card)",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {a.vod_service?.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--fg-muted)",
                          marginBottom: 10,
                        }}
                      >
                        {a.availability_type}
                        {a.vod_service?.free_trial_text
                          ? ` · ${a.vod_service.free_trial_text}`
                          : ""}
                      </div>
                      <Link
                        href={`/go/${a.vod_service?.slug}`}
                        style={{
                          display: "block",
                          textAlign: "center",
                          backgroundColor: "var(--btn-dark)",
                          color: "#fff",
                          padding: "9px 16px",
                          borderRadius: 8,
                          fontSize: 13,
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
              </>
            ) : (
              <p style={{ color: "var(--fg-muted)", fontSize: 14 }}>
                現在、配信情報は登録されていません。
              </p>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div style={{ position: "sticky", top: 80 }}>
          {/* 作品情報 */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              backgroundColor: "var(--bg-card)",
              padding: "20px",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>作品情報</h3>
            <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 12 }}>
              {movie.release_year && (
                <>
                  <dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>公開年</dt>
                  <dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.release_year}年</dd>
                </>
              )}
              {movie.runtime_minutes && (
                <>
                  <dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>上映時間</dt>
                  <dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.runtime_minutes}分</dd>
                </>
              )}
              {movie.country && (
                <>
                  <dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>製作国</dt>
                  <dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.country}</dd>
                </>
              )}
              {movie.age_rating && (
                <>
                  <dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>映倫区分</dt>
                  <dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.age_rating}</dd>
                </>
              )}
            </dl>
          </div>

          {/* ユーザー評価 */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              backgroundColor: "var(--bg-card)",
              padding: "20px",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>ユーザー評価</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>{SAMPLE_RATING}</span>
              <div>
                <div style={{ color: "var(--star)", fontSize: 16, letterSpacing: 2 }}>★★★★☆</div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                  {SAMPLE_REVIEWS.toLocaleString()}件
                </div>
              </div>
            </div>
            {[
              { star: 5, pct: 55 },
              { star: 4, pct: 27 },
              { star: 3, pct: 12 },
              { star: 2, pct: 4 },
              { star: 1, pct: 2 },
            ].map(({ star, pct }) => (
              <div
                key={star}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: "var(--fg-muted)", width: 12 }}>{star}</span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    backgroundColor: "var(--bg)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: "var(--star)",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: "var(--fg-muted)", width: 28 }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Share */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              backgroundColor: "var(--bg-card)",
              padding: "16px 20px",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>シェアする</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {["X", "FB", "LINE"].map((s) => (
                <button
                  key={s}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--fg-muted)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 48px" }}>
        <Link
          href="/movies"
          style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}
        >
          ← 作品一覧に戻る
        </Link>
      </div>
    </div>
  );
}
