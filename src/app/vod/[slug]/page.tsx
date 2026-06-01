import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { VodService, Movie } from "@/types";
import AdBanner from "@/components/ui/AdBanner";

type Props = { params: Promise<{ slug: string }> };

const POINTS: Record<string, string[]> = {
  unext: ["見放題40万本以上の圧倒的なラインナップ", "毎月1,200円分のポイントで最新作もお得に", "雑誌・マンガも読み放題", "ファミリーアカウントで家族とシェア"],
  "dmm-tv": ["月額550円の業界最安級コスパ", "アニメ作品のラインナップが特に充実", "2.5次元舞台やオリジナル作品も", "DMMの各種ポイント特典あり"],
  hulu: ["全作品が追加料金なしで見放題", "海外ドラマ・日テレ系番組に強い", "リアルタイム配信にも対応", "ダウンロードしてオフライン視聴OK"],
  abema: ["韓国ドラマ・恋愛リアリティが豊富", "ABEMAオリジナル番組が見放題", "ニュース・スポーツも楽しめる", "無料プランからお試しできる"],
  "amazon-prime": ["送料無料などPrime特典もまとめて使える", "幅広いジャンルをカバー", "オリジナル作品も充実", "月額・年額から選べる"],
  lemino: ["映画・ドラマ・スポーツまで幅広く", "dポイントが貯まる・使える", "ドコモ以外のユーザーも利用OK", "ミュージックライブ配信も"],
};

async function getService(slug: string) {
  const { data } = await supabase.from("vod_services").select("*").eq("slug", slug).single();
  return data as VodService | null;
}

async function getMoviesOnService(serviceId: string) {
  const { data } = await supabase
    .from("movie_availability")
    .select("availability_type, movie:movies(id, title, slug, release_year, poster_url)")
    .eq("vod_service_id", serviceId)
    .eq("is_available", true)
    .order("availability_type")
    .limit(18);
  return (data as unknown as { availability_type: string; movie: Movie }[]) ?? [];
}

export async function generateStaticParams() {
  const { data } = await supabase.from("vod_services").select("slug");
  return (data ?? []).map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  const canonical = `https://minna-no-eigakan.vercel.app/vod/${slug}`;
  const title = `${service.name}の評判・料金・おすすめ作品まとめ【2026年最新】`;
  const description = `${service.name}の月額料金・無料トライアル・配信作品を徹底解説。${service.free_trial_text ? `${service.free_trial_text}の無料お試しあり。` : ""}${service.description ?? ""}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VodDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const items = await getMoviesOnService(service.id);
  const points = POINTS[slug] ?? [];

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #2d1f15 0%, #1a1208 100%)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "44px 20px", color: "#fff" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)" }}>ホーム</Link><span>›</span>
            <Link href="/vod" style={{ color: "rgba(255,255,255,0.6)" }}>VOD比較</Link><span>›</span>
            <span>{service.name}</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, marginBottom: 12 }}>{service.name}</h1>
          {service.description && <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", maxWidth: 640 }}>{service.description}</p>}
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px 0" }}>
        <p style={{ fontSize: 11, color: "var(--fg-muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", backgroundColor: "var(--bg-card)" }}>
          本ページは広告・アフィリエイトリンクを含みます。料金・無料期間は変更される場合があります。
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 48px" }}>
        {/* 基本情報 + CTA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ padding: "18px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 4 }}>月額料金(税込)</p>
            <p style={{ fontWeight: 800, fontSize: 24 }}>{service.monthly_price ? `${service.monthly_price.toLocaleString()}円` : "—"}</p>
          </div>
          <div style={{ padding: "18px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 4 }}>無料お試し期間</p>
            <p style={{ fontWeight: 800, fontSize: 24, color: "var(--accent)" }}>{service.free_trial_text ?? "なし"}</p>
          </div>
        </div>

        <div style={{ borderRadius: 14, border: "1.5px solid var(--accent)", backgroundColor: "var(--accent-light)", padding: "24px", marginBottom: 28, textAlign: "center" }}>
          <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{service.name}を無料で試す</p>
          {service.free_trial_text && <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 16 }}>{service.free_trial_text}の無料トライアル実施中（期間内の解約で料金はかかりません）</p>}
          <Link href={`/go/${service.slug}`} style={{ display: "inline-block", backgroundColor: "var(--accent)", color: "#fff", fontWeight: 700, padding: "14px 36px", borderRadius: 10, fontSize: 15, textDecoration: "none" }}>
            公式サイトで無料登録する →
          </Link>
        </div>

        {/* おすすめポイント */}
        {points.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border)" }}>{service.name}のおすすめポイント</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {points.map((p) => (
                <div key={p} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 800, flexShrink: 0 }}>✓</span>{p}
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <AdBanner size="leaderboard" className="ad-leaderboard" />
        </div>

        {/* 配信中の作品 */}
        {items.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border)" }}>
              {service.name}で配信中の作品
            </h2>
            <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
              {items.map(({ movie, availability_type }) => (
                <Link key={movie.id} href={`/movies/${movie.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "2/3", position: "relative", background: "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)", marginBottom: 8 }}>
                    {movie.poster_url ? (
                      <Image src={movie.poster_url} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="180px" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24, opacity: 0.3 }}>🎬</span></div>
                    )}
                    <span style={{ position: "absolute", top: 6, left: 6, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, backgroundColor: availability_type === "見放題" ? "rgba(31,122,70,0.92)" : "rgba(154,101,22,0.92)", color: "#fff" }}>
                      {availability_type}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }} className="line-clamp-2">{movie.title}</p>
                  <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>{movie.release_year}年</p>
                </Link>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 12 }}>※当サイト掲載作品のうち{service.name}で配信中のものを表示しています。配信状況は変更される場合があります。</p>
          </section>
        )}

        {/* 末尾CTA */}
        <div style={{ borderRadius: 14, backgroundColor: "var(--btn-dark)", padding: "28px 24px", textAlign: "center", color: "#fff" }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>気になったら、まず無料でお試し</p>
          {service.free_trial_text && <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 18 }}>{service.free_trial_text}・期間内の解約なら0円</p>}
          <Link href={`/go/${service.slug}`} style={{ display: "inline-block", backgroundColor: "#fff", color: "var(--fg)", fontWeight: 700, padding: "13px 32px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>
            {service.name}を無料で試す →
          </Link>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/vod" style={{ fontSize: 13, color: "var(--fg-muted)" }}>← VOD比較に戻る</Link>
        </div>
      </div>
    </div>
  );
}
