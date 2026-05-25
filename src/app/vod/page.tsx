import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { VodService } from "@/types";
import AdBanner from "@/components/ui/AdBanner";

export const metadata: Metadata = {
  title: "VOD比較ランキング｜映画・ドラマを見るならどの動画配信サービス？",
  description: "U-NEXT・DMM TV・Hulu・ABEMAなど人気の動画配信サービス(VOD)を、月額料金・無料期間・特徴で徹底比較。映画やドラマ、恋愛・カップル向けにおすすめのVODをランキングで紹介します。",
};

// 表示用メタ（DBに無い「おすすめポイント」「順位」を補う）
const META: Record<string, { rank: number; catch: string; points: string[]; recommendedFor: string }> = {
  unext: { rank: 1, catch: "見放題作品数No.1の王道VOD", points: ["見放題40万本以上の圧倒的ラインナップ", "毎月1,200円分のポイントが付与", "雑誌・マンガ・最新レンタル作品も"], recommendedFor: "とにかく作品数で選びたい人" },
  "dmm-tv": { rank: 2, catch: "月額550円の高コスパVOD", points: ["業界最安級の月額550円", "アニメ作品に特に強い", "DMMの各種特典・ポイントも"], recommendedFor: "コスパ重視・アニメ好きな人" },
  hulu: { rank: 3, catch: "海外ドラマ・国内ドラマに強い", points: ["全作品が追加料金なしで見放題", "海外ドラマ・日テレ系番組が充実", "リアルタイム配信にも対応"], recommendedFor: "ドラマをたっぷり観たい人" },
  abema: { rank: 4, catch: "韓流・恋愛リアリティに強い", points: ["韓国ドラマ・恋愛リアリティが豊富", "ABEMAオリジナル番組が見放題", "ニュース・スポーツも楽しめる"], recommendedFor: "韓流・恋愛番組が好きな人" },
  "amazon-prime": { rank: 5, catch: "Prime特典つきで月額600円", points: ["送料無料などPrime特典もまとめて", "幅広いジャンルをカバー", "オリジナル作品も充実"], recommendedFor: "買い物もまとめてお得にしたい人" },
  lemino: { rank: 6, catch: "ドコモ発の総合エンタメVOD", points: ["映画・ドラマ・スポーツまで", "dポイントが貯まる・使える", "ドコモ以外でも利用OK"], recommendedFor: "dポイントを活用したい人" },
};

const RANK_BADGE = ["#c9a227", "#9aa3ad", "#b07d4f"]; // 金・銀・銅

const FAQ = [
  { q: "無料トライアル中に解約すれば料金はかかりませんか？", a: "はい。各サービスとも無料お試し期間内に解約すれば料金は発生しません。お試し期間や条件はキャンペーンにより変わるため、登録前に各公式サイトでご確認ください。" },
  { q: "VODは複数契約したほうがいいですか？", a: "まずは見放題作品数の多いU-NEXTなど1つから始めるのがおすすめです。観たい作品の配信先に合わせて選ぶと、ムダなく楽しめます。" },
  { q: "スマホやテレビでも観られますか？", a: "主要なVODは専用アプリに対応しており、スマホ・タブレット・テレビ（Fire TV等）で視聴できます。" },
  { q: "解約はかんたんにできますか？", a: "各サービスの会員ページからいつでもオンラインで解約できます。電話などは基本的に不要です。" },
];

export default async function VodPage() {
  const { data } = await supabase.from("vod_services").select("*");
  const services = ((data as VodService[] | null) ?? []).slice().sort(
    (a, b) => (META[a.slug]?.rank ?? 99) - (META[b.slug]?.rank ?? 99)
  );

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #2d1f15 0%, #1a1208 100%)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 20px", color: "#fff" }}>
          <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", marginBottom: 16 }}>
            動画配信サービス比較
          </div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>
            VODおすすめ比較ランキング<br />【2026年最新】
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", maxWidth: 720 }}>
            「映画やドラマを観たいけど、どのサービスを選べばいい？」という方へ。人気の動画配信サービス(VOD)を、月額料金・無料期間・作品の特徴で比較しました。気になるサービスは、まず無料トライアルから気軽に試せます。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px 0" }}>
        <p style={{ fontSize: 11, color: "var(--fg-muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", backgroundColor: "var(--bg-card)" }}>
          本ページは広告・アフィリエイトリンクを含みます。掲載の料金・無料期間は変更される場合があります。最新情報は各公式サイトをご確認ください。
        </p>
      </div>

      {/* 比較表 */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>料金・無料期間の比較表</h2>
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card)", borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "14px 16px", fontWeight: 700 }}>サービス</th>
                <th style={{ textAlign: "left", padding: "14px 16px", fontWeight: 700 }}>月額(税込)</th>
                <th style={{ textAlign: "left", padding: "14px 16px", fontWeight: 700 }}>無料期間</th>
                <th style={{ padding: "14px 16px" }}></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < services.length - 1 ? "1px solid var(--border)" : "none", backgroundColor: "var(--bg-card)" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                    <Link href={`/vod/${s.slug}`} style={{ color: "var(--fg)" }}>{s.name}</Link>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--fg-muted)" }}>{s.monthly_price ? `${s.monthly_price.toLocaleString()}円` : "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {s.free_trial_text ? <span style={{ color: "var(--accent)", fontWeight: 600 }}>{s.free_trial_text}</span> : "—"}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Link href={`/go/${s.slug}`} style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      無料で試す
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 16px", display: "flex", justifyContent: "center" }}>
        <AdBanner size="leaderboard" className="ad-leaderboard" />
      </div>

      {/* ランキング */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px 48px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>おすすめVODランキング</h2>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 24 }}>※作品数・コスパ・使いやすさをもとにした編集部のおすすめ順です。</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {services.map((s, i) => {
            const m = META[s.slug];
            const badgeColor = i < 3 ? RANK_BADGE[i] : "var(--fg-muted)";
            return (
              <div key={s.id} className="vod-rank-card" style={{ display: "grid", gridTemplateColumns: "56px 1fr 200px", gap: 20, alignItems: "center", border: i === 0 ? "1.5px solid var(--accent)" : "1px solid var(--border)", borderRadius: 16, padding: "24px", backgroundColor: "var(--bg-card)", position: "relative" }}>
                {i === 0 && (
                  <span style={{ position: "absolute", top: -11, left: 24, backgroundColor: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>
                    総合おすすめNo.1
                  </span>
                )}
                {/* Rank */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 600 }}>No.</div>
                  <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: badgeColor }}>{i + 1}</div>
                </div>
                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <Link href={`/vod/${s.slug}`} style={{ fontSize: 20, fontWeight: 800 }}>{s.name}</Link>
                    {m && <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{m.catch}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--fg-muted)", marginBottom: 12, flexWrap: "wrap" }}>
                    <span>月額 <strong style={{ color: "var(--fg)" }}>{s.monthly_price ? `${s.monthly_price.toLocaleString()}円` : "—"}</strong></span>
                    {s.free_trial_text && <span>無料期間 <strong style={{ color: "var(--accent)" }}>{s.free_trial_text}</strong></span>}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                    {(m?.points ?? []).map((p) => (
                      <li key={p} style={{ fontSize: 13, color: "var(--fg-muted)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* CTA */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {m && <p style={{ fontSize: 11, color: "var(--fg-muted)", textAlign: "center", lineHeight: 1.5 }}>こんな人に<br /><strong style={{ color: "var(--fg)" }}>{m.recommendedFor}</strong></p>}
                  <Link href={`/go/${s.slug}`} style={{ display: "block", textAlign: "center", backgroundColor: "var(--accent)", color: "#fff", padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                    無料で試す →
                  </Link>
                  <Link href={`/vod/${s.slug}`} style={{ display: "block", textAlign: "center", fontSize: 12, color: "var(--fg-muted)" }}>
                    詳細・配信作品を見る
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>よくある質問</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ.map((f) => (
              <div key={f.q} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", backgroundColor: "var(--bg)" }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--accent)" }}>Q.</span>{f.q}
                </p>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.8, paddingLeft: 22 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
