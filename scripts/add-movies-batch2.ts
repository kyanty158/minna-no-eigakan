/**
 * 映画追加バッチ2 — 競合が少ないニッチ映画 50本
 *   npx tsx scripts/add-movies-batch2.ts
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
  SE: "スウェーデン", DK: "デンマーク", NO: "ノルウェー", ES: "スペイン",
};
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance", 18: "tearjerker", 35: "comedy", 27: "horror",
  53: "suspense", 9648: "suspense", 16: "anime", 12: "youth",
};
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  // ── 邦画ラブストーリー（2000年代・少女漫画原作・競合少） ──
  { slug: "nana-movie", query: "NANA ナナ", year: 2005, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker"] },
  { slug: "honey-and-clover", query: "ハチミツとクローバー", year: 2006, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "youth"] },
  { slug: "kimi-ga-oshietekureta-koto", query: "恋愛写真", year: 2003, scenes: ["couple", "cry-alone", "long-distance"], genres: ["romance", "tearjerker"] },
  { slug: "crying-out-love", query: "いま、会いにゆきます", year: 2004, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "heaven-cannot-wait", query: "ただ、君を愛してる", year: 2006, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "my-darling-is-a-foreigner", query: "私の彼は外国人", year: 2010, scenes: ["couple", "home-date", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "gf-bf-2012", query: "Girl's Love Story", year: 2012, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "youth"] },
  { slug: "koisuru-fortune-cookie", query: "恋するフォーチュンクッキー", year: 2014, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "nisekoi-movie", query: "ニセコイ", year: 2018, scenes: ["couple", "before-dating", "not-awkward"], genres: ["romance", "comedy", "youth"] },
  { slug: "sukitte-ii-na-yo", query: "好きっていいなよ", year: 2014, scenes: ["couple", "before-dating", "heartwarming"], genres: ["romance", "youth"] },

  // ── 邦画・青春／泣ける系（2010s後半〜2020s） ──
  { slug: "rurouni-kenshin-romantic", query: "るろうに剣心", year: 2012, scenes: ["couple", "home-date", "not-awkward"], genres: ["romance"] },
  { slug: "otonari-no-tenshi-sama", query: "お隣の天使様にいつの間にか駄目人間にされていた件", year: 2024, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "youth"] },
  { slug: "kimi-no-suizou-wo-tabetai", query: "君の膵臓をたべたい", year: 2017, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "orange-movie", query: "orange オレンジ", year: 2015, scenes: ["couple", "cry-alone", "youth"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "words-bubble-up-like-soda", query: "サイダーのように言葉が湧き上がる", year: 2021, scenes: ["couple", "youth", "heartwarming"], genres: ["anime", "romance", "youth"] },

  // ── 台湾映画（検索ボリュームあり・競合ほぼゼロ） ──
  { slug: "you-are-the-apple-of-my-eye", query: "那些年，我們一起追的女孩", year: 2011, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "youth", "tearjerker"] },
  { slug: "our-times-taiwan", query: "我的少女時代", year: 2015, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "youth", "comedy"] },
  { slug: "someday-or-one-day-movie", query: "想見你", year: 2022, scenes: ["couple", "cry-alone", "long-distance"], genres: ["romance", "tearjerker"] },
  { slug: "the-great-buddha-plus", query: "大佛普拉斯", year: 2017, scenes: ["home-date"], genres: ["comedy", "suspense"] },
  { slug: "secret-2007-hou", query: "Secret 不能説的秘密", year: 2007, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },

  // ── 韓国映画・ドラマ映画（競合の薄いタイトル） ──
  { slug: "my-sassy-girl-2001", query: "엽기적인 그녀", year: 2001, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy", "korean-drama"] },
  { slug: "windstruck", query: "바람의 전설", year: 2004, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "il-mare", query: "시월애", year: 2000, scenes: ["couple", "heartwarming", "long-distance"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "one-fine-spring-day", query: "봄날은 간다", year: 2001, scenes: ["couple", "after-breakup", "rainy-day"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "musa-warrior-romance", query: "클래식 Romance 2003", year: 2003, scenes: ["couple", "heartwarming"], genres: ["romance", "korean-drama"] },

  // ── ヨーロッパ映画（ほぼ競合ゼロ） ──
  { slug: "amelie", query: "Le fabuleux destin d'Amélie Poulain", year: 2001, scenes: ["couple", "heartwarming", "rainy-day"], genres: ["romance", "comedy"] },
  { slug: "blue-is-the-warmest-color", query: "Blue Is the Warmest Colour", year: 2013, scenes: ["couple", "after-breakup", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "les-intouchables", query: "Intouchables", year: 2011, scenes: ["home-date", "heartwarming", "not-awkward"], genres: ["tearjerker", "comedy"] },
  { slug: "before-sunrise", query: "Before Sunrise", year: 1995, scenes: ["couple", "before-dating", "anniversary"], genres: ["romance"] },
  { slug: "before-sunset", query: "Before Sunset", year: 2004, scenes: ["couple", "anniversary", "after-breakup"], genres: ["romance"] },
  { slug: "before-midnight", query: "Before Midnight", year: 2013, scenes: ["couple", "anniversary"], genres: ["romance"] },
  { slug: "cinema-paradiso", query: "Cinema Paradiso", year: 1988, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "la-la-land", query: "La La Land", year: 2016, scenes: ["couple", "anniversary", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "call-me-by-your-name", query: "Call Me by Your Name", year: 2017, scenes: ["couple", "summer", "after-breakup"], genres: ["romance", "tearjerker"] },

  // ── ハリウッドロマコメ・泣けるラブストーリー（競合少） ──
  { slug: "the-notebook", query: "The Notebook", year: 2004, scenes: ["couple", "cry-alone", "anniversary"], genres: ["romance", "tearjerker"] },
  { slug: "hitch-2005", query: "Hitch", year: 2005, scenes: ["couple", "not-awkward", "before-dating"], genres: ["romance", "comedy"] },
  { slug: "crazy-stupid-love", query: "Crazy Stupid Love", year: 2011, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "silver-linings-playbook", query: "Silver Linings Playbook", year: 2012, scenes: ["couple", "heartwarming", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "eternal-sunshine", query: "Eternal Sunshine of the Spotless Mind", year: 2004, scenes: ["couple", "after-breakup", "cry-alone"], genres: ["romance", "tearjerker", "suspense"] },
  { slug: "about-time-2013", query: "About Time", year: 2013, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker", "comedy"] },
  { slug: "the-holiday-2006", query: "The Holiday", year: 2006, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "comedy"] },
  { slug: "ps-i-love-you", query: "P.S. I Love You", year: 2007, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker"] },
  { slug: "a-walk-to-remember", query: "A Walk to Remember", year: 2002, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "serendipity-2001", query: "Serendipity", year: 2001, scenes: ["couple", "heartwarming", "anniversary"], genres: ["romance", "comedy"] },

  // ── アジア映画・中国 ──
  { slug: "legend-of-the-demon-cat", query: "妖猫伝", year: 2017, scenes: ["home-date"], genres: ["suspense"] },
  { slug: "dying-to-survive", query: "我不是药神", year: 2018, scenes: ["home-date", "heartwarming"], genres: ["tearjerker"] },
  { slug: "hi-mom-2021", query: "你好，李焕英", year: 2021, scenes: ["heartwarming", "cry-alone", "home-date"], genres: ["comedy", "tearjerker"] },
  { slug: "nezha-2019", query: "哪吒之魔童降世", year: 2019, scenes: ["home-date", "heartwarming"], genres: ["anime"] },
  { slug: "summer-ghost-anime", query: "サマーゴースト", year: 2021, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["anime", "romance", "tearjerker"] },
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
  console.log(`\n🎬  映画追加バッチ2 — ${ENTRIES.length}本\n`);

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
