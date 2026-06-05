/**
 * TMDB Watch Providers (JP) → movie_availability 一括同期
 * npx tsx scripts/sync-availability.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv() {
  try {
    const c = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const l of c.split("\n")) { const [k, ...r] = l.split("="); if (k && r.length) process.env[k.trim()] = r.join("=").trim(); }
  } catch {}
}
loadEnv();

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const KEY = process.env.TMDB_API_KEY!;
const BASE = "https://api.themoviedb.org/3";

// TMDB provider ID → our VOD service slug
const FLAT_MAP: Record<number, string> = {
  9:    "amazon-prime",  // Amazon Prime Video
  2100: "amazon-prime",  // Amazon Prime Video with Ads
  15:   "hulu",          // Hulu JP
  84:   "unext",         // U-NEXT
  2284: "unext",         // HBO Max on U-Next
};
const RENT_MAP: Record<number, string> = {
  10: "amazon-prime",   // Amazon Video (レンタル)
};

async function getTmdbId(title: string, year: number | null): Promise<number | null> {
  const q = encodeURIComponent(title);
  const url = year
    ? `${BASE}/search/movie?query=${q}&api_key=${KEY}&language=ja-JP&year=${year}`
    : `${BASE}/search/movie?query=${q}&api_key=${KEY}&language=ja-JP`;
  const r = await fetch(url);
  const d = await r.json();
  return d.results?.[0]?.id ?? null;
}

async function getProviders(tmdbId: number) {
  const r = await fetch(`${BASE}/movie/${tmdbId}/watch/providers?api_key=${KEY}`);
  const d = await r.json();
  return d.results?.JP ?? null;
}

async function main() {
  // Load VOD service IDs
  const { data: vods } = await sb.from("vod_services").select("id, slug");
  const vodIdBySlug = Object.fromEntries((vods ?? []).map((v: any) => [v.slug, v.id]));

  // Load all movies
  const { data: movies } = await sb.from("movies").select("id, slug, title, release_year");
  console.log(`処理対象: ${movies?.length}本`);

  let updated = 0, skipped = 0, noData = 0;

  for (const movie of (movies ?? []) as any[]) {
    // Search TMDB
    const tmdbId = await getTmdbId(movie.title, movie.release_year);
    await new Promise(r => setTimeout(r, 250));
    if (!tmdbId) { console.log(`  ❌ TMDB not found: ${movie.slug}`); noData++; continue; }

    // Get providers
    const jp = await getProviders(tmdbId);
    await new Promise(r => setTimeout(r, 250));

    const rows: any[] = [];
    const addedSlugs = new Set<string>();

    // 見放題
    for (const p of (jp?.flatrate ?? [])) {
      const slug = FLAT_MAP[p.provider_id];
      if (slug && !addedSlugs.has(slug)) {
        rows.push({ movie_id: movie.id, vod_service_id: vodIdBySlug[slug], availability_type: "見放題", is_available: true });
        addedSlugs.add(slug);
      }
    }

    // レンタル（見放題にないサービスのみ）
    for (const p of (jp?.rent ?? [])) {
      const slug = RENT_MAP[p.provider_id];
      if (slug && !addedSlugs.has(slug)) {
        rows.push({ movie_id: movie.id, vod_service_id: vodIdBySlug[slug], availability_type: "レンタル", is_available: true });
        addedSlugs.add(slug);
      }
    }

    if (rows.length === 0) { skipped++; continue; }

    // Delete old → insert new
    await sb.from("movie_availability").delete().eq("movie_id", movie.id)
      .in("vod_service_id", [vodIdBySlug["amazon-prime"], vodIdBySlug["unext"], vodIdBySlug["hulu"]].filter(Boolean));
    const { error } = await sb.from("movie_availability").insert(rows);
    if (error) { console.log(`  ❌ DB error ${movie.slug}: ${error.message}`); continue; }

    const summary = rows.map((r: any) => {
      const s = Object.entries(vodIdBySlug).find(([, id]) => id === r.vod_service_id)?.[0];
      return `${s}:${r.availability_type}`;
    }).join(", ");
    console.log(`  ✅ ${movie.slug} — ${summary}`);
    updated++;
  }

  console.log(`\n完了: 更新${updated}本 / データなし${noData}本 / 配信情報なし${skipped}本`);
}
main().catch(console.error);
