/**
 * TMDB の watch/providers（日本リージョン）から各作品の配信状況を取得し、
 * movie_availability テーブルへ登録するスクリプト。
 *
 * 実行方法:
 *   npx tsx scripts/import-availability.ts
 *
 * 必要な環境変数 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   TMDB_API_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { MOVIES } from "./movie-list";
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {
    /* .env.local がなければ process.env を使う */
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";

if (!SUPABASE_URL || SUPABASE_URL.includes("placeholder")) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL が未設定です（.env.local を確認）");
  process.exit(1);
}
if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY が未設定です（.env.local を確認）");
  process.exit(1);
}
if (!TMDB_API_KEY) {
  console.error("❌ TMDB_API_KEY が未設定です（.env.local を確認）");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_BASE = "https://api.themoviedb.org/3";

// ── TMDB(JustWatch) プロバイダ名 → 当サイトの VOD slug ─────────────────────
function mapProvider(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("u-next") || n.includes("unext")) return "unext";
  if (n.includes("hulu")) return "hulu";
  if (n.includes("dmm")) return "dmm-tv";
  if (n.includes("abema")) return "abema";
  if (n.includes("lemino")) return "lemino";
  if (n.includes("amazon")) return "amazon-prime"; // Prime Video / Amazon Video
  return null;
}

// 見放題 > レンタル > 購入 の優先度（高い方を採用）
const TIER: Record<string, number> = { 見放題: 3, レンタル: 2, 購入: 1 };

async function fetchProviders(tmdbId: number) {
  const url = `${TMDB_BASE}/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const json = await res.json();
  return json?.results?.JP ?? {};
}

async function main() {
  console.log(`\n🎬 配信状況インポート開始 (${MOVIES.length}本)\n`);

  // VODサービス slug → id
  const { data: services } = await supabase.from("vod_services").select("id, slug");
  if (!services) {
    console.error("❌ vod_services が空です。先に seed.sql を実行してください。");
    process.exit(1);
  }
  const serviceIdBySlug = Object.fromEntries(services.map((s) => [s.slug, s.id]));

  // DB上の映画 slug → id
  const { data: dbMovies } = await supabase.from("movies").select("id, slug");
  const movieIdBySlug = Object.fromEntries((dbMovies ?? []).map((m) => [m.slug, m.id]));

  let ok = 0, rows = 0, skip = 0, fail = 0;

  for (const item of MOVIES) {
    const movieId = movieIdBySlug[item.slug];
    if (!movieId) {
      skip++;
      continue;
    }

    try {
      const jp = await fetchProviders(item.tmdbId);
      const buckets: [string, { provider_name: string }[] | undefined][] = [
        ["見放題", jp.flatrate],
        ["レンタル", jp.rent],
        ["購入", jp.buy],
      ];

      // service slug → 採用する配信形態（最上位）
      const best: Record<string, string> = {};
      for (const [type, list] of buckets) {
        for (const p of list ?? []) {
          const slug = mapProvider(p.provider_name);
          if (!slug) continue;
          if (!best[slug] || TIER[type] > TIER[best[slug]]) best[slug] = type;
        }
      }

      const records = Object.entries(best)
        .filter(([slug]) => serviceIdBySlug[slug])
        .map(([slug, type]) => ({
          movie_id: movieId,
          vod_service_id: serviceIdBySlug[slug],
          availability_type: type,
          is_available: true,
          checked_at: new Date().toISOString(),
        }));

      if (records.length > 0) {
        const { error } = await supabase
          .from("movie_availability")
          .upsert(records, { onConflict: "movie_id,vod_service_id" });
        if (error) {
          console.error(`❌ ${item.slug}: ${error.message}`);
          fail++;
          continue;
        }
        rows += records.length;
      }

      console.log(`✅ ${item.slug} — ${records.length}件 (${Object.entries(best).map(([s, t]) => `${s}:${t}`).join(", ") || "配信なし"})`);
      ok++;
      await new Promise((r) => setTimeout(r, 260)); // TMDBレート制限対策
    } catch (e) {
      console.error(`❌ ${item.slug}: ${(e as Error).message}`);
      fail++;
    }
  }

  console.log(`\n📊 完了: 処理${ok}本 / 登録${rows}件 / DB未登録スキップ${skip}本 / 失敗${fail}本\n`);
}

main();
