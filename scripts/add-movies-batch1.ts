/**
 * 映画追加バッチ1 — 競合が少ないニッチ映画 50本
 *   npx tsx scripts/add-movies-batch1.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TMDB_API_KEY) {
  console.error("❌ .env.local の SUPABASE / TMDB 設定を確認してください");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const COUNTRY_JA: Record<string, string> = {
  JP: "日本", US: "アメリカ", FR: "フランス", GB: "イギリス",
  KR: "韓国", IT: "イタリア", DE: "ドイツ", CN: "中国", TW: "台湾",
};
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance", 18: "tearjerker", 35: "comedy", 27: "horror",
  53: "suspense", 9648: "suspense", 16: "anime", 12: "youth",
};

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  // ── 邦画ロマンス（2000s〜2010s / 少女漫画原作・競合少） ──
  { slug: "boku-wa-asu-kinou-no-kimi-to-date", query: "ぼくは明日、昨日のきみとデートする", year: 2016, scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "tearjerker"] },
  { slug: "hidamari-no-kanojo", query: "陽だまりの彼女", year: 2013, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "strobe-edge", query: "ストロボ・エッジ", year: 2015, scenes: ["couple", "before-dating", "youth"], genres: ["romance", "youth"] },
  { slug: "ao-haru-ride", query: "アオハライド", year: 2014, scenes: ["couple", "before-dating", "youth"], genres: ["romance", "youth"] },
  { slug: "heroine-shikkaku", query: "ヒロイン失格", year: 2015, scenes: ["couple", "before-dating", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "ookami-shoujo-to-kuro-ouji", query: "オオカミ少女と黒王子", year: 2016, scenes: ["couple", "before-dating", "home-date"], genres: ["romance", "comedy"] },
  { slug: "ore-monogatari", query: "俺物語!!", year: 2015, scenes: ["couple", "before-dating", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "kinkyori-renai", query: "近キョリ恋愛", year: 2014, scenes: ["couple", "before-dating", "not-awkward"], genres: ["romance"] },
  { slug: "kanojo-wa-uso-wo-aishitesugiru", query: "カノジョは嘘をついている", year: 2013, scenes: ["couple", "heartwarming", "home-date"], genres: ["romance"] },
  { slug: "hanamizuki", query: "ハナミズキ", year: 2010, scenes: ["couple", "long-distance", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "koizora", query: "恋空", year: 2007, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker"] },
  { slug: "taiyou-no-uta", query: "タイヨウのうた", year: 2006, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "nada-sou-sou", query: "涙そうそう", year: 2006, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "haru-no-yuki", query: "春の雪", year: 2005, scenes: ["couple", "cry-alone", "anniversary"], genres: ["romance", "tearjerker"] },
  { slug: "boku-no-hatsukoi-wo-kimi-ni-sasagu", query: "僕の初恋をキミに捧ぐ", year: 2009, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "50-kaime-no-first-kiss", query: "50回目のファーストキス", year: 2018, scenes: ["couple", "not-awkward", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "tokyo-tower-2007", query: "東京タワー オカンとボクと、時々、オトン", year: 2007, scenes: ["heartwarming", "cry-alone"], genres: ["tearjerker"] },
  { slug: "kimi-ni-todoke", query: "君に届け", year: 2010, scenes: ["couple", "before-dating", "youth"], genres: ["romance", "youth"] },

  // ── 日本アニメ映画（非ジブリ・非新海） ──
  { slug: "toki-wo-kakeru-shoujo", query: "時をかける少女", year: 2006, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "anime", "youth"] },
  { slug: "koe-no-katachi", query: "聲の形", year: 2016, scenes: ["heartwarming", "cry-alone", "youth"], genres: ["anime", "tearjerker", "youth"] },
  { slug: "ryu-to-sobakasu-no-hime", query: "竜とそばかすの姫", year: 2021, scenes: ["couple", "heartwarming", "home-date"], genres: ["anime", "romance"] },
  { slug: "wolf-children", query: "おおかみこどもの雨と雪", year: 2012, scenes: ["heartwarming", "home-date", "cry-alone"], genres: ["anime", "tearjerker"] },
  { slug: "omoide-no-marnie", query: "思い出のマーニー", year: 2014, scenes: ["home-date", "heartwarming", "cry-alone"], genres: ["anime", "tearjerker"] },

  // ── 韓国映画（競合少なめのクラシック） ──
  { slug: "a-moment-to-remember", query: "A Moment to Remember", year: 2004, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["korean-drama", "romance", "tearjerker"] },
  { slug: "the-classic-korean", query: "The Classic", year: 2003, scenes: ["couple", "heartwarming", "long-distance"], genres: ["korean-drama", "romance"] },
  { slug: "miss-granny-korean", query: "Miss Granny", year: 2014, scenes: ["home-date", "not-awkward", "heartwarming"], genres: ["korean-drama", "comedy"] },
  { slug: "ditto-2022", query: "Ditto 2022", year: 2022, scenes: ["couple", "heartwarming", "before-dating"], genres: ["korean-drama", "romance"] },
  { slug: "architecture-101", query: "Architecture 101", year: 2012, scenes: ["couple", "after-breakup", "before-dating"], genres: ["korean-drama", "romance"] },
  { slug: "christmas-in-august", query: "Christmas in August", year: 1998, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["korean-drama", "romance", "tearjerker"] },

  // ── ハリウッドロマンス（王道だが競合薄） ──
  { slug: "love-actually", query: "Love Actually", year: 2003, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "four-weddings-and-a-funeral", query: "Four Weddings and a Funeral", year: 1994, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "sleepless-in-seattle", query: "Sleepless in Seattle", year: 1993, scenes: ["couple", "heartwarming", "long-distance"], genres: ["romance", "comedy"] },
  { slug: "youve-got-mail", query: "You've Got Mail", year: 1998, scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "comedy"] },
  { slug: "when-harry-met-sally", query: "When Harry Met Sally", year: 1989, scenes: ["couple", "not-awkward", "before-dating"], genres: ["romance", "comedy"] },
  { slug: "me-before-you", query: "Me Before You", year: 2016, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "love-rosie", query: "Love Rosie", year: 2014, scenes: ["couple", "heartwarming", "long-distance"], genres: ["romance", "comedy"] },
  { slug: "one-day-2011", query: "One Day", year: 2011, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker"] },
  { slug: "ghost-1990", query: "Ghost", year: 1990, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "bridges-of-madison-county", query: "The Bridges of Madison County", year: 1995, scenes: ["couple", "anniversary", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "runaway-bride", query: "Runaway Bride", year: 1999, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "breakfast-at-tiffanys", query: "Breakfast at Tiffany's", year: 1961, scenes: ["couple", "before-dating", "anniversary"], genres: ["romance"] },
  { slug: "casablanca", query: "Casablanca", year: 1942, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "moulin-rouge-2001", query: "Moulin Rouge!", year: 2001, scenes: ["couple", "anniversary", "cry-alone"], genres: ["romance", "tearjerker"] },

  // ── イギリス文学原作（検索ボリュームあり・競合少） ──
  { slug: "pride-and-prejudice-2005", query: "Pride & Prejudice", year: 2005, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance"] },
  { slug: "emma-2020", query: "Emma", year: 2020, scenes: ["couple", "home-date", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "sense-and-sensibility", query: "Sense and Sensibility", year: 1995, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance"] },
  { slug: "atonement", query: "Atonement", year: 2007, scenes: ["couple", "cry-alone", "long-distance"], genres: ["romance", "tearjerker"] },

  // ── フランス映画（ほぼ競合ゼロ） ──
  { slug: "les-parapluies-de-cherbourg", query: "The Umbrellas of Cherbourg", year: 1964, scenes: ["couple", "rainy-day", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "les-demoiselles-de-rochefort", query: "The Young Girls of Rochefort", year: 1967, scenes: ["couple", "not-awkward", "heartwarming"], genres: ["romance", "comedy"] },
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
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

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
  console.log(`\n🎬  映画追加バッチ1 — ${ENTRIES.length}本\n`);

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
      if (!id) { console.error(`❌ 検索ヒットなし: ${e.query}`); fail++; continue; }

      const d = await tmdb(`/movie/${id}?append_to_response=watch/providers`);
      const countryCode = d.production_countries?.[0]?.iso_3166_1 ?? "";
      const country = COUNTRY_JA[countryCode] ?? d.production_countries?.[0]?.name ?? null;

      const movieData = {
        title: d.title ?? d.original_title,
        slug: e.slug,
        original_title: d.original_title !== d.title ? d.original_title : null,
        release_year: d.release_date ? parseInt(d.release_date.slice(0, 4)) : null,
        description: d.overview ?? null,
        summary: d.overview ? d.overview.slice(0, 140).replace(/。[^。]*$/, "。") : null,
        runtime_minutes: d.runtime || null,
        country,
        poster_url: d.poster_path ? `${TMDB_IMG}${d.poster_path}` : null,
      };

      const { data: movie, error: mErr } = await supabase
        .from("movies").upsert(movieData, { onConflict: "slug" }).select("id").single();
      if (mErr || !movie) { console.error(`❌ ${e.slug}: ${mErr?.message}`); fail++; continue; }
      const movieId = movie.id;

      // ジャンル（手動 + TMDB由来）
      const tmdbGenres = (d.genres ?? []).map((g: { id: number }) => TMDB_GENRE_MAP[g.id]).filter(Boolean);
      for (const slug of [...new Set([...e.genres, ...tmdbGenres])]) {
        if (genreIdBySlug[slug]) await supabase.from("movie_genres").upsert({ movie_id: movieId, genre_id: genreIdBySlug[slug] }, { onConflict: "movie_id,genre_id" });
      }
      // シーン
      for (const slug of e.scenes) {
        if (sceneIdBySlug[slug]) await supabase.from("movie_scenes").upsert({ movie_id: movieId, scene_id: sceneIdBySlug[slug] }, { onConflict: "movie_id,scene_id" });
      }

      // 配信状況
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

      console.log(`✅ ${e.slug.padEnd(40)} id=${id} (${movieData.release_year}) ${movieData.title}  [配信${recs.length}]`);
      ok++;
      await new Promise((r) => setTimeout(r, 260));
    } catch (err) {
      console.error(`❌ ${e.slug}: ${(err as Error).message}`); fail++;
    }
  }

  console.log(`\n📊  完了: ${ok}本追加 / ${fail}件失敗 / 配信情報${avail}件\n`);
}

main().catch(console.error);
