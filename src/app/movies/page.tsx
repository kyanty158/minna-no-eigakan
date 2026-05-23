import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/types";

export const metadata: Metadata = {
  title: "作品一覧",
  description: "みんなの映画館に掲載している映画・ドラマの作品一覧です。",
};

export default async function MoviesPage() {
  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, slug, release_year, country, summary, poster_url")
    .order("title");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">作品一覧</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(movies as Movie[] | null)?.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.slug}`}
            className="group block rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow bg-[var(--card)]"
          >
            <div className="aspect-[2/3] bg-[var(--background)] flex items-center justify-center">
              {movie.poster_url ? (
                <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🎬</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold group-hover:text-[var(--accent)] transition-colors leading-snug">
                {movie.title}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                {[movie.release_year, movie.country].filter(Boolean).join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {(!movies || movies.length === 0) && (
        <p className="text-[var(--muted)] text-center py-20">作品を準備中です。</p>
      )}
    </div>
  );
}
