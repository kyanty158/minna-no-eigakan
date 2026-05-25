import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/types";

export const metadata: Metadata = {
  title: "特集・まとめ記事一覧",
  description: "カップルで見たい映画、泣ける映画、雨の日に見たい映画など、シーン別・ジャンル別の映画まとめ記事一覧。観たい作品が見つかったらどのVODで見れるかもチェックできます。",
};

const FALLBACK_BGS = [
  "linear-gradient(135deg, #1e3f5c 0%, #0f2237 100%)",
  "linear-gradient(135deg, #6b2d4a 0%, #3d1a2e 100%)",
  "linear-gradient(135deg, #2a1f0e 0%, #5c3d1a 100%)",
];

export default async function ArticlesPage() {
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, thumbnail_url, article_type, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = (data as Article[] | null) ?? [];

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>特集・まとめ</h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7 }}>
            シーンや気分にあわせた映画のまとめ記事。観たい作品が見つかったら、そのまま配信中のVODで楽しめます。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px" }}>
        <div className="article-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {articles.map((a, i) => (
            <Link key={a.id} href={`/articles/${a.slug}`} style={{ display: "block", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", textDecoration: "none" }}>
              <div style={{ aspectRatio: "16/9", position: "relative", background: a.thumbnail_url ? undefined : FALLBACK_BGS[i % FALLBACK_BGS.length] }}>
                {a.thumbnail_url ? (
                  <Image src={a.thumbnail_url} alt={a.title} fill style={{ objectFit: "cover" }} sizes="380px" />
                ) : null}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                {a.article_type && (
                  <span style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, backgroundColor: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}>
                    {a.article_type}
                  </span>
                )}
              </div>
              <div style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }} className="line-clamp-2">{a.title}</p>
                {a.excerpt && <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.7 }} className="line-clamp-3">{a.excerpt}</p>}
                {a.published_at && (
                  <p style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 10 }}>
                    {new Date(a.published_at).toLocaleDateString("ja-JP")} 更新
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        {articles.length === 0 && <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "80px 0" }}>記事を準備中です。</p>}
      </div>
    </div>
  );
}
