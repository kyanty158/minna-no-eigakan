import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { VodService } from "@/types";

export const metadata: Metadata = {
  title: "VOD比較｜映画・ドラマを見るならどのサービス？",
  description: "U-NEXT、DMM TV、Huluなど人気VODサービスを月額・無料期間・特徴で比較。恋愛映画やカップルデートにおすすめのVODを紹介。",
};

export default async function VodPage() {
  const { data: services } = await supabase
    .from("vod_services")
    .select("*")
    .order("name");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <p className="text-xs text-[var(--muted)] mb-6 border border-[var(--border)] rounded px-3 py-2 bg-[var(--card)]">
        本ページは広告・アフィリエイトリンクを含みます。
      </p>

      <h1 className="text-2xl font-bold mb-3">VOD比較</h1>
      <p className="text-[var(--muted)] mb-8">
        カップルや恋愛映画を見るのにおすすめのVODサービスを比較しました。
      </p>

      {/* 比較表 */}
      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--border)]">
              <th className="text-left py-3 pr-4 font-semibold">サービス</th>
              <th className="text-left py-3 pr-4 font-semibold">月額</th>
              <th className="text-left py-3 pr-4 font-semibold">無料期間</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(services as VodService[] | null)?.map((service) => (
              <tr key={service.id} className="border-b border-[var(--border)]">
                <td className="py-4 pr-4 font-medium">
                  <Link href={`/vod/${service.slug}`} className="hover:text-[var(--accent)]">
                    {service.name}
                  </Link>
                </td>
                <td className="py-4 pr-4 text-[var(--muted)]">
                  {service.monthly_price ? `月${service.monthly_price.toLocaleString()}円` : "—"}
                </td>
                <td className="py-4 pr-4 text-[var(--muted)]">
                  {service.free_trial_text ?? "—"}
                </td>
                <td className="py-4">
                  {service.affiliate_url && (
                    <Link
                      href={`/go/${service.slug}`}
                      className="text-xs bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
                    >
                      無料で試す
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VOD cards */}
      <h2 className="text-xl font-bold mb-6">各サービスの特徴</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {(services as VodService[] | null)?.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-[var(--border)] p-5 bg-[var(--card)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold">{service.name}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {service.monthly_price ? `月${service.monthly_price.toLocaleString()}円` : ""}
                  {service.free_trial_text ? ` · ${service.free_trial_text}` : ""}
                </p>
              </div>
            </div>
            {service.description && (
              <p className="text-sm text-[var(--muted)] mb-4">{service.description}</p>
            )}
            <div className="flex gap-2">
              <Link
                href={`/vod/${service.slug}`}
                className="text-xs border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-[var(--accent)] transition-colors"
              >
                詳細を見る
              </Link>
              {service.affiliate_url && (
                <Link
                  href={`/go/${service.slug}`}
                  className="text-xs bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  無料で試す →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!services || services.length === 0) && (
        <p className="text-[var(--muted)] text-center py-20">VOD情報を準備中です。</p>
      )}
    </div>
  );
}
