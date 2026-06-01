import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Movie, Article } from "@/types";
import AdBanner from "@/components/ui/AdBanner";
import SearchBox from "@/components/ui/SearchBox";

const BASE_URL = "https://minna-no-eigakan.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const { data: movie } = await supabase
    .from("movies")
    .select("poster_url")
    .not("poster_url", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  const ogImage = (movie as { poster_url: string } | null)?.poster_url;
  return {
    openGraph: {
      siteName: "みんなの映画館",
      locale: "ja_JP",
      type: "website",
      url: BASE_URL,
      title: "みんなの映画館｜今日観たい映画・ドラマが見つかる",
      description: "カップルで見たい映画、おうちデート映画、泣ける恋愛映画など、気分やシーンから映画・ドラマが探せるサイトです。",
      ...(ogImage ? { images: [{ url: ogImage, width: 500, height: 750, alt: "みんなの映画館" }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

const scenes = [
  { name: "カップル", slug: "couple", icon: "♡", bg: "linear-gradient(135deg, #3d1a2e 0%, #6b2d4a 50%, #8b4560 100%)", desc: "二人で楽しめる名作" },
  { name: "おうちデート", slug: "home-date", icon: "⌂", bg: "linear-gradient(135deg, #2a1f0e 0%, #5c3d1a 50%, #8b6230 100%)", desc: "自宅で映画デート" },
  { name: "雨の日", slug: "rainy-day", icon: "☂", bg: "linear-gradient(135deg, #0f2237 0%, #1e3f5c 50%, #2d5c7a 100%)", desc: "しっとりと観たい" },
  { name: "泣ける", slug: "cry-alone", icon: "◇", bg: "linear-gradient(135deg, #1a2040 0%, #2d3566 50%, #3d4880 100%)", desc: "感動して泣きたい夜" },
  { name: "気まずくない", slug: "not-awkward", icon: "☺", bg: "linear-gradient(135deg, #1a2e1e 0%, #2d4e35 50%, #3d6648 100%)", desc: "安心して一緒に観る" },
];

const genres = [
  { name: "恋愛", slug: "romance" },
  { name: "青春", slug: "youth" },
  { name: "泣ける", slug: "tearjerker" },
  { name: "韓国ドラマ", slug: "korean-drama" },
  { name: "アニメ", slug: "anime" },
  { name: "コメディ", slug: "comedy" },
  { name: "ホラー", slug: "horror" },
  { name: "サスペンス", slug: "suspense" },
];

const vodServices = [
  { slug: "unext", name: "U-NEXT", desc: "見放題作品数No.1。映画・ドラマ・アニメも充実。", trial: "31日間無料", color: "#1a1a2e" },
  { slug: "dmm-tv", name: "DMM TV", desc: "アニメも映画もバラエティも。コスパよく楽しめる。", trial: "30日間無料", color: "#111827" },
  { slug: "hulu", name: "Hulu", desc: "海外ドラマ・映画のラインナップが豊富。", trial: "2週間無料", color: "#0a2540" },
  { slug: "abema", name: "ABEMA", desc: "オリジナル作品も豊富。ニュースやスポーツも。", trial: "2週間無料", color: "#001a33" },
];

async function getFeaturedMovie(): Promise<Movie | null> {
  const { data } = await supabase
    .from("movies")
    .select("id, title, slug, release_year, runtime_minutes, summary, poster_url, country")
    .not("poster_url", "is", null)
    .limit(20);
  if (!data || data.length === 0) return null;
  // ランダムに1本選ぶ（SSRなので毎リクエスト変わる）
  return (data as Movie[])[Math.floor(Math.random() * data.length)];
}

async function getLatestArticles(): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, thumbnail_url")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(2);
  return (data as Article[]) ?? [];
}

async function getMovieCount(): Promise<number> {
  const { count } = await supabase
    .from("movies")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

const articleFallbackBgs = [
  "linear-gradient(135deg, #1e3f5c 0%, #0f2237 100%)",
  "linear-gradient(135deg, #6b2d4a 0%, #3d1a2e 100%)",
];

export default async function HomePage() {
  const [featuredMovie, articles, movieCount] = await Promise.all([
    getFeaturedMovie(),
    getLatestArticles(),
    getMovieCount(),
  ]);

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, #f7f5f1 55%, #2d1f15 55%)", overflow: "hidden" }}>
        <div className="hero-grid" style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 10, letterSpacing: "0.06em" }}>
              映画 {movieCount}本掲載中
            </p>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 16, color: "var(--fg)" }}>
              今日観たい<br />映画・ドラマが見つかる
            </h1>
            <p style={{ color: "var(--fg-muted)", marginBottom: 28, lineHeight: 1.7 }}>
              気分やシーンに合わせておすすめ作品を提案。<br />
              あなたの「観たい！」がきっと見つかります。
            </p>
            <SearchBox variant="hero" placeholder="作品名で探す（例: 恋空）" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>人気のジャンル：</span>
              {["恋愛", "泣ける", "青春", "アニメ", "サスペンス"].map((kw) => {
                const g = genres.find((x) => x.name === kw);
                return (
                  <Link key={kw} href={g ? `/genre/${g.slug}` : "/movies"} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border-hover)", color: "var(--fg-muted)", backgroundColor: "var(--bg-card)" }}>
                    {kw}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right — featured movie poster or decorative */}
          <div className="hero-right" style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "linear-gradient(160deg, #3d1f10 0%, #5c2d18 30%, #1a0f08 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(200,120,60,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(80,40,20,0.4) 0%, transparent 50%)" }} />
            {featuredMovie?.poster_url ? (
              <Image
                src={featuredMovie.poster_url}
                alt={featuredMovie.title}
                fill
                style={{ objectFit: "cover", opacity: 0.6 }}
                sizes="560px"
                priority
              />
            ) : null}
            <div style={{ position: "relative", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
              {!featuredMovie?.poster_url && (
                <>
                  <div style={{ fontSize: 64, marginBottom: 12, opacity: 0.4 }}>🎬</div>
                  <p style={{ fontSize: 18, fontWeight: 600, opacity: 0.7 }}>今日なに観る？</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Scene Cards ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>シーンから探す</h2>
        </div>
        <div className="scene-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {scenes.map((scene) => (
            <Link key={scene.slug} href={`/scene/${scene.slug}`} style={{ display: "block", borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", background: scene.bg, position: "relative", textDecoration: "none" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 14px", color: "#fff" }}>
                <div style={{ fontSize: 22, marginBottom: 4, opacity: 0.9 }}>{scene.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{scene.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{scene.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 広告スロット ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 32px", display: "flex", justifyContent: "center" }}>
        <AdBanner size="leaderboard" className="ad-leaderboard" />
      </div>

      {/* ── Today's Pick (DB連動) ── */}
      {featuredMovie && (
        <section style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
            <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "center", backgroundColor: "var(--bg)", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
              {/* Poster */}
              <div className="featured-poster" style={{ aspectRatio: "2/3", position: "relative", minHeight: 220, background: "linear-gradient(135deg, #2d1a2e 0%, #5c3040 100%)" }}>
                {featuredMovie.poster_url ? (
                  <Image src={featuredMovie.poster_url} alt={featuredMovie.title} fill style={{ objectFit: "cover" }} sizes="240px" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 48, opacity: 0.3 }}>🎬</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: "32px 32px 32px 0" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, marginBottom: 12 }}>
                  ✦ 今日のおすすめ
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>
                  {featuredMovie.title}
                </h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                    {[featuredMovie.release_year ? `${featuredMovie.release_year}年` : null, featuredMovie.runtime_minutes ? `${featuredMovie.runtime_minutes}分` : null, featuredMovie.country].filter(Boolean).join(" · ")}
                  </span>
                </div>
                {featuredMovie.summary && (
                  <p style={{ color: "var(--fg-muted)", lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>
                    {featuredMovie.summary}
                  </p>
                )}
                <Link
                  href={`/movies/${featuredMovie.slug}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "var(--btn-dark)", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}
                >
                  どこで見れる？ →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 特集・まとめ ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>特集・まとめ</h2>
          <Link href="/articles" style={{ fontSize: 13, color: "var(--fg-muted)" }}>すべて見る →</Link>
        </div>

        {articles.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {articles.map((a, i) => (
              <Link key={a.id} href={`/articles/${a.slug}`} style={{ display: "block", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", textDecoration: "none" }}>
                <div style={{ aspectRatio: "16/7", background: a.thumbnail_url ? undefined : articleFallbackBgs[i % 2], position: "relative", display: "flex", alignItems: "flex-end" }}>
                  {a.thumbnail_url ? (
                    <Image src={a.thumbnail_url} alt={a.title} fill style={{ objectFit: "cover" }} sizes="560px" />
                  ) : null}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                  <div style={{ position: "relative", padding: "20px 20px 16px", color: "#fff" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{a.title}</p>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6 }}>{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: "雨の日デートで見たい映画15選", slug: "rainy-day-movies", desc: "しっとり、ほっこり。雨の日にぴったりな作品を集めました。", bg: "linear-gradient(135deg, #1e3f5c 0%, #0f2237 100%)" },
              { title: "カップルで見たい映画15選", slug: "couple-movies", desc: "一緒に笑って、キュンとして。二人の時間がもっと楽しくなる作品を。", bg: "linear-gradient(135deg, #6b2d4a 0%, #3d1a2e 100%)" },
            ].map((a) => (
              <Link key={a.slug} href={`/articles/${a.slug}`} style={{ display: "block", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", textDecoration: "none" }}>
                <div style={{ aspectRatio: "16/7", background: a.bg, position: "relative", display: "flex", alignItems: "flex-end" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                  <div style={{ position: "relative", padding: "20px 20px 16px", color: "#fff" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{a.title}</p>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6 }}>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 配信サービス ── */}
      <section style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>配信サービスで探す</h2>
            <Link href="/vod" style={{ fontSize: 13, color: "var(--fg-muted)" }}>すべて見る →</Link>
          </div>
          <div className="vod-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {vodServices.map((v) => (
              <div key={v.slug} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "20px 16px", backgroundColor: "var(--bg)", textDecoration: "none" }}>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "0.04em", marginBottom: 4, color: "var(--fg)" }}>{v.name}</div>
                <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>{v.trial}</div>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 14 }}>{v.desc}</p>
                <Link href={`/go/${v.slug}`} style={{ display: "block", textAlign: "center", backgroundColor: "var(--btn-dark)", color: "#fff", padding: "9px", borderRadius: 7, fontSize: 12, fontWeight: 600 }}>
                  無料で試す →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ジャンル ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>ジャンルから探す</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {genres.map((genre) => (
            <Link key={genre.slug} href={`/genre/${genre.slug}`} style={{ fontSize: 14, padding: "8px 20px", borderRadius: 30, border: "1px solid var(--border)", color: "var(--fg-muted)", backgroundColor: "var(--bg-card)", textDecoration: "none" }}>
              {genre.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 広告スロット (下部) ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 32px", display: "flex", justifyContent: "center" }}>
        <AdBanner size="leaderboard" />
      </div>

      {/* ── 最終CTA ── */}
      <section style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
          <div style={{ background: "linear-gradient(135deg, #2d1f15 0%, #1a1208 100%)", borderRadius: 18, padding: "40px 32px", textAlign: "center", color: "#fff" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", marginBottom: 10 }}>
              観たい作品はもう決まった？
            </p>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>
              無料トライアルで、今すぐおうちで映画館
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 28, maxWidth: 560, margin: "0 auto 28px" }}>
              U-NEXTやDMM TVなら無料お試し期間つき。期間内に解約すれば料金は一切かかりません。
              自分にぴったりの配信サービスを比べて選びましょう。
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/vod" style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", padding: "13px 30px", borderRadius: 10, fontSize: 15, fontWeight: 700 }}>
                おすすめVODを比較する →
              </Link>
              <Link href="/movies" style={{ display: "inline-block", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "13px 30px", borderRadius: 10, fontSize: 15, fontWeight: 700 }}>
                作品をもっと探す
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
