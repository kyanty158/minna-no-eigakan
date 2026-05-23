import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { VodService, Movie } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getService(slug: string) {
  const { data } = await supabase
    .from("vod_services")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as VodService | null;
}

async function getMoviesOnService(serviceId: string) {
  const { data } = await supabase
    .from("movie_availability")
    .select("movie:movies(id, title, slug, release_year, poster_url)")
    .eq("vod_service_id", serviceId)
    .eq("is_available", true)
    .eq("availability_type", "見放題")
    .limit(12);
  return (data as unknown as { movie: Movie }[]) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: `${service.name}のおすすめ映画・恋愛作品まとめ`,
    description: `${service.name}で見られる恋愛映画・ドラマを紹介。${service.free_trial_text ? service.free_trial_text + "の無料トライアルあり。" : ""}`,
  };
}

export default async function VodDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const movies = await getMoviesOnService(service.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-xs text-[var(--muted)] mb-6 border border-[var(--border)] rounded px-3 py-2 bg-[var(--card)]">
        本ページは広告・アフィリエイトリンクを含みます。
      </p>

      <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
      <p className="text-[var(--muted)] text-sm mb-6">{service.description}</p>

      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs text-[var(--muted)] mb-1">月額料金</p>
          <p className="font-bold">
            {service.monthly_price ? `${service.monthly_price.toLocaleString()}円` : "—"}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs text-[var(--muted)] mb-1">無料期間</p>
          <p className="font-bold">{service.free_trial_text ?? "なし"}</p>
        </div>
      </div>

      {/* CTA */}
      {service.affiliate_url && (
        <div className="rounded-xl border border-[var(--accent)] bg-[var(--card)] p-5 mb-10 text-center">
          <p className="font-semibold mb-1">{service.name}を無料で試す</p>
          {service.free_trial_text && (
            <p className="text-sm text-[var(--muted)] mb-4">{service.free_trial_text}の無料トライアル実施中</p>
          )}
          <Link
            href={`/go/${service.slug}`}
            className="inline-block bg-[var(--accent)] text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {service.name}の公式サイトへ →
          </Link>
        </div>
      )}

      {/* 配信中の映画 */}
      {movies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">{service.name}で見放題の映画</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {movies.map(({ movie }) => (
              <Link key={movie.id} href={`/movies/${movie.slug}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--background)] border border-[var(--border)] flex items-center justify-center mb-1">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🎬</span>
                  )}
                </div>
                <p className="text-xs group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-tight">
                  {movie.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link href="/vod" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← VOD比較に戻る
      </Link>
    </div>
  );
}
