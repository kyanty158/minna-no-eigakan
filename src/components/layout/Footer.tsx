import Link from "next/link";

const cols = [
  {
    title: "コンテンツ",
    links: [
      { label: "作品を探す", href: "/movies" },
      { label: "シーンから探す", href: "/scene/couple" },
      { label: "ジャンルから探す", href: "/genre/romance" },
      { label: "特集・まとめ", href: "/articles" },
      { label: "VOD比較", href: "/vod" },
    ],
  },
  {
    title: "人気のVOD",
    links: [
      { label: "U-NEXT", href: "/vod/unext" },
      { label: "DMM TV", href: "/vod/dmm-tv" },
      { label: "Hulu", href: "/vod/hulu" },
      { label: "ABEMAプレミアム", href: "/vod/abema" },
    ],
  },
  {
    title: "サイト情報",
    links: [
      { label: "みんなの映画館とは", href: "/about" },
      { label: "お問い合わせ", href: "/contact" },
      { label: "プライバシーポリシー", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        marginTop: 0,
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px 32px" }}>
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 22 }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>みんなの映画館</div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              今日観たい映画・ドラマが見つかる
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
            marginBottom: 40,
          }}
        >
          {cols.map((col) => (
            <div key={col.title}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 14,
                  color: "var(--fg)",
                }}
              >
                {col.title}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 8 }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: 13,
                        color: "var(--fg-muted)",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>
              本サイトはアフィリエイトリンクを含みます。
            </p>
            <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              配信状況は記事更新時点の情報です。最新情報は各公式サイトでご確認ください。
            </p>
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            © 2026 みんなの映画館. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
