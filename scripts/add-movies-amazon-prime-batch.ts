/**
 * Amazon Prime JP独占配信 高SEO映画バッチ
 * npx tsx scripts/add-movies-amazon-prime-batch.ts
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

const TARGETS: { slug: string; tmdb_id: number; genres: string[]; scenes: string[] }[] = [
  // 2025〜2026 最新作
  { slug: "mission-impossible-final-reckoning",    tmdb_id: 575265,   genres: ["suspense"],                  scenes: ["couple", "home-date"] },
  { slug: "jurassic-world-rebirth-2025",           tmdb_id: 1234821,  genres: ["suspense", "tearjerker"],    scenes: ["couple", "home-date"] },
  { slug: "how-to-train-your-dragon-2025",         tmdb_id: 1087192,  genres: ["tearjerker"],                scenes: ["couple", "heartwarming"] },
  { slug: "ballerina-john-wick-2025",              tmdb_id: 541671,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "working-man-2025",                      tmdb_id: 1197306,  genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "warfare-2025",                          tmdb_id: 1241436,  genres: ["tearjerker"],                scenes: ["home-date"] },
  { slug: "accountant-2-2025",                     tmdb_id: 870028,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "war-of-worlds-2025",                    tmdb_id: 755898,   genres: ["suspense"],                  scenes: ["home-date"] },

  // 2024
  { slug: "wild-robot-2024",                       tmdb_id: 1184918,  genres: ["tearjerker", "anime"],       scenes: ["couple", "cry-alone", "heartwarming"] },
  { slug: "it-ends-with-us-2024",                  tmdb_id: 1079091,  genres: ["romance", "tearjerker"],     scenes: ["couple", "cry-alone"] },
  { slug: "red-one-2024",                          tmdb_id: 845781,   genres: ["comedy"],                    scenes: ["couple", "heartwarming"] },
  { slug: "road-house-2024",                       tmdb_id: 359410,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "nosferatu-2024",                        tmdb_id: 426063,   genres: ["suspense", "horror"],        scenes: ["home-date"] },
  { slug: "smile-2-2024",                          tmdb_id: 1100782,  genres: ["suspense", "horror"],        scenes: ["home-date"] },

  // 2023
  { slug: "super-mario-bros-movie-2023",           tmdb_id: 502356,   genres: ["comedy", "tearjerker"],      scenes: ["couple", "heartwarming"] },
  { slug: "spider-man-across-spider-verse",        tmdb_id: 569094,   genres: ["tearjerker", "anime"],       scenes: ["couple", "heartwarming"] },
  { slug: "mission-impossible-dead-reckoning-1",   tmdb_id: 575264,   genres: ["suspense"],                  scenes: ["couple", "home-date"] },
  { slug: "dungeons-dragons-honor-thieves",        tmdb_id: 493529,   genres: ["comedy", "tearjerker"],      scenes: ["couple", "heartwarming"] },
  { slug: "transformers-rise-of-beasts",           tmdb_id: 667538,   genres: ["suspense"],                  scenes: ["couple", "home-date"] },
  { slug: "equalizer-3-2023",                      tmdb_id: 926393,   genres: ["suspense"],                  scenes: ["home-date"] },
  { slug: "scream-6-2023",                         tmdb_id: 934433,   genres: ["suspense", "horror"],        scenes: ["home-date"] },
  { slug: "red-white-royal-blue-2023",             tmdb_id: 930094,   genres: ["romance", "comedy"],         scenes: ["couple", "heartwarming"] },
  { slug: "gran-turismo-2023",                     tmdb_id: 980489,   genres: ["tearjerker"],                scenes: ["couple", "heartwarming"] },
  { slug: "babylon-2022-film",                     tmdb_id: 615777,   genres: ["comedy", "tearjerker"],      scenes: ["couple", "home-date"] },

  // 2022
  { slug: "the-substance-2024",                    tmdb_id: 933260,   genres: ["suspense", "horror"],        scenes: ["home-date"] },
  { slug: "smile-2022",                            tmdb_id: 882598,   genres: ["suspense", "horror"],        scenes: ["home-date"] },
  { slug: "black-phone-2022",                      tmdb_id: 756999,   genres: ["suspense", "horror"],        scenes: ["home-date"] },

  // 2023 ソニック
  { slug: "sonic-shadow-tokyo-mission",            tmdb_id: 939243,   genres: ["comedy", "tearjerker"],      scenes: ["couple", "heartwarming"] },
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

    const genreLinks = t.genres.map(g => genreMap[g]).filter(Boolean).map(genre_id => ({ movie_id: movie.id, genre_id }));
    if (genreLinks.length) await sb.from("movie_genres").upsert(genreLinks, { onConflict: "movie_id,genre_id" });

    const sceneLinks = t.scenes.map(s => sceneMap[s]).filter(Boolean).map(scene_id => ({ movie_id: movie.id, scene_id }));
    if (sceneLinks.length) await sb.from("movie_scenes").upsert(sceneLinks, { onConflict: "movie_id,scene_id" });

    console.log(`✅ ${t.slug} — ${m.title} (${m.release_date?.slice(0, 4)})`);
    added++;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\n完了: ${added}本追加`);
}
main().catch(console.error);
