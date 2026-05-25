/**
 * 映画追加バッチ3 — 競合が少ないニッチ映画 50本
 *   npx tsx scripts/add-movies-batch3.ts
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
  AU: "オーストラリア", NZ: "ニュージーランド", CA: "カナダ",
};
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance", 18: "tearjerker", 35: "comedy", 27: "horror",
  53: "suspense", 9648: "suspense", 16: "anime", 12: "youth",
};
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

type Entry = { slug: string; query: string; year: number; scenes: string[]; genres: string[] };

const ENTRIES: Entry[] = [
  // ── 邦画ラブストーリー・泣ける系（2000s〜2010s） ──
  { slug: "usotsuki-paradox", query: "嘘つきみーくんと壊れたまーちゃん", year: 2011, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker", "suspense"] },
  { slug: "solanin-movie", query: "ソラニン", year: 2010, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "initiation-love", query: "イニシエーション・ラブ", year: 2015, scenes: ["couple", "after-breakup"], genres: ["romance", "suspense"] },
  { slug: "tokyo-boy", query: "東京男子図鑑", year: 2023, scenes: ["couple", "home-date", "before-dating"], genres: ["romance"] },
  { slug: "kimi-wa-petto-movie", query: "きみはペット", year: 2003, scenes: ["couple", "home-date", "not-awkward"], genres: ["romance", "comedy"] },
  { slug: "nante-sutekina-nichiyobi", query: "なんて素敵にジャパネスク", year: 2023, scenes: ["couple", "heartwarming", "youth"], genres: ["romance", "youth"] },
  { slug: "use-by-date", query: "消費期限", year: 2016, scenes: ["couple", "after-breakup", "cry-alone"], genres: ["romance", "tearjerker"] },
  { slug: "drowning-love", query: "溺れるナイフ", year: 2016, scenes: ["couple", "before-dating", "youth"], genres: ["romance", "youth", "suspense"] },
  { slug: "hyouka-movie", query: "氷菓", year: 2017, scenes: ["couple", "youth", "before-dating"], genres: ["romance", "youth", "suspense"] },
  { slug: "princess-jellyfish", query: "海月姫", year: 2014, scenes: ["couple", "not-awkward", "heartwarming"], genres: ["romance", "comedy"] },

  // ── 邦画・社会派・泣ける ──
  { slug: "socrates-in-love-2004", query: "世界の中心で、愛をさけぶ", year: 2004, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { slug: "ichi-rittoru-no-namida", query: "1リットルの涙", year: 2005, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["tearjerker"] },
  { slug: "tokyo-serenade", query: "東京セレナーデ", year: 2023, scenes: ["couple", "after-breakup", "rainy-day"], genres: ["romance"] },
  { slug: "liverare-tokyo", query: "東京リベンジャーズ", year: 2021, scenes: ["couple", "home-date", "not-awkward"], genres: ["youth", "suspense"] },
  { slug: "all-ends-well", query: "ハッピーエンド", year: 2023, scenes: ["couple", "home-date", "heartwarming"], genres: ["romance"] },

  // ── 韓国映画・最近の恋愛映画 ──
  { slug: "moonlit-winter", query: "윤희에게", year: 2019, scenes: ["couple", "heartwarming", "long-distance"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "tune-in-for-love", query: "유열의 음악앨범", year: 2019, scenes: ["couple", "heartwarming", "long-distance"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "be-with-you-korean", query: "지금 만나러 갑니다", year: 2018, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "the-drug-king", query: "마약왕", year: 2018, scenes: ["home-date"], genres: ["suspense"] },
  { slug: "on-your-wedding-day", query: "오늘 결혼합니다", year: 2018, scenes: ["couple", "heartwarming", "anniversary"], genres: ["romance", "comedy", "korean-drama"] },
  { slug: "more-than-blue", query: "더 블루", year: 2009, scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker", "korean-drama"] },
  { slug: "little-forest-korea", query: "리틀 포레스트", year: 2018, scenes: ["home-date", "heartwarming", "rainy-day"], genres: ["tearjerker", "comedy"] },
  { slug: "samjin-company-english-class", query: "삼진그룹 영어토익반", year: 2020, scenes: ["home-date", "heartwarming", "not-awkward"], genres: ["comedy", "tearjerker"] },
  { slug: "the-wailing-korean", query: "곡성", year: 2016, scenes: ["home-date"], genres: ["horror", "suspense"] },
  { slug: "extreme-job-korean", query: "극한직업", year: 2019, scenes: ["home-date", "not-awkward"], genres: ["comedy"] },

  // ── ヨーロッパ映画・アート系（競合ほぼゼロ） ──
  { slug: "two-days-one-night", query: "Deux jours, une nuit", year: 2014, scenes: ["home-date", "heartwarming"], genres: ["tearjerker"] },
  { slug: "toni-erdmann", query: "Toni Erdmann", year: 2016, scenes: ["home-date", "heartwarming"], genres: ["comedy", "tearjerker"] },
  { slug: "the-square-swedish", query: "The Square", year: 2017, scenes: ["home-date"], genres: ["comedy", "suspense"] },
  { slug: "force-majeure", query: "フレンチアルプスで起きたこと", year: 2014, scenes: ["couple", "rainy-day"], genres: ["comedy", "suspense"] },
  { slug: "room-2015", query: "Room 2015", year: 2015, scenes: ["heartwarming", "cry-alone"], genres: ["tearjerker", "suspense"] },
  { slug: "brooklyn-2015", query: "ブルックリン", year: 2015, scenes: ["couple", "heartwarming", "long-distance"], genres: ["romance", "tearjerker"] },
  { slug: "wild-2014", query: "Wild 2014", year: 2014, scenes: ["heartwarming", "cry-alone"], genres: ["tearjerker"] },
  { slug: "philomena", query: "Philomena", year: 2013, scenes: ["heartwarming", "cry-alone"], genres: ["tearjerker", "comedy"] },
  { slug: "florence-foster-jenkins", query: "Florence Foster Jenkins", year: 2016, scenes: ["home-date", "heartwarming"], genres: ["comedy", "tearjerker"] },
  { slug: "the-artist", query: "アーティスト", year: 2011, scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "comedy"] },

  // ── ハリウッドのSF・판타지恋愛（競合少） ──
  { slug: "her-2013", query: "Her 2013 Spike Jonze", year: 2013, scenes: ["couple", "home-date", "after-breakup"], genres: ["romance", "suspense"] },
  { slug: "arrival-2016", query: "Arrival 2016", year: 2016, scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "suspense"] },
  { slug: "the-time-travelers-wife", query: "The Time Traveler's Wife", year: 2009, scenes: ["couple", "cry-alone", "long-distance"], genres: ["romance", "tearjerker"] },
  { slug: "somewhere-in-time", query: "ある日どこかで", year: 1980, scenes: ["couple", "cry-alone", "long-distance"], genres: ["romance", "tearjerker"] },
  { slug: "kate-and-leopold", query: "Kate & Leopold", year: 2001, scenes: ["couple", "heartwarming", "not-awkward"], genres: ["romance", "comedy"] },

  // ── 邦画・アニメ映画（非ジブリ・非新海誠・競合少） ──
  { slug: "napping-princess", query: "ひるね姫", year: 2017, scenes: ["home-date", "heartwarming"], genres: ["anime"] },
  { slug: "patema-inverted", query: "サカサマのパテマ", year: 2013, scenes: ["couple", "heartwarming", "youth"], genres: ["anime", "romance"] },
  { slug: "the-anthem-of-the-heart", query: "心が叫びたがってるんだ", year: 2015, scenes: ["couple", "youth", "heartwarming"], genres: ["anime", "romance", "youth"] },
  { slug: "a-letter-to-momo", query: "ももへの手紙", year: 2011, scenes: ["heartwarming", "cry-alone", "home-date"], genres: ["anime", "tearjerker"] },
  { slug: "penguin-highway", query: "ペンギン・ハイウェイ", year: 2018, scenes: ["heartwarming", "home-date", "youth"], genres: ["anime"] },
  { slug: "nakitai-watashi-wa-neko-wo-kaburu", query: "泣きたい私は猫をかぶる", year: 2020, scenes: ["couple", "heartwarming", "youth"], genres: ["anime", "romance", "youth"] },
  { slug: "josee-tiger-fish-movie", query: "ジョゼと虎と魚たち", year: 2020, scenes: ["couple", "heartwarming", "cry-alone"], genres: ["anime", "romance", "tearjerker"] },

  // ── 中国・その他アジア ──
  { slug: "young-detective-dee", query: "狄仁傑之神都龍王", year: 2013, scenes: ["home-date", "not-awkward"], genres: ["suspense"] },
  { slug: "better-days", query: "少年的你", year: 2019, scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "tearjerker", "youth"] },
  { slug: "a-sun-taiwan", query: "陽光普照", year: 2019, scenes: ["home-date", "heartwarming", "cry-alone"], genres: ["tearjerker"] },
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
  console.log(`\n🎬  映画追加バッチ3 — ${ENTRIES.length}本\n`);

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
