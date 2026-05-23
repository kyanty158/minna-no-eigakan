import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 20px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 24 }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              みんなの映画館
            </div>
            <div style={{ fontSize: 10, color: "var(--fg-muted)", lineHeight: 1 }}>
              今日観たい映画・ドラマが見つかる
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
          <Link href="/" style={{ fontSize: 14, color: "var(--fg-muted)" }} className="nav-link">
            ホーム
          </Link>
          <Link href="/movies" style={{ fontSize: 14, color: "var(--fg-muted)" }} className="nav-link">
            作品を探す
          </Link>
          <Link href="/genre/romance" style={{ fontSize: 14, color: "var(--fg-muted)" }} className="nav-link">
            ジャンル
          </Link>
          <Link href="/articles" style={{ fontSize: 14, color: "var(--fg-muted)" }} className="nav-link">
            特集・まとめ
          </Link>
          <Link href="/vod" style={{ fontSize: 14, color: "var(--fg-muted)" }} className="nav-link">
            配信サービス
          </Link>
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <Link
            href="/movies"
            style={{
              fontSize: 13,
              color: "var(--fg-muted)",
              padding: "6px 8px",
            }}
          >
            🔍
          </Link>
          <Link
            href="/vod"
            style={{
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            無料で登録
          </Link>
        </div>
      </div>
    </header>
  );
}
