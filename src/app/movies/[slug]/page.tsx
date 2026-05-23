import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Movie, MovieAvailability } from "@/types";
import AdBanner from "@/components/ui/AdBanner";

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

async function getRelatedMovies(movieId: string, slug: string): Promise<Movie[]> {
  // 同じジャンルの映画を取得
  const { data: genreLinks } = await supabase
    .from("movie_genres")
    .select("genre_id")
    .eq("movie_id", movieId)
    .limit(3);

  if (!genreLinks || genreLinks.length === 0) return [];

  const genreIds = genreLinks.map((g) => g.genre_id);

  const { data: relatedLinks } = await supabase
    .from("movie_genres")
    .select("movie:movies(id, title, slug, release_year, poster_url, country)")
    .in("genre_id", genreIds)
    .neq("movie_id", movieId)
    .limit(20);

  if (!relatedLinks) return [];

  // 重複除去して6本まで
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) return {};
  return {
    title: `『${movie.title}』はどこで見れる？配信中のVODを紹介`,
    description: `『${movie.title}』(${movie.release_year ?? ""}) が視聴できるVODサービスを紹介します。${movie.summary ?? ""}`,
    openGraph: {
      title: `『${movie.title}』はどこで見れる？`,
      description: movie.summary ?? undefined,
      images: movie.poster_url ? [{ url: movie.poster_url }] : undefined,
    },
  };
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <span style={{ color: "var(--star)", letterSpacing: 2, fontSize: 18 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

const SAMPLE_RATING = 4.2;
const SAMPLE_REVIEWS = 12845;

export default async function MovieDetailPage({ params }: Props) {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) notFound();

  const [availability, relatedMovies] = await Promise.all([
    getAvailability(movie.id),
    getRelatedMovies(movie.id, slug),
  ]);

  const pageUrl = `https://minna-no-eigakan.vercel.app/movies/${slug}`;
  const shareText = `『${movie.title}』はどこで見れる？ | みんなの映画館`;

  // JSON-LD 構造化データ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    ...(movie.original_title ? { alternateName: movie.original_title } : {}),
    ...(movie.release_year ? { datePublished: `${movie.release_year}` } : {}),
    ...(movie.description ? { description: movie.description } : {}),
    ...(movie.poster_url ? { image: movie.poster_url } : {}),
    ...(movie.runtime_minutes ? { duration: `PT${movie.runtime_minutes}M` } : {}),
    ...(movie.country ? { countryOfOrigin: { "@type": "Country", name: movie.country } } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SAMPLE_RATING,
      reviewCount: SAMPLE_REVIEWS,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ backgroundColor: "var(--bg)" }}>
        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #2d1f15 0%, #1a1208 100%)", borderBottom: "1px solid var(--border)" }}>
          <div className="detail-hero-grid" style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 40, alignItems: "start" }}>
            {/* Poster */}
            <div className="detail-poster" style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "2/3", background: "linear-gradient(135deg, #3d1f10 0%, #6b3520 50%, #8b5030 100%)", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              {movie.poster_url ? (
                <Image src={movie.poster_url} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="280px" priority />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 64, opacity: 0.3 }}>🎬</span>
                </div>
              )}
            </div>

            {/* Info */}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <StarRating rating={SAMPLE_RATING} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>{SAMPLE_RATING}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>({SAMPLE_REVIEWS.toLocaleString()}件)</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                {movie.release_year && <span>{movie.release_year}年</span>}
                {movie.runtime_minutes && <><span>｜</span><span>{movie.runtime_minutes}分</span></>}
                {movie.country && <><span>｜</span><span>{movie.country}</span></>}
              </div>
              {movie.summary && (
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", marginBottom: 28 }}>{movie.summary}</p>
              )}
              <Link href="#availability" style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#fff", color: "var(--fg)", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                どこで見れる？ →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="detail-body-grid" style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>
          {/* Left column */}
          <div>
            {/* PR notice */}
            <p style={{ fontSize: 11, color: "var(--fg-muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", marginBottom: 32, backgroundColor: "var(--bg-card)" }}>
              本ページは広告・アフィリエイトリンクを含みます。
            </p>

            {/* あらすじ */}
            {movie.description && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border)" }}>あらすじ</h2>
                <p style={{ lineHeight: 1.9, color: "var(--fg-muted)", fontSize: 15 }}>{movie.description}</p>
              </section>
            )}

            {/* 広告スロット（あらすじの下） */}
            <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
              <AdBanner size="leaderboard" />
            </div>

            {/* こんな人におすすめ */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border)" }}>こんな人におすすめ</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "♡", text: "リアルな恋愛映画が観たい" },
                  { icon: "!", text: "切なくて余韻が残る作品が好き" },
                  { icon: "◎", text: "等身大の2人の物語に共感したい" },
                  { icon: "☆", text: "感情を揺さぶられたい" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", fontSize: 14 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </section>

            {/* 配信サービス */}
            <section id="availability" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border)" }}>
                配信サービス
              </h2>
              {availability.length > 0 ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                    {availability.map((a) => (
                      <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px", backgroundColor: "var(--bg-card)" }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.vod_service?.name}</div>
                        <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 4 }}>{a.availability_type}</div>
                        {a.vod_service?.free_trial_text && (
                          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 10 }}>
                            {a.vod_service.free_trial_text}
                          </div>
                        )}
                        <Link href={`/go/${a.vod_service?.slug}`} style={{ display: "block", textAlign: "center", backgroundColor: "var(--btn-dark)", color: "#fff", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                          今すぐ観る →
                        </Link>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                    ※配信状況は記事更新時点の情報です。最新情報は各公式サイトでご確認ください。
                  </p>
                </>
              ) : (
                <div style={{ padding: "24px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", textAlign: "center" }}>
                  <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 12 }}>現在、配信情報は登録されていません。</p>
                  <Link href="/vod" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>おすすめVODで探す →</Link>
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <div className="detail-sidebar" style={{ position: "sticky", top: 80 }}>
            {/* 作品情報 */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "20px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>作品情報</h3>
              <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 12 }}>
                {movie.release_year && (<><dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>公開年</dt><dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.release_year}年</dd></>)}
                {movie.runtime_minutes && (<><dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>上映時間</dt><dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.runtime_minutes}分</dd></>)}
                {movie.country && (<><dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>製作国</dt><dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.country}</dd></>)}
                {movie.age_rating && (<><dt style={{ fontSize: 12, color: "var(--fg-muted)" }}>映倫区分</dt><dd style={{ fontSize: 13, fontWeight: 500 }}>{movie.age_rating}</dd></>)}
              </dl>
            </div>

            {/* ユーザー評価 */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "20px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>ユーザー評価</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>{SAMPLE_RATING}</span>
                <div>
                  <div style={{ color: "var(--star)", fontSize: 16, letterSpacing: 2 }}>★★★★☆</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{SAMPLE_REVIEWS.toLocaleString()}件</div>
                </div>
              </div>
              {[{ star: 5, pct: 55 }, { star: 4, pct: 27 }, { star: 3, pct: 12 }, { star: 2, pct: 4 }, { star: 1, pct: 2 }].map(({ star, pct }) => (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)", width: 12 }}>{star}</span>
                  <div style={{ flex: 1, height: 6, backgroundColor: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "var(--star)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)", width: 28 }}>{pct}%</span>
                </div>
              ))}
            </div>

            {/* 広告スロット（サイドバー） */}
            <div style={{ marginBottom: 16 }}>
              <AdBanner size="rectangle" />
            </div>

            {/* シェア */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "16px 20px" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>シェアする</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", fontSize: 12, fontWeight: 600, color: "var(--fg-muted)" }}
                >
                  X (旧Twitter)
                </a>
                <a
                  href={`https://line.me/R/msg/text/?${encodeURIComponent(shareText + "\n" + pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg)", fontSize: 12, fontWeight: 600, color: "var(--fg-muted)" }}
                >
                  LINEで送る
                </a>
              </div>
            </div>
          </div>
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

        {/* Back link */}
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 20px 48px" }}>
          <Link href="/movies" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>
            ← 作品一覧に戻る
          </Link>
        </div>
      </div>
    </>
  );
}
