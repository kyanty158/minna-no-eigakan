import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "みんなの映画館のプライバシーポリシー。個人情報の取り扱い、アクセス解析ツール、広告配信(Cookie)、アフィリエイトプログラム、免責事項について記載しています.",
};

const sectionTitle: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12, paddingBottom: 10, borderBottom: "2px solid var(--border)" };
const para: React.CSSProperties = { fontSize: 14, lineHeight: 1.9, color: "var(--fg-muted)", marginBottom: 12 };

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>プライバシーポリシー</h1>
        </div>
      </section>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 56px" }}>
        <p style={para}>
          みんなの映画館（以下「当サイト」）は、利用者のプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、当サイトにおける情報の取り扱いについて定めるものです。
        </p>

        <h2 style={sectionTitle}>個人情報の利用目的</h2>
        <p style={para}>
          当サイトでは、お問い合わせの際に氏名やメールアドレスなどの個人情報をご提供いただく場合があります。これらの情報は、お問い合わせへの回答や必要な連絡のためにのみ利用し、ご本人の同意なく第三者に提供することはありません。
        </p>

        <h2 style={sectionTitle}>アクセス解析ツールについて</h2>
        <p style={para}>
          当サイトでは、サイトの利用状況を把握するためにアクセス解析ツール（Google アナリティクス等）を利用する場合があります。これらのツールはトラフィックデータの収集にCookieを使用しますが、このデータは匿名で収集されており、個人を特定するものではありません。
        </p>

        <h2 style={sectionTitle}>広告配信について</h2>
        <p style={para}>
          当サイトは、第三者配信の広告サービス（Google アドセンス等）を利用する場合があります。広告配信事業者は、利用者の興味に応じた広告を表示するためにCookieを使用することがあります。Cookieを無効にする設定や、Google アドセンスに関する詳細は「広告 – ポリシーと規約 – Google」をご確認ください。
        </p>

        <h2 style={sectionTitle}>アフィリエイトプログラムについて</h2>
        <p style={para}>
          当サイトは、各動画配信サービスのアフィリエイトプログラムに参加しています。利用者が当サイトのリンクを経由して各サービスにご登録・ご購入された場合、当サイトに紹介料が支払われることがあります。なお、紹介料の有無が掲載内容の評価に影響しないよう、公正な情報提供に努めています。
        </p>

        <h2 style={sectionTitle}>免責事項</h2>
        <p style={para}>
          当サイトに掲載する配信状況・料金・無料期間などの情報は、正確性を期すよう努めていますが、その完全性・最新性を保証するものではありません。各サービスの最新情報は必ず公式サイトでご確認ください。当サイトの情報を利用して生じたいかなる損害についても、当サイトは責任を負いかねます。
        </p>

        <h2 style={sectionTitle}>著作権について</h2>
        <p style={para}>
          当サイトで使用している作品情報・ポスター画像等の著作権・商標権は、各権利者に帰属します。万一、権利を侵害する内容がございましたら、<Link href="/contact" style={{ color: "var(--accent)", fontWeight: 600 }}>お問い合わせ</Link>よりご連絡ください。速やかに対応いたします。
        </p>

        <h2 style={sectionTitle}>本ポリシーの変更</h2>
        <p style={para}>
          当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。変更後の内容は、本ページに掲載した時点から効力を生じるものとします。
        </p>

        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--fg-muted)" }}>← ホームに戻る</Link>
        </div>
      </div>
    </div>
  );
}
