import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "60px 20px", maxWidth: 480 }}>
        <p style={{ fontSize: 64, marginBottom: 8, opacity: 0.25 }}>🎬</p>
        <p style={{ fontSize: 56, fontWeight: 800, color: "var(--accent)", lineHeight: 1, marginBottom: 16 }}>404</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>お探しのページが見つかりません</h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.8, marginBottom: 28 }}>
          ページが移動・削除されたか、URLが間違っている可能性があります。<br />
          トップページや作品検索からお探しください。
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "inline-block", backgroundColor: "var(--btn-dark)", color: "#fff", padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            ホームに戻る
          </Link>
          <Link href="/movies" style={{ display: "inline-block", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--fg)", padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            作品を探す
          </Link>
        </div>
      </div>
    </div>
  );
}
