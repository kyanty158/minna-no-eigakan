/**
 * Batch 10: Amazon Prime JP配信の最新・人気作 24本
 * npx tsx scripts/add-movies-batch10.ts
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
const POSTER = "https://image.tmdb.org/t/p/w500";

const TARGETS = [
  { slug: "venom-last-dance",            tmdb_id: 912649,  genres: ["suspense"],              scenes: ["couple", "home-date"] },
  { slug: "puss-in-boots-last-wish",     tmdb_id: 315162,  genres: ["comedy"],                scenes: ["home-date", "not-awkward"] },
  { slug: "wicked-2024",                 tmdb_id: 402431,  genres: ["romance"],               scenes: ["couple", "anniversary"] },
  { slug: "fall-2022",                   tmdb_id: 985939,  genres: ["suspense"],              scenes: ["couple", "home-date"] },
  { slug: "the-beekeeper",               tmdb_id: 866398,  genres: ["suspense"],              scenes: ["home-date"] },
  { slug: "godzilla-x-kong",             tmdb_id: 823464,  genres: ["suspense"],              scenes: ["couple"] },
  { slug: "the-idea-of-you",             tmdb_id: 843527,  genres: ["romance"],               scenes: ["couple", "anniversary", "heartwarming"] },
  { slug: "anora-2024",                  tmdb_id: 1064213, genres: ["romance"],               scenes: ["home-date"] },
  { slug: "flow-2024",                   tmdb_id: 823219,  genres: ["tearjerker"],            scenes: ["home-date", "cry-alone", "heartwarming"] },
  { slug: "twenty-eight-years-later",    tmdb_id: 1100988, genres: ["horror", "suspense"],   scenes: ["couple", "home-date"] },
  { slug: "mission-impossible-final",    tmdb_id: 575265,  genres: ["suspense"],              scenes: ["couple", "home-date"] },
  { slug: "ballerina-2025",              tmdb_id: 541671,  genres: ["suspense"],              scenes: ["couple"] },
  { slug: "my-fault-2023",               tmdb_id: 1010581, genres: ["romance"],               scenes: ["couple", "heartwarming"] },
  { slug: "your-fault-2024",             tmdb_id: 1156593, genres: ["romance"],               scenes: ["couple", "heartwarming"] },
  { slug: "my-fault-london",             tmdb_id: 1294203, genres: ["romance"],               scenes: ["couple"] },
  { slug: "eden-2025",                   tmdb_id: 1042834, genres: ["suspense"],              scenes: ["home-date"] },
  { slug: "babygirl-2024",               tmdb_id: 1097549, genres: ["romance", "suspense"],  scenes: ["home-date"] },
  { slug: "talk-to-me-2023",             tmdb_id: 1008042, genres: ["horror"],               scenes: ["couple", "home-date"] },
  { slug: "bullet-train-2022",           tmdb_id: 718930,  genres: ["suspense", "comedy"],   scenes: ["couple", "home-date"] },
  { slug: "alien-romulus",               tmdb_id: 945961,  genres: ["horror", "suspense"],   scenes: ["couple"] },
  { slug: "meg-2-the-trenches",          tmdb_id: 615656,  genres: ["suspense"],              scenes: ["couple"] },
  { slug: "kingdom-of-the-apes-2024",    tmdb_id: 653346,  genres: ["suspense"],              scenes: ["couple"] },
  { slug: "scream-2022",                 tmdb_id: 646385,  genres: ["horror", "suspense"],   scenes: ["couple", "home-date"] },
  { slug: "expendables-4",               tmdb_id: 299054,  genres: ["comedy"],               scenes: ["home-date"] },
];

const AMAZON_VOD_ID = "af24ebd7-e89c-4a58-943f-8ea2925110d6";

async function main() {
  const { data: existing } = await sb.from("movies").select("slug");
  const existingSet = new Set((existing ?? []).map((m: any) => m.slug));

  const { data: genreRows } = await sb.from("genres").select("id, slug");
  const genreMap = Object.fromEntries((genreRows ?? []).map((g: any) => [g.slug, g.id]));

  const { data: sceneRows } = await sb.from("scenes").select("id, slug");
  const sceneMap = Object.fromEntries((sceneRows ?? []).map((s: any) => [s.slug, s.id]));

  let added = 0;
  for (const t of TARGETS) {
    if (existingSet.has(t.slug)) { console.log(`skip ${t.slug}`); continue; }

    const r = await fetch(`${BASE}/movie/${t.tmdb_id}?api_key=${KEY}&language=ja-JP`);
    const m = await r.json();
    await new Promise(r => setTimeout(r, 250));

    if (!m?.id) { console.log(`❌ TMDB miss: ${t.slug}`); continue; }

    const now = new Date().toISOString();
    const { data: movie, error } = await sb.from("movies").upsert({
      slug: t.slug,
      title: m.title ?? m.original_title,
      original_title: m.original_title,
      release_year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
      country: m.production_countries?.[0]?.name ?? null,
      runtime_minutes: m.runtime ?? null,
      summary: m.overview ?? null,
      poster_url: m.poster_path ? `${POSTER}${m.poster_path}` : null,
      created_at: now, updated_at: now,
    }, { onConflict: "slug" }).select("id").single();

    if (error || !movie) { console.log(`❌ DB error ${t.slug}: ${error?.message}`); continue; }

    // Genres
    const gl = t.genres.map(g => genreMap[g]).filter(Boolean).map(genre_id => ({ movie_id: movie.id, genre_id }));
    if (gl.length) await sb.from("movie_genres").upsert(gl, { onConflict: "movie_id,genre_id" });

    // Scenes
    const sl = t.scenes.map(s => sceneMap[s]).filter(Boolean).map(scene_id => ({ movie_id: movie.id, scene_id }));
    if (sl.length) await sb.from("movie_scenes").upsert(sl, { onConflict: "movie_id,scene_id" });

    // Amazon Prime availability
    await sb.from("movie_availability").upsert({
      movie_id: movie.id,
      vod_service_id: AMAZON_VOD_ID,
      availability_type: "見放題",
      is_available: true,
    }, { onConflict: "movie_id,vod_service_id" });

    console.log(`✅ ${t.slug} — ${m.title} (${m.release_date?.slice(0, 4)})`);
    added++;
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`\n完了: ${added}本追加`);
}
main().catch(console.error);
