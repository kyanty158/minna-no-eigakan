/**
 * カタログ修正スクリプト。
 * 旧 movie-list.ts の tmdbId 誤りで壊れた movies データを、
 * 正しい邦題＋公開年で TMDB を検索し直して修復する。
 * 併せてジャンル/シーン紐付けと配信状況(movie_availability)も作り直す。
 *
 *   npx tsx scripts/fix-catalog.ts
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

// 削除する不正/重複エントリ
const DELETE_SLUGS = ["your-name-is-rose", "your-lie-in-april-movie"];

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  { slug: "hanataba-mitaina-koi-wo-shita", query: "花束みたいな恋をした", year: 2021, scenes: ["couple", "home-date", "after-breakup"], genres: ["romance", "tearjerker"] },
  { slug: "yomei-10-nen", query: "余命10年", year: 2022, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "kimi-no-suizou-wo-tabetai", query: "君の膵臓をたべたい", year: 2017, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "konya-sekai-kara-kono-koi-ga-kiete-mo", query: "今夜、世界からこの恋が消えても", year: 2022, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "tenki-no-ko", query: "天気の子", year: 2019, scenes: ["couple", "home-date", "rainy-day"], genres: ["romance", "anime"] },
  { slug: "kimi-no-na-wa", query: "君の名は。", year: 2016, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "anime"] },
  { slug: "kotonoha-no-niwa", query: "言の葉の庭", year: 2013, scenes: ["rainy-day", "cry-alone"], genres: ["romance", "anime"] },
  { slug: "byousoku-5-centimeter", query: "秒速5センチメートル", year: 2007, scenes: ["cry-alone", "after-breakup", "long-distance"], genres: ["romance", "anime", "tearjerker"] },
  { slug: "ima-ai-ni-yukimasu", query: "いま、会いにゆきます", year: 2004, scenes: ["couple", "heartwarming", "rainy-day"], genres: ["romance", "tearjerker"] },
  { slug: "shigatsu-wa-kimi-no-uso", query: "四月は君の嘘", year: 2016, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "kokoro-ga-sakebitagatterunda", query: "心が叫びたがってるんだ。", year: 2015, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "anime", "youth"] },
  { slug: "sekai-no-chuushin-de-ai-wo-sakebu", query: "世界の中心で、愛をさけぶ", year: 2004, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker"] },
  { slug: "tada-kimi-wo-aishiteru", query: "ただ、君を愛してる", year: 2006, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "titanic", query: "タイタニック", year: 1997, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "la-la-land", query: "ラ・ラ・ランド", year: 2016, scenes: ["couple", "home-date", "anniversary"], genres: ["romance"] },
  { slug: "the-notebook", query: "きみに読む物語", year: 2004, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "amelie", query: "アメリ", year: 2001, scenes: ["rainy-day", "home-date", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "before-sunrise", query: "ビフォア・サンライズ 恋人までの距離", year: 1995, scenes: ["couple", "before-dating", "not-awkward"], genres: ["romance"] },
  { slug: "before-sunset", query: "ビフォア・サンセット", year: 2004, scenes: ["couple", "after-breakup"], genres: ["romance"] },
  { slug: "before-midnight", query: "ビフォア・ミッドナイト", year: 2013, scenes: ["couple", "home-date"], genres: ["romance"] },
  { slug: "about-time", query: "アバウト・タイム", year: 2013, scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "tearjerker"] },
  { slug: "500-days-of-summer", query: "(500)日のサマー", year: 2009, scenes: ["after-breakup", "before-dating"], genres: ["romance", "comedy"] },
  { slug: "eternal-sunshine", query: "エターナル・サンシャイン", year: 2004, scenes: ["after-breakup", "couple"], genres: ["romance"] },
  { slug: "pretty-woman", query: "プリティ・ウーマン", year: 1990, scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { slug: "notting-hill", query: "ノッティングヒルの恋人", year: 1999, scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "comedy"] },
  { slug: "roman-holiday", query: "ローマの休日", year: 1953, scenes: ["couple", "not-awkward", "before-dating"], genres: ["romance"] },
  { slug: "bridget-jones-diary", query: "ブリジット・ジョーンズの日記", year: 2001, scenes: ["home-date", "not-awkward", "rainy-day"], genres: ["romance", "comedy"] },
  { slug: "devil-wears-prada", query: "プラダを着た悪魔", year: 2006, scenes: ["home-date", "not-awkward"], genres: ["comedy"] },
  { slug: "midnight-in-paris", query: "ミッドナイト・イン・パリ", year: 2011, scenes: ["couple", "rainy-day", "anniversary"], genres: ["romance", "comedy"] },
  { slug: "serendipity", query: "セレンディピティ", year: 2001, scenes: ["couple", "heartwarming", "before-dating"], genres: ["romance", "comedy"] },
  { slug: "begin-again", query: "はじまりのうた", year: 2013, scenes: ["after-breakup", "rainy-day", "home-date"], genres: ["romance"] },
  { slug: "marriage-story", query: "マリッジ・ストーリー", year: 2019, scenes: ["couple"], genres: ["romance"] },
  { slug: "sunny-2011", query: "サニー 永遠の仲間たち", year: 2011, scenes: ["home-date", "heartwarming"], genres: ["korean-drama", "comedy"] },
  { slug: "my-sassy-girl", query: "猟奇的な彼女", year: 2001, scenes: ["couple", "before-dating", "not-awkward"], genres: ["korean-drama", "romance", "comedy"] },
  { slug: "beauty-inside", query: "ビューティー・インサイド", year: 2015, scenes: ["couple", "heartwarming"], genres: ["korean-drama", "romance"] },
  { slug: "spirited-away", query: "千と千尋の神隠し", year: 2001, scenes: ["home-date", "not-awkward"], genres: ["anime"] },
  { slug: "my-neighbor-totoro", query: "となりのトトロ", year: 1988, scenes: ["home-date", "not-awkward", "rainy-day"], genres: ["anime"] },
  { slug: "howls-moving-castle", query: "ハウルの動く城", year: 2004, scenes: ["couple", "home-date", "heartwarming"], genres: ["anime", "romance"] },
  { slug: "whisper-of-the-heart", query: "耳をすませば", year: 1995, scenes: ["couple", "before-dating", "heartwarming"], genres: ["anime", "romance", "youth"] },
  { slug: "princess-mononoke", query: "もののけ姫", year: 1997, scenes: ["home-date", "not-awkward"], genres: ["anime"] },
  { slug: "mirai", query: "未来のミライ", year: 2018, scenes: ["home-date", "heartwarming"], genres: ["anime"] },
  { slug: "the-shining", query: "シャイニング", year: 1980, scenes: ["home-date"], genres: ["horror"] },
  { slug: "psycho", query: "サイコ", year: 1960, scenes: ["home-date"], genres: ["horror", "suspense"] },
  { slug: "the-terminator", query: "ターミネーター", year: 1984, scenes: ["home-date", "not-awkward"], genres: ["suspense"] },
  { slug: "back-to-the-future", query: "バック・トゥ・ザ・フューチャー", year: 1985, scenes: ["home-date", "not-awkward"], genres: ["comedy"] },
  { slug: "a-rainy-day-in-new-york", query: "レイニーデイ・イン・ニューヨーク", year: 2019, scenes: ["rainy-day", "couple"], genres: ["romance", "comedy"] },
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
    // ポスター有り・年が近いものを優先
    const score = diff + (r.poster_path ? 0 : 5);
    if (score < bestDiff) { bestDiff = score; best = r; }
  }
  return best.id;
}

async function main() {
  console.log("\n🛠  カタログ修正開始\n");

  // 不正エントリ削除（cascadeで関連も消える）
  for (const slug of DELETE_SLUGS) {
    const { error } = await supabase.from("movies").delete().eq("slug", slug);
    console.log(error ? `⚠️ 削除失敗 ${slug}: ${error.message}` : `🗑  削除 ${slug}`);
  }

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

      // 配信状況 作り直し
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

      console.log(`✅ ${e.slug.padEnd(36)} id=${id} (${movieData.release_year}) ${movieData.title}  [配信${recs.length}]`);
      ok++;
      await new Promise((r) => setTimeout(r, 260));
    } catch (err) {
      console.error(`❌ ${e.slug}: ${(err as Error).message}`); fail++;
    }
  }

  console.log(`\n📊 完了: 修正${ok}本 / 失敗${fail}本 / 配信${avail}件\n`);
}

main();
