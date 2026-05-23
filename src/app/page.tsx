import Link from "next/link";

const scenes = [
  {
    name: "カップル",
    slug: "couple",
    icon: "♡",
    bg: "linear-gradient(135deg, #3d1a2e 0%, #6b2d4a 50%, #8b4560 100%)",
    desc: "二人で楽しめる名作",
  },
  {
    name: "おうちデート",
    slug: "home-date",
    icon: "⌂",
    bg: "linear-gradient(135deg, #2a1f0e 0%, #5c3d1a 50%, #8b6230 100%)",
    desc: "自宅で映画デート",
  },
  {
    name: "雨の日",
    slug: "rainy-day",
    icon: "☂",
    bg: "linear-gradient(135deg, #0f2237 0%, #1e3f5c 50%, #2d5c7a 100%)",
    desc: "しっとりと観たい",
  },
  {
    name: "泣ける",
    slug: "cry-alone",
    icon: "◇",
    bg: "linear-gradient(135deg, #1a2040 0%, #2d3566 50%, #3d4880 100%)",
    desc: "感動して泣きたい夜",
  },
  {
    name: "気まずくない",
    slug: "not-awkward",
    icon: "☺",
    bg: "linear-gradient(135deg, #1a2e1e 0%, #2d4e35 50%, #3d6648 100%)",
    desc: "安心して一緒に観る",
  },
];

const featuredMovie = {
  title: "余命10年",
  slug: "yomei-10-nen",
  year: 2022,
  runtime: 124,
  genres: ["恋愛", "ヒューマンドラマ", "泣ける"],
  rating: 4.3,
  reviews: 12345,
  summary: "限りある時間を、どう生きるか。\n切なくも愛おしい、ふたりの物語。",
};

const featuredArticles = [
  {
    title: "雨の日デートで見たい映画15選",
    slug: "rainy-day-movies",
    desc: "しっとり、ほっこり、まったり。雨の日にぴったりな作品を集めました。",
    count: 15,
    bg: "linear-gradient(135deg, #1e3f5c 0%, #0f2237 100%)",
  },
  {
    title: "カップルで見たい映画15選",
    slug: "couple-movies",
    desc: "一緒に笑って、キュンとして、二人の時間がもっと楽しくなる作品を。",
    count: 15,
    bg: "linear-gradient(135deg, #6b2d4a 0%, #3d1a2e 100%)",
  },
];

const vodServices = [
  {
    slug: "unext",
    name: "U-NEXT",
    desc: "見放題作品数No.1。映画・ドラマ・アニメも充実。",
    trial: "31日間無料",
    color: "#1a1a2e",
  },
  {
    slug: "dmm-tv",
    name: "DMM TV",
    desc: "アニメも映画もバラエティも。コスパよく楽しめる。",
    trial: "30日間無料",
    color: "#111827",
  },
  {
    slug: "hulu",
    name: "Hulu",
    desc: "海外ドラマ・映画のラインナップが豊富。",
    trial: "2週間無料",
    color: "#0a2540",
  },
  {
    slug: "abema",
    name: "ABEMA",
    desc: "オリジナル作品も豊富。ニュースやスポーツも。",
    trial: "2週間無料",
    color: "#001a33",
  },
];

const popularKeywords = ["恋愛", "ヒューマンドラマ", "泣ける", "青春", "サスペンス"];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <span style={{ color: "var(--star)", letterSpacing: 1, fontSize: 14 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #f7f5f1 55%, #2d1f15 55%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "64px 20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                marginBottom: 16,
                color: "var(--fg)",
              }}
            >
              今日観たい<br />
              映画・ドラマが見つかる
            </h1>
            <p style={{ color: "var(--fg-muted)", marginBottom: 28, lineHeight: 1.7 }}>
              気分やシーンに合わせておすすめ作品を提案。<br />
              あなたの「観たい！」がきっと見つかります。
            </p>

            {/* Search bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "var(--bg-card)",
                border: "1.5px solid var(--border)",
                borderRadius: 40,
                padding: "12px 20px",
                marginBottom: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ color: "var(--fg-muted)", fontSize: 16 }}>🔍</span>
              <span style={{ color: "var(--fg-muted)", fontSize: 15 }}>
                作品名・気分・ジャンルで探す
              </span>
            </div>

            {/* Popular keywords */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>人気の検索ワード：</span>
              {popularKeywords.map((kw) => (
                <Link
                  key={kw}
                  href={`/genre/${kw}`}
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "1px solid var(--border-hover)",
                    color: "var(--fg-muted)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  {kw}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — decorative gradient panel */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "linear-gradient(160deg, #3d1f10 0%, #5c2d18 30%, #1a0f08 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Decorative film strip effect */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 30% 40%, rgba(200,120,60,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(80,40,20,0.4) 0%, transparent 50%)",
              }}
            />
            <div style={{ position: "relative", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
              <div style={{ fontSize: 64, marginBottom: 12, opacity: 0.4 }}>🎬</div>
              <p style={{ fontSize: 18, fontWeight: 600, opacity: 0.7 }}>今日なに観る？</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scene Cards ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
          }}
        >
          {scenes.map((scene) => (
            <Link
              key={scene.slug}
              href={`/scene/${scene.slug}`}
              style={{
                display: "block",
                borderRadius: 14,
                overflow: "hidden",
                aspectRatio: "3/4",
                background: scene.bg,
                position: "relative",
                textDecoration: "none",
              }}
            >
              {/* Overlay gradient at bottom */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px 14px",
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4, opacity: 0.9 }}>
                  {scene.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                  {scene.name}
                </div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{scene.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Movie ── */}
      <section style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 32,
              alignItems: "center",
              backgroundColor: "var(--bg)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            {/* Movie still placeholder */}
            <div
              style={{
                aspectRatio: "2/3",
                background: "linear-gradient(135deg, #3d1a2e 0%, #6b2d4a 50%, #8b4560 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                minHeight: 220,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 40% 60%, rgba(200,100,130,0.3) 0%, transparent 60%)",
                }}
              />
              <span style={{ fontSize: 56, opacity: 0.4, position: "relative" }}>🎬</span>
            </div>

            {/* Info */}
            <div style={{ padding: "32px 32px 32px 0" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "var(--accent-light)",
                  color: "var(--accent)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                  marginBottom: 12,
                }}
              >
                ✦ 今日のおすすめ
              </div>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                {featuredMovie.title}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <StarRating rating={featuredMovie.rating} />
                <span style={{ fontWeight: 600, fontSize: 16 }}>{featuredMovie.rating}</span>
                <span style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                  ({featuredMovie.reviews.toLocaleString()}件)
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                  {featuredMovie.year}年 · {featuredMovie.runtime}分
                </span>
              </div>
              <p
                style={{
                  color: "var(--fg-muted)",
                  lineHeight: 1.8,
                  marginBottom: 16,
                  whiteSpace: "pre-line",
                }}
              >
                {featuredMovie.summary}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {featuredMovie.genres.map((g) => (
                  <span
                    key={g}
                    style={{
                      fontSize: 12,
                      padding: "3px 10px",
                      borderRadius: 20,
                      border: "1px solid var(--border)",
                      color: "var(--fg-muted)",
                      backgroundColor: "var(--bg-card)",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
              <Link
                href={`/movies/${featuredMovie.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "var(--btn-dark)",
                  color: "#fff",
                  padding: "13px 28px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                どこで見れる？ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 特集・まとめ ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>特集・まとめ</h2>
          <Link
            href="/articles"
            style={{ fontSize: 13, color: "var(--fg-muted)" }}
          >
            すべて見る →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {featuredArticles.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              style={{
                display: "block",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-card)",
                textDecoration: "none",
              }}
            >
              {/* Cover */}
              <div
                style={{
                  aspectRatio: "16/7",
                  background: a.bg,
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                  }}
                />
                <div style={{ position: "relative", padding: "20px 20px 16px", color: "#fff" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{a.title}</p>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {a.count}選
                </div>
              </div>
              {/* Text */}
              <div style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 配信サービス ── */}
      <section
        style={{
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>配信サービスで探す</h2>
            <Link href="/vod" style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              すべて見る →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {vodServices.map((v) => (
              <Link
                key={v.slug}
                href={`/vod/${v.slug}`}
                style={{
                  display: "block",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "20px 16px",
                  backgroundColor: "var(--bg)",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                    color: "var(--fg)",
                  }}
                >
                  {v.name}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--fg-muted)",
                    lineHeight: 1.6,
                    marginBottom: 12,
                  }}
                >
                  {v.desc}
                </p>
                <Link
                  href={`/go/${v.slug}`}
                  style={{
                    fontSize: 12,
                    color: "var(--accent)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  公式サイトへ →
                </Link>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ジャンル ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>ジャンルから探す</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { name: "恋愛", slug: "romance" },
            { name: "青春", slug: "youth" },
            { name: "泣ける", slug: "tearjerker" },
            { name: "韓国ドラマ", slug: "korean-drama" },
            { name: "アニメ", slug: "anime" },
            { name: "コメディ", slug: "comedy" },
            { name: "ホラー", slug: "horror" },
            { name: "サスペンス", slug: "suspense" },
          ].map((genre) => (
            <Link
              key={genre.slug}
              href={`/genre/${genre.slug}`}
              style={{
                fontSize: 14,
                padding: "8px 20px",
                borderRadius: 30,
                border: "1px solid var(--border)",
                color: "var(--fg-muted)",
                backgroundColor: "var(--bg-card)",
                textDecoration: "none",
              }}
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Email CTA ── */}
      <section
        style={{
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "36px 20px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 36, flexShrink: 0 }}>✉️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>
              新着・おすすめ作品をメールでお届け
            </p>
            <p style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              気になる作品や特集の最新情報をお届けします。
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <input
              type="email"
              placeholder="メールアドレスを入力"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                width: 220,
                backgroundColor: "var(--bg)",
                color: "var(--fg)",
                outline: "none",
              }}
            />
            <button
              style={{
                backgroundColor: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              登録する
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
