/**
 * Amazon Primeバッチ追加分の配信情報を同期
 * npx tsx scripts/sync-amazon-prime-availability.ts
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
  9:    "amazon-prime",
  2100: "amazon-prime",
  15:   "hulu",
  84:   "unext",
  2284: "unext",
  337:  "disney-plus",
  8:    "netflix",
};
const RENT_MAP: Record<number, string> = {
  10: "amazon-prime",
};

// slug → TMDB ID マッピング
const SLUG_TMDB: Record<string, number> = {
  "mission-impossible-final-reckoning":   575265,
  "jurassic-world-rebirth-2025":          1234821,
  "how-to-train-your-dragon-2025":        1087192,
  "ballerina-john-wick-2025":             541671,
  "working-man-2025":                     1197306,
  "warfare-2025":                         1241436,
  "accountant-2-2025":                    870028,
  "war-of-worlds-2025":                   755898,
  "wild-robot-2024":                      1184918,
  "it-ends-with-us-2024":                 1079091,
  "red-one-2024":                         845781,
  "road-house-2024":                      359410,
  "nosferatu-2024":                       426063,
  "smile-2-2024":                         1100782,
  "super-mario-bros-movie-2023":          502356,
  "spider-man-across-spider-verse":       569094,
  "mission-impossible-dead-reckoning-1":  575264,
  "dungeons-dragons-honor-thieves":       493529,
  "transformers-rise-of-beasts":          667538,
  "equalizer-3-2023":                     926393,
  "scream-6-2023":                        934433,
  "red-white-royal-blue-2023":            930094,
  "gran-turismo-2023":                    980489,
  "babylon-2022-film":                    615777,
  "the-substance-2024":                   933260,
  "smile-2022":                           882598,
  "black-phone-2022":                     756999,
  "sonic-shadow-tokyo-mission":           939243,
};

async function getProviders(tmdbId: number) {
  const r = await fetch(`${BASE}/movie/${tmdbId}/watch/providers?api_key=${KEY}`);
  const d = await r.json();
  return d.results?.JP ?? null;
}

async function main() {
  const { data: vods } = await sb.from("vod_services").select("id, slug");
  const vodIdBySlug = Object.fromEntries((vods ?? []).map((v: any) => [v.slug, v.id]));

  const slugs = Object.keys(SLUG_TMDB);
  const { data: movies } = await sb.from("movies").select("id, slug").in("slug", slugs);
  const movieBySlug = Object.fromEntries((movies ?? []).map((m: any) => [m.slug, m.id]));

  console.log(`配信情報同期: ${slugs.length}本`);
  let updated = 0, noData = 0;

  for (const slug of slugs) {
    const tmdbId = SLUG_TMDB[slug];
    const movieId = movieBySlug[slug];
    if (!movieId) { console.log(`  ❌ movie not in DB: ${slug}`); continue; }

    const jp = await getProviders(tmdbId);
    await new Promise(r => setTimeout(r, 250));

    const rows: any[] = [];
    const addedSlugs = new Set<string>();

    for (const p of (jp?.flatrate ?? [])) {
      const vodSlug = FLAT_MAP[p.provider_id];
      if (vodSlug && !addedSlugs.has(vodSlug) && vodIdBySlug[vodSlug]) {
        rows.push({ movie_id: movieId, vod_service_id: vodIdBySlug[vodSlug], availability_type: "見放題", is_available: true });
        addedSlugs.add(vodSlug);
      }
    }

    for (const p of (jp?.rent ?? [])) {
      const vodSlug = RENT_MAP[p.provider_id];
      if (vodSlug && !addedSlugs.has(vodSlug) && vodIdBySlug[vodSlug]) {
        rows.push({ movie_id: movieId, vod_service_id: vodIdBySlug[vodSlug], availability_type: "レンタル", is_available: true });
        addedSlugs.add(vodSlug);
      }
    }

    if (rows.length === 0) { console.log(`  ⚠ 配信なし: ${slug}`); noData++; continue; }

    // 既存データ削除 → 挿入
    await sb.from("movie_availability").delete().eq("movie_id", movieId);
    const { error } = await sb.from("movie_availability").insert(rows);
    if (error) { console.log(`  ❌ DB error ${slug}: ${error.message}`); continue; }

    const summary = rows.map((r: any) => {
      const s = Object.entries(vodIdBySlug).find(([, id]) => id === r.vod_service_id)?.[0];
      return `${s}:${r.availability_type}`;
    }).join(", ");
    console.log(`  ✅ ${slug} — ${summary}`);
    updated++;
  }

  console.log(`\n完了: 更新${updated}本 / 配信情報なし${noData}本`);
}
main().catch(console.error);
