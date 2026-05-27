/**
 * 映画追加バッチ6 — 邦画新作・韓国・アメリカ・ヨーロッパ 厳選30本
 *   npx tsx scripts/add-movies-batch6.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) { const [k, ...r] = line.split("="); if (k && r.length) process.env[k.trim()] = r.join("=").trim(); }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TMDB_API_KEY) { console.error("❌ 設定確認"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY_JA: Record<string, string> = {
  JP: "日本", US: "アメリカ", FR: "フランス", GB: "イギリス",
  KR: "韓国", IT: "イタリア", DE: "ドイツ", CN: "中国", TW: "台湾",
  NO: "ノルウェー", IN: "インド", ES: "スペイン", MX: "メキシコ",
  PL: "ポーランド", CL: "チリ", DK: "デンマーク", SE: "スウェーデン",
};
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance", 18: "tearjerker", 35: "comedy", 27: "horror",
  53: "suspense", 9648: "suspense", 16: "anime", 12: "youth",
};
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  // === 邦画 新作・名作 ===
  { slug: "monster-2023", query: "怪物 2023", year: 2023, scenes: ["cry-alone", "home-date"], genres: ["tearjerker", "suspense"] },
  { slug: "8-nen-goshi-no-hanayome", query: "8年越しの花嫁", year: 2017, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "maquia-2018", query: "さよならの朝に約束の花をかざろう", year: 2018, scenes: ["cry-alone", "home-date", "heartwarming"], genres: ["anime", "tearjerker"] },
  { slug: "totto-chan-2023", query: "窓ぎわのトットちゃん", year: 2023, scenes: ["heartwarming", "cry-alone", "youth"], genres: ["anime", "tearjerker"] },
  { slug: "ryuurou-no-tsuki", query: "流浪の月", year: 2022, scenes: ["rainy-day", "home-date", "cry-alone"], genres: ["tearjerker", "suspense"] },
  { slug: "52-hertz-whale", query: "52ヘルツのクジラたち", year: 2024, scenes: ["cry-alone", "heartwarming", "home-date"], genres: ["tearjerker"] },
  { slug: "tsuki-no-michikake", query: "月の満ち欠け", year: 2022, scenes: ["cry-alone", "home-date", "couple"], genres: ["tearjerker", "romance"] },
  { slug: "aru-otoko-2022", query: "ある男", year: 2022, scenes: ["home-date", "rainy-day"], genres: ["suspense", "tearjerker"] },
  // === 韓国 ===
  { slug: "parasite-2019", query: "パラサイト 半地下の家族", year: 2019, scenes: ["home-date", "not-awkward"], genres: ["suspense"] },
  { slug: "decision-to-leave-2022", query: "Decision to Leave", year: 2022, scenes: ["couple", "rainy-day", "home-date"], genres: ["romance", "suspense"] },
  { slug: "broker-2022", query: "브로커", year: 2022, scenes: ["heartwarming", "cry-alone", "home-date"], genres: ["tearjerker"] },
  { slug: "my-20th-century-girl", query: "20世紀のキミ", year: 2022, scenes: ["youth", "before-dating", "heartwarming"], genres: ["youth", "romance"] },
  { slug: "birthday-2019-korean", query: "생일", year: 2019, scenes: ["cry-alone", "home-date"], genres: ["tearjerker"] },
  // === アメリカ ===
  { slug: "past-lives-2023", query: "Past Lives", year: 2023, scenes: ["couple", "cry-alone", "rainy-day"], genres: ["romance", "tearjerker"] },
  { slug: "little-women-2019", query: "Little Women", year: 2019, scenes: ["heartwarming", "home-date", "youth"], genres: ["romance", "tearjerker"] },
  { slug: "crazy-rich-asians-2018", query: "Crazy Rich Asians", year: 2018, scenes: ["couple", "not-awkward", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "the-big-sick-2017", query: "The Big Sick", year: 2017, scenes: ["couple", "not-awkward", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "yesterday-2019", query: "Yesterday", year: 2019, scenes: ["couple", "heartwarming", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "barbie-2023", query: "Barbie", year: 2023, scenes: ["couple", "not-awkward", "home-date"], genres: ["comedy"] },
  { slug: "ticket-to-paradise-2022", query: "Ticket to Paradise", year: 2022, scenes: ["couple", "not-awkward"], genres: ["romance", "comedy"] },
  // === フランス ===
  { slug: "portrait-of-a-lady-on-fire", query: "燃ゆる女の肖像", year: 2019, scenes: ["couple", "rainy-day", "home-date"], genres: ["romance", "tearjerker"] },
  { slug: "les-choristes-2004", query: "Les Choristes", year: 2004, scenes: ["heartwarming", "cry-alone", "youth"], genres: ["tearjerker", "youth"] },
  { slug: "the-truth-koreeda", query: "La Vérité", year: 2019, scenes: ["home-date", "heartwarming"], genres: ["tearjerker"] },
  { slug: "petite-maman-2021", query: "Petite Maman", year: 2021, scenes: ["heartwarming", "cry-alone", "youth"], genres: ["tearjerker", "youth"] },
  // === ヨーロッパ・世界 ===
  { slug: "the-worst-person-2021", query: "Verdens verste menneske", year: 2021, scenes: ["couple", "rainy-day", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "three-idiots-2009", query: "3 Idiots", year: 2009, scenes: ["heartwarming", "not-awkward", "home-date"], genres: ["comedy", "youth"] },
  { slug: "pans-labyrinth-2006", query: "el laberinto", year: 2006, scenes: ["home-date", "rainy-day"], genres: ["suspense", "tearjerker"] },
  { slug: "roma-2018", query: "Roma", year: 2018, scenes: ["home-date", "cry-alone"], genres: ["tearjerker"] },
  { slug: "cold-war-2018", query: "Zimna Wojna", year: 2018, scenes: ["couple", "rainy-day", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "a-fantastic-woman-2017", query: "Fantastic Woman", year: 2017, scenes: ["home-date", "cry-alone"], genres: ["tearjerker"] },
];

function mapProvider(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("u-next") || n.includes("unext")) return "unext";
  if (n.includes("hulu")) return "hulu";
  if (n.includes("dmm")) return "dmm-tv";
  if (n.includes("abema")) return "abema";
  if (n.includes("lemino")) return "lemino";
  if (n.includes("amazon")) return "amazon-prime";
  return null;
}
async function tmdb(path: string) {
  const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}&language=ja-JP`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}
async function searchBest(query: string, year: number): Promise<number | null> {
  const data = await tmdb(`/search/movie?query=${encodeURIComponent(query)}`);
  const results: { id: number; release_date?: string; poster_path?: string }[] = data.results ?? [];
  if (results.length === 0) return null;
  let best = results[0], bestDiff = Infinity;
  for (const r of results) {
    const ry = r.release_date ? parseInt(r.release_date.slice(0, 4)) : 0;
    const diff = ry ? Math.abs(ry - year) : 999;
    const score = diff + (r.poster_path ? 0 : 5);
    if (score < bestDiff) { bestDiff = score; best = r; }
  }
  return best.id;
}

async function main() {
  console.log(`\n🎬 バッチ6 — ${ENTRIES.length}本\n`);
  const { data: services } = await supabase.from("vod_services").select("id, slug");
  const serviceIdBySlug = Object.fromEntries((services ?? []).map((s) => [s.slug, s.id]));
  const { data: genres } = await supabase.from("genres").select("id, slug");
  const genreIdBySlug = Object.fromEntries((genres ?? []).map((g) => [g.slug, g.id]));
  const { data: scenes } = await supabase.from("scenes").select("id, slug");
  const sceneIdBySlug = Object.fromEntries((scenes ?? []).map((s) => [s.slug, s.id]));

  let ok = 0, fail = 0, avail = 0;
  for (const e of ENTRIES) {
    try {
      const id = await searchBest(e.query, e.year);
      if (!id) { console.error(`❌ ヒットなし: ${e.query}`); fail++; continue; }
      const d = await tmdb(`/movie/${id}?append_to_response=watch/providers`);
      const cc = d.production_countries?.[0]?.iso_3166_1 ?? "";
      const country = COUNTRY_JA[cc] ?? d.production_countries?.[0]?.name ?? null;
      const movieData = {
        title: d.title ?? d.original_title, slug: e.slug,
        original_title: d.original_title !== d.title ? d.original_title : null,
        release_year: d.release_date ? parseInt(d.release_date.slice(0, 4)) : null,
        description: d.overview ?? null,
        summary: d.overview ? d.overview.slice(0, 140).replace(/。[^。]*$/, "。") : null,
        runtime_minutes: d.runtime || null, country,
        poster_url: d.poster_path ? `${TMDB_IMG}${d.poster_path}` : null,
      };
      const { data: movie, error: mErr } = await supabase.from("movies").upsert(movieData, { onConflict: "slug" }).select("id").single();
      if (mErr || !movie) { console.error(`❌ ${e.slug}: ${mErr?.message}`); fail++; continue; }
      const movieId = movie.id;
      const tmdbGenres = (d.genres ?? []).map((g: { id: number }) => TMDB_GENRE_MAP[g.id]).filter(Boolean);
      for (const slug of [...new Set([...e.genres, ...tmdbGenres])]) {
        if (genreIdBySlug[slug]) await supabase.from("movie_genres").upsert({ movie_id: movieId, genre_id: genreIdBySlug[slug] }, { onConflict: "movie_id,genre_id" });
      }
      for (const slug of e.scenes) {
        if (sceneIdBySlug[slug]) await supabase.from("movie_scenes").upsert({ movie_id: movieId, scene_id: sceneIdBySlug[slug] }, { onConflict: "movie_id,scene_id" });
      }
      await supabase.from("movie_availability").delete().eq("movie_id", movieId);
      const jp = d["watch/providers"]?.results?.JP ?? {};
      const best: Record<string, string> = {};
      for (const [type, list] of [["見放題", jp.flatrate], ["レンタル", jp.rent], ["購入", jp.buy]] as const) {
        for (const p of (list ?? []) as { provider_name: string }[]) {
          const s = mapProvider(p.provider_name);
          if (s && (!best[s] || TIER[type] > TIER[best[s]])) best[s] = type;
        }
      }
      const recs = Object.entries(best).filter(([s]) => serviceIdBySlug[s]).map(([s, t]) => ({
        movie_id: movieId, vod_service_id: serviceIdBySlug[s], availability_type: t, is_available: true, checked_at: new Date().toISOString(),
      }));
      if (recs.length) { await supabase.from("movie_availability").insert(recs); avail += recs.length; }
      console.log(`✅ ${e.slug.padEnd(28)} id=${id} (${movieData.release_year}) ${movieData.title} [配信${recs.length}]`);
      ok++;
      await new Promise((r) => setTimeout(r, 260));
    } catch (err) { console.error(`❌ ${e.slug}: ${(err as Error).message}`); fail++; }
  }
  console.log(`\n📊 完了: ${ok}本 / ${fail}失敗 / 配信${avail}件`);
  const { count } = await supabase.from("movies").select("*", { count: "exact", head: true });
  console.log(`📦 総数: ${count}本`);
}
main().catch(console.error);
