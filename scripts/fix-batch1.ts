/**
 * バッチ1の失敗・ミスマッチ3作品を修正
 *   npx tsx scripts/fix-batch1.ts
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
  console.error("❌ .env.local の設定を確認してください");
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
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

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

async function tmdbFetch(path: string) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${TMDB_BASE}${path}${sep}api_key=${TMDB_API_KEY}&language=ja-JP`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

async function findByDirectId(tmdbId: number): Promise<number | null> {
  try {
    const d = await tmdbFetch(`/movie/${tmdbId}`);
    return d.id ?? null;
  } catch {
    return null;
  }
}

async function searchBest(query: string, year: number): Promise<number | null> {
  const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}`);
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

type ManualEntry = {
  slug: string;
  title: string;
  original_title: string;
  release_year: number;
  country: string;
  description: string;
  scenes: string[];
  genres: string[];
};

type Entry = {
  slug: string;
  tmdbId?: number;
  query?: string;
  year: number;
  scenes: string[];
  genres: string[];
};

const FIXES: Entry[] = [
  {
    slug: "the-classic-korean",
    query: "클래식",
    year: 2003,
    scenes: ["couple", "cry-alone", "anniversary"],
    genres: ["romance", "tearjerker", "korean-drama"],
  },
  {
    slug: "ditto-2022",
    query: "동감 Ditto",
    year: 2022,
    scenes: ["couple", "cry-alone", "long-distance"],
    genres: ["romance", "tearjerker", "korean-drama"],
  },
];

const MANUAL_FIXES: ManualEntry[] = [
  {
    slug: "kanojo-wa-uso-wo-aishitesugiru",
    title: "彼女は嘘を愛しすぎてる",
    original_title: "Kanojo wa Uso wo Aishisugiteru",
    release_year: 2013,
    country: "日本",
    description: "音楽プロデューサーの天才・秋(佐藤健)と、歌が大好きな女子高生・里香(大原さやか)の純愛を描いた恋愛映画。嘘から始まった二人の恋の行方を描く。",
    scenes: ["couple", "before-dating", "heartwarming"],
    genres: ["romance", "youth"],
  },
];

async function processManual(
  e: ManualEntry,
  genreIdBySlug: Record<string, string>,
  sceneIdBySlug: Record<string, string>,
) {
  const movieData = {
    title: e.title,
    slug: e.slug,
    original_title: e.original_title,
    release_year: e.release_year,
    description: e.description,
    summary: e.description.slice(0, 140),
    country: e.country,
    poster_url: null,
  };
  const { data: movie, error } = await supabase
    .from("movies").upsert(movieData, { onConflict: "slug" }).select("id").single();
  if (error || !movie) { console.error(`❌ ${e.slug}: ${error?.message}`); return; }
  const movieId = movie.id;
  for (const slug of e.genres) {
    if (genreIdBySlug[slug]) await supabase.from("movie_genres").upsert({ movie_id: movieId, genre_id: genreIdBySlug[slug] }, { onConflict: "movie_id,genre_id" });
  }
  for (const slug of e.scenes) {
    if (sceneIdBySlug[slug]) await supabase.from("movie_scenes").upsert({ movie_id: movieId, scene_id: sceneIdBySlug[slug] }, { onConflict: "movie_id,scene_id" });
  }
  console.log(`✅ ${e.slug.padEnd(45)} (manual) (${e.release_year}) ${e.title}  [配信0]`);
}

async function main() {
  console.log("🔧 バッチ1修正スクリプト開始\n");

  const { data: services } = await supabase.from("vod_services").select("id, slug");
  const serviceIdBySlug = Object.fromEntries((services ?? []).map((s) => [s.slug, s.id]));
  const { data: genres } = await supabase.from("genres").select("id, slug");
  const genreIdBySlug = Object.fromEntries((genres ?? []).map((g) => [g.slug, g.id]));
  const { data: scenes } = await supabase.from("scenes").select("id, slug");
  const sceneIdBySlug = Object.fromEntries((scenes ?? []).map((s) => [s.slug, s.id]));

  for (const e of MANUAL_FIXES) {
    await processManual(e, genreIdBySlug, sceneIdBySlug);
  }

  for (const e of FIXES) {
    try {
      const tmdbId = e.tmdbId
        ? await findByDirectId(e.tmdbId)
        : await searchBest(e.query!, e.year);

      if (!tmdbId) {
        console.error(`❌ TMDB ID が見つかりません: ${e.slug}`);
        continue;
      }

      const d = await tmdbFetch(`/movie/${tmdbId}?append_to_response=watch/providers`);
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
      if (mErr || !movie) {
        console.error(`❌ ${e.slug}: ${mErr?.message}`);
        continue;
      }
      const movieId = movie.id;

      // ジャンル
      const tmdbGenres = (d.genres ?? []).map((g: { id: number }) => TMDB_GENRE_MAP[g.id]).filter(Boolean);
      for (const slug of [...new Set([...e.genres, ...tmdbGenres])]) {
        if (genreIdBySlug[slug]) {
          await supabase.from("movie_genres").upsert({ movie_id: movieId, genre_id: genreIdBySlug[slug] }, { onConflict: "movie_id,genre_id" });
        }
      }

      // シーン
      for (const slug of e.scenes) {
        if (sceneIdBySlug[slug]) {
          await supabase.from("movie_scenes").upsert({ movie_id: movieId, scene_id: sceneIdBySlug[slug] }, { onConflict: "movie_id,scene_id" });
        }
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
      if (recs.length) await supabase.from("movie_availability").insert(recs);

      console.log(`✅ ${e.slug.padEnd(45)} TMDB=${tmdbId} (${movieData.release_year}) ${movieData.title}  [配信${recs.length}]`);
      await new Promise((r) => setTimeout(r, 260));
    } catch (err) {
      console.error(`❌ ${e.slug}: ${(err as Error).message}`);
    }
  }

  console.log("\n✅ 修正完了");
}

main().catch(console.error);
