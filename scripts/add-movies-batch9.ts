/**
 * Batch 9: 高検索ボリューム「どこで見れる」系 25本
 * npx tsx scripts/add-movies-batch9.ts
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

// TMDB ID 指定で確実に取得
const TARGETS: { slug: string; tmdb_id: number; genres: string[]; scenes: string[] }[] = [
  { slug: "inception-2010",         tmdb_id: 27205,   genres: ["suspense"],                  scenes: ["couple", "home-date"] },
  { slug: "dark-knight",            tmdb_id: 155,      genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "top-gun-maverick",       tmdb_id: 361743,   genres: ["romance"],                   scenes: ["couple", "home-date"] },
  { slug: "joker-2019",             tmdb_id: 475557,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "godzilla-minus-one",     tmdb_id: 1043951,  genres: ["tearjerker"],                scenes: ["couple"] },
  { slug: "boy-and-the-heron",      tmdb_id: 508965,   genres: ["anime", "tearjerker"],       scenes: ["home-date", "cry-alone"] },
  { slug: "oppenheimer-2023",       tmdb_id: 872585,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "the-prestige",           tmdb_id: 1124,     genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "slumdog-millionaire",    tmdb_id: 12405,    genres: ["romance", "tearjerker"],     scenes: ["couple", "heartwarming"] },
  { slug: "nineteen-seventeen",     tmdb_id: 530915,   genres: ["tearjerker"],                scenes: ["home-date"] },
  { slug: "three-billboards",       tmdb_id: 359940,   genres: ["suspense", "tearjerker"],    scenes: ["home-date"] },
  { slug: "minari-2020",            tmdb_id: 662552,   genres: ["tearjerker"],                scenes: ["cry-alone", "heartwarming"] },
  { slug: "dont-look-up",          tmdb_id: 646380,   genres: ["comedy"],                    scenes: ["couple", "home-date"] },
  { slug: "avengers-endgame",       tmdb_id: 299534,   genres: ["tearjerker"],                scenes: ["couple"] },
  { slug: "spider-man-no-way-home", tmdb_id: 634649,   genres: ["tearjerker"],                scenes: ["couple", "heartwarming"] },
  { slug: "the-matrix",             tmdb_id: 603,      genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "mad-max-fury-road",      tmdb_id: 76341,    genres: ["suspense"],                  scenes: ["couple"] },
  { slug: "gravity-2013",           tmdb_id: 49047,    genres: ["tearjerker"],                scenes: ["couple"] },
  { slug: "the-revenant",           tmdb_id: 281957,   genres: ["tearjerker"],                scenes: ["home-date"] },
  { slug: "taxi-driver-korean",     tmdb_id: 426597,   genres: ["tearjerker"],                scenes: ["cry-alone"] },
  { slug: "the-attorney-korean",    tmdb_id: 233469,   genres: ["tearjerker"],                scenes: ["cry-alone"] },
  { slug: "ford-v-ferrari",         tmdb_id: 359724,   genres: ["tearjerker"],                scenes: ["couple"] },
  { slug: "the-martian",            tmdb_id: 286217,   genres: ["comedy"],                    scenes: ["couple", "home-date"] },
  { slug: "gone-girl",              tmdb_id: 210577,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "the-hangover",           tmdb_id: 18785,    genres: ["comedy"],                    scenes: ["home-date"] },
];

async function fetchMovie(tmdb_id: number) {
  const r = await fetch(`${BASE}/movie/${tmdb_id}?api_key=${KEY}&language=ja-JP`);
  return r.json();
}

async function main() {
  const { data: existingSlugs } = await sb.from("movies").select("slug");
  const existing = new Set((existingSlugs ?? []).map((m: any) => m.slug));

  const { data: genreRows } = await sb.from("genres").select("id, slug");
  const genreMap = Object.fromEntries((genreRows ?? []).map((g: any) => [g.slug, g.id]));

  const { data: sceneRows } = await sb.from("scenes").select("id, slug");
  const sceneMap = Object.fromEntries((sceneRows ?? []).map((s: any) => [s.slug, s.id]));

  let added = 0;
  for (const t of TARGETS) {
    if (existing.has(t.slug)) { console.log(`skip ${t.slug}`); continue; }

    const m = await fetchMovie(t.tmdb_id);
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
      created_at: now,
      updated_at: now,
    }, { onConflict: "slug" }).select("id").single();

    if (error || !movie) { console.log(`❌ DB error ${t.slug}: ${error?.message}`); continue; }

    // Genres
    const genreLinks = t.genres.map(g => genreMap[g]).filter(Boolean).map(genre_id => ({ movie_id: movie.id, genre_id }));
    if (genreLinks.length) await sb.from("movie_genres").upsert(genreLinks, { onConflict: "movie_id,genre_id" });

    // Scenes
    const sceneLinks = t.scenes.map(s => sceneMap[s]).filter(Boolean).map(scene_id => ({ movie_id: movie.id, scene_id }));
    if (sceneLinks.length) await sb.from("movie_scenes").upsert(sceneLinks, { onConflict: "movie_id,scene_id" });

    console.log(`✅ ${t.slug} — ${m.title} (${m.release_date?.slice(0,4)})`);
    added++;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\n完了: ${added}本追加`);
}
main().catch(console.error);
