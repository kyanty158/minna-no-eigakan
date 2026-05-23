import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/types";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "カップルで見たい映画、おうちデート映画など、シーン別・ジャンル別の映画まとめ記事一覧。",
};

export default async function ArticlesPage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, thumbnail_url, article_type, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">記事一覧</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(articles as Article[] | null)?.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group block rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow bg-[var(--card)]"
          >
            <div className="aspect-video bg-[var(--background)] flex items-center justify-center">
              {article.thumbnail_url ? (
                <img src={article.thumbnail_url} alt={article.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🎬</span>
              )}
            </div>
            <div className="p-4">
              {article.article_type && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[var(--background)] border border-[var(--border)] mb-2 text-[var(--muted)]">
                  {article.article_type}
                </span>
              )}
              <p className="text-sm font-semibold leading-snug group-hover:text-[var(--accent)] transition-colors">
                {article.title}
              </p>
              {article.excerpt && (
                <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2">{article.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      {(!articles || articles.length === 0) && (
        <p className="text-[var(--muted)] text-center py-20">記事を準備中です。</p>
      )}
    </div>
  );
}
