import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Genre, Movie } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getGenre(slug: string) {
  const { data } = await supabase
    .from("genres")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Genre | null;
}

async function getMoviesByGenre(genreId: string) {
  const { data } = await supabase
    .from("movie_genres")
    .select("movie:movies(id, title, slug, release_year, country, poster_url, summary)")
    .eq("genre_id", genreId);
  return (data as unknown as { movie: Movie }[]) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) return {};
  return {
    title: `${genre.name}映画・ドラマ一覧`,
    description: `${genre.name}ジャンルの映画・ドラマ作品を一覧で紹介。`,
  };
}

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) notFound();

  const items = await getMoviesByGenre(genre.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">{genre.name}の映画・ドラマ</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(({ movie }) => (
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
              <p className="font-semibold group-hover:text-[var(--accent)] transition-colors">
                {movie.title}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                {[movie.release_year, movie.country].filter(Boolean).join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-[var(--muted)] text-center py-20">作品を準備中です。</p>
      )}
    </div>
  );
}
