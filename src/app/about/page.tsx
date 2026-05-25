import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "みんなの映画館とは｜運営方針",
  description: "「みんなの映画館」は、気分やシーンから映画・ドラマを探し、どの動画配信サービス(VOD)で見れるかをまとめて紹介するメディアです。運営方針や情報の取り扱いについてご案内します。",
};

const sectionTitle: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12, paddingBottom: 10, borderBottom: "2px solid var(--border)" };
const para: React.CSSProperties = { fontSize: 15, lineHeight: 1.9, color: "var(--fg-muted)", marginBottom: 12 };

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>みんなの映画館とは</h1>
        </div>
      </section>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 56px" }}>
        <p style={para}>
          「みんなの映画館」は、<strong style={{ color: "var(--fg)" }}>気分やシーンから映画・ドラマを探せる</strong>メディアです。「カップルで観たい」「泣きたい夜に」「雨の日に」——そんなあなたの“今の気分”にぴったりの作品と、それが<strong style={{ color: "var(--fg)" }}>どの動画配信サービス(VOD)で見れるか</strong>をまとめて紹介しています。
        </p>

        <h2 style={sectionTitle}>サイトの目的</h2>
        <p style={para}>
          観たい作品は見つかっても「結局どこで配信しているの？」と迷うことは少なくありません。当サイトは、作品ごとの配信状況（見放題・レンタル・購入）を一覧で確認でき、無料トライアルを活用してお得に視聴を始められるようサポートすることを目的としています。
        </p>

        <h2 style={sectionTitle}>配信情報の取り扱いについて</h2>
        <p style={para}>
          掲載している配信状況や料金・無料期間は、記事の更新時点で確認できた情報をもとにしています。各サービスの配信ラインナップやキャンペーンは予告なく変更される場合があります。ご利用前に、必ず各公式サイトで最新情報をご確認ください。
        </p>

        <h2 style={sectionTitle}>広告・アフィリエイトについて</h2>
        <p style={para}>
          当サイトは、第三者配信の広告サービスおよびアフィリエイトプログラムを利用しています。記事内のリンクを経由してサービスにご登録いただくと、当サイトに紹介料が支払われることがあります。掲載順位やおすすめは、作品数・コスパ・使いやすさなどをもとに編集部の視点で選定しており、ユーザーにとって役立つ情報の提供を第一に運営しています。
        </p>

        <h2 style={sectionTitle}>お問い合わせ</h2>
        <p style={para}>
          ご意見・ご要望、掲載情報の誤りのご指摘などは、<Link href="/contact" style={{ color: "var(--accent)", fontWeight: 600 }}>お問い合わせページ</Link>よりお気軽にご連絡ください。
        </p>

        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--fg-muted)" }}>← ホームに戻る</Link>
        </div>
      </div>
    </div>
  );
}
