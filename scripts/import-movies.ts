/**
 * TMDBから映画データを取得してSupabaseに登録するスクリプト
 *
 * 実行方法:
 *   npx tsx scripts/import-movies.ts
 *
 * 必要な環境変数 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← Supabase管理画面 > Settings > API > service_role
 *   TMDB_API_KEY                ← https://www.themoviedb.org/settings/api
 */

import { createClient } from "@supabase/supabase-js";
import { MOVIES } from "./movie-list";

// ── env読み込み ────────────────────────────────────────────────────────────
// tsx は .env.local を自動読み込みしないので dotenv で読む
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  } catch {
    // .env.local がなければ process.env をそのまま使う
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";

if (!SUPABASE_URL || SUPABASE_URL.includes("placeholder")) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL が設定されていません（.env.local を確認）");
  process.exit(1);
}
if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY が設定されていません（.env.local を確認）");
  process.exit(1);
}
if (!TMDB_API_KEY) {
  console.error("❌ TMDB_API_KEY が設定されていません（.env.local を確認）");
  process.exit(1);
}

// ── Supabase（service role で書き込み権限あり）─────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p/w500";

// ── TMDB国名を日本語に変換 ──────────────────────────────────────────────────
const COUNTRY_JA: Record<string, string> = {
  JP: "日本", US: "アメリカ", FR: "フランス", GB: "イギリス",
  KR: "韓国", IT: "イタリア", DE: "ドイツ", CN: "中国", TW: "台湾",
};

// ── TMDBジャンルID → 映画メモの slug ──────────────────────────────────────
const TMDB_GENRE_MAP: Record<number, string> = {
  10749: "romance",   // Romance
  18:    "tearjerker", // Drama
  35:    "comedy",    // Comedy
  27:    "horror",    // Horror
  53:    "suspense",  // Thriller
  9648:  "suspense",  // Mystery
  16:    "anime",     // Animation
  12:    "youth",     // Adventure (青春っぽいものに充てる)
};

// ── ヘルパー: slugify ──────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── TMDB API fetch ─────────────────────────────────────────────────────────
async function fetchTmdb(path: string) {
  const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}&language=ja-JP`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

// ── メイン処理 ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🎬 みんなの映画館 — TMDB インポート開始 (${MOVIES.length}本)\n`);

  // ジャンル・シーンのID一覧を取得
  const { data: genres }  = await supabase.from("genres").select("id, slug");
  const { data: scenes }  = await supabase.from("scenes").select("id, slug");

  if (!genres || !scenes) {
    console.error("❌ genres / scenes テーブルが空です。先に seed.sql を実行してください。");
    process.exit(1);
  }

  const genreBySlug  = Object.fromEntries(genres.map((g) => [g.slug,  g.id]));
  const sceneBySlug  = Object.fromEntries(scenes.map((s) => [s.slug,  s.id]));

  let ok = 0, skip = 0, fail = 0;

  for (const item of MOVIES) {
    try {
      // ── TMDBから取得 ─────────────────────────────────────────────────
      const d = await fetchTmdb(`/movie/${item.tmdbId}`);

      const countryCode = d.production_countries?.[0]?.iso_3166_1 ?? "";
      const country = COUNTRY_JA[countryCode] ?? d.production_countries?.[0]?.name ?? null;

      const movieData = {
        title:           d.title ?? d.original_title,
        slug:            item.slug,
        original_title:  d.original_title !== d.title ? d.original_title : null,
        release_year:    d.release_date ? parseInt(d.release_date.slice(0, 4)) : null,
        description:     d.overview ?? null,
        summary:         d.overview ? d.overview.slice(0, 120).replace(/。.*$/, "。") : null,
        runtime_minutes: d.runtime || null,
        country,
        age_rating:      null,
        poster_url:      d.poster_path ? `${TMDB_IMG}${d.poster_path}` : null,
      };

      // ── movies テーブルへ upsert ─────────────────────────────────────
      const { data: movie, error: movieErr } = await supabase
        .from("movies")
        .upsert(movieData, { onConflict: "slug" })
        .select("id")
        .single();

      if (movieErr || !movie) {
        console.error(`❌ ${movieData.title}: ${movieErr?.message}`);
        fail++;
        continue;
      }

      const movieId = movie.id;

      // ── ジャンル紐付け（TMDBジャンル + 指定ジャンル）─────────────────
      const tmdbGenreSlugs = (d.genres ?? [])
        .map((g: { id: number }) => TMDB_GENRE_MAP[g.id])
        .filter(Boolean) as string[];
      const allGenreSlugs = [...new Set([...(item.genres ?? []), ...tmdbGenreSlugs])];

      for (const slug of allGenreSlugs) {
        const genreId = genreBySlug[slug];
        if (!genreId) continue;
        await supabase
          .from("movie_genres")
          .upsert({ movie_id: movieId, genre_id: genreId }, { onConflict: "movie_id,genre_id" });
      }

      // ── シーン紐付け ─────────────────────────────────────────────────
      for (const sceneSlug of item.scenes ?? []) {
        const sceneId = sceneBySlug[sceneSlug];
        if (!sceneId) continue;
        await supabase
          .from("movie_scenes")
          .upsert({ movie_id: movieId, scene_id: sceneId }, { onConflict: "movie_id,scene_id" });
      }

      console.log(`✅ ${movieData.title} (${movieData.release_year})`);
      ok++;

      // TMDB APIのレート制限対策（40req/10s）
      await new Promise((r) => setTimeout(r, 260));

    } catch (e) {
      console.error(`❌ tmdbId ${item.tmdbId}: ${(e as Error).message}`);
      fail++;
    }
  }

  console.log(`\n📊 完了: ✅${ok}本 / スキップ${skip}本 / ❌${fail}本\n`);
}

main();
