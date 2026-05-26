/**
 * 重複・誤マッチの映画を削除してデータ品質を上げる
 *   npx tsx scripts/cleanup-bad-movies.ts
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

// 重複（同一作品・別slug。残す方は別slug）
const DUPLICATES = [
  "about-time-2013",          // keep about-time
  "koto-no-ha-no-niwa",       // keep kotonoha-no-niwa
  "my-sassy-girl-2001",       // keep my-sassy-girl
  "serendipity-2001",         // keep serendipity
  "pretty-woman-1990",        // keep pretty-woman
  "socrates-in-love-2004",    // keep sekai-no-chuushin-de-ai-wo-sakebu
  "crying-out-love",          // keep ima-ai-ni-yukimasu
  "the-anthem-of-the-heart",  // keep kokoro-ga-sakebitagatterunda
];
// 誤マッチ（TMDB検索が別作品を拾った）
const WRONG = [
  "gf-bf-2012",      // → Manic Pixie Dream Girl
  "tokyo-serenade",  // → 東京女子プロレス 爆音セレナーデ
  "mare-movie",      // → 紅白が生まれた日
  "irodori-movie",   // → アイドルビデオ
  "more-than-blue",  // → The Deep Blue Sea (別作品)
  "room-2015",       // → アダルト イン ザ ルーム
];

async function del(slug: string, reason: string) {
  const { data: m } = await sb.from("movies").select("id").eq("slug", slug).single();
  if (!m) { console.log(`  skip(なし): ${slug}`); return; }
  await sb.from("movie_availability").delete().eq("movie_id", m.id);
  await sb.from("movie_genres").delete().eq("movie_id", m.id);
  await sb.from("movie_scenes").delete().eq("movie_id", m.id);
  await sb.from("article_movies").delete().eq("movie_id", m.id);
  const { error } = await sb.from("movies").delete().eq("slug", slug);
  console.log(`  ${error ? "❌" : "🗑️ "} ${slug.padEnd(28)} (${reason})${error ? " " + error.message : ""}`);
}

async function main() {
  console.log("重複を削除:");
  for (const s of DUPLICATES) await del(s, "重複");
  console.log("\n誤マッチを削除:");
  for (const s of WRONG) await del(s, "誤マッチ");
  const { count } = await sb.from("movies").select("*", { count: "exact", head: true });
  console.log(`\n📦 残り映画総数: ${count}本`);
}
main().catch(console.error);
