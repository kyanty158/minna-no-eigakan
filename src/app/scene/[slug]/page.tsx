import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Scene, Movie } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getScene(slug: string) {
  const { data } = await supabase
    .from("scenes")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Scene | null;
}

async function getMoviesByScene(sceneId: string) {
  const { data } = await supabase
    .from("movie_scenes")
    .select("movie:movies(id, title, slug, release_year, country, poster_url, summary)")
    .eq("scene_id", sceneId);
  return (data as unknown as { movie: Movie }[]) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scene = await getScene(slug);
  if (!scene) return {};
  return {
    title: `${scene.name}映画・ドラマおすすめ一覧`,
    description: `${scene.name}シーンにぴったりな映画・ドラマを厳選して紹介。`,
  };
}

export default async function ScenePage({ params }: Props) {
  const { slug } = await params;
  const scene = await getScene(slug);
  if (!scene) notFound();

  const items = await getMoviesByScene(scene.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-3">{scene.name}映画・ドラマ</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        {scene.name}にぴったりな映画・ドラマを厳選して紹介します。
      </p>
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
              {movie.summary && (
                <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2">{movie.summary}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-[var(--muted)] text-center py-20">作品を準備中です。</p>
      )}

      {/* VOD CTA */}
      <div className="mt-12 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
        <p className="font-semibold mb-2">紹介した映画をすぐ見たい方へ</p>
        <p className="text-sm text-[var(--muted)] mb-4">VODの無料トライアルを使えば今すぐ無料で視聴できます。</p>
        <Link
          href="/vod"
          className="inline-block bg-[var(--accent)] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          おすすめVODを見る
        </Link>
      </div>
    </div>
  );
}
