import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "みんなの映画館へのお問い合わせ。掲載情報の誤りのご指摘、ご意見・ご要望などはこちらからご連絡ください。",
};

// ▼運営者のメールアドレスに置き換えてください
const CONTACT_EMAIL = "info@example.com";

const para: React.CSSProperties = { fontSize: 15, lineHeight: 1.9, color: "var(--fg-muted)", marginBottom: 12 };

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>お問い合わせ</h1>
        </div>
      </section>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 56px" }}>
        <p style={para}>
          みんなの映画館をご利用いただきありがとうございます。配信情報の誤りのご指摘、ご意見・ご要望、掲載・提携に関するご相談などは、下記よりお気軽にお問い合わせください。内容を確認のうえ、必要に応じてご返信いたします。
        </p>

        <div style={{ border: "1px solid var(--border)", borderRadius: 14, backgroundColor: "var(--bg-card)", padding: "28px 24px", marginTop: 24, textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>メールでのお問い合わせ</p>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18 }}>
            下記ボタンからメールソフトが開きます。件名・お名前・内容をご記入のうえ送信してください。
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("【みんなの映画館】お問い合わせ")}`}
            style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", fontWeight: 700, padding: "13px 32px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}
          >
            メールで問い合わせる →
          </a>
        </div>

        <p style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.8, marginTop: 20 }}>
          ※配信状況・料金・無料期間に関するお問い合わせは、各動画配信サービスの公式サポートへ直接ご連絡いただくとスムーズです。当サイトでは各サービスの契約・解約手続きの代行は行っておりません。
        </p>

        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--fg-muted)" }}>← ホームに戻る</Link>
        </div>
      </div>
    </div>
  );
}
