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
async function main() {
  const toDelete = ["the-garden-of-words", "boys-over-flowers-movie", "belle-mamoru-hosoda"];
  for (const slug of toDelete) {
    const { data: m } = await sb.from("movies").select("id").eq("slug", slug).single();
    if (!m) { console.log("not found:", slug); continue; }
    await sb.from("movie_availability").delete().eq("movie_id", m.id);
    await sb.from("movie_genres").delete().eq("movie_id", m.id);
    await sb.from("movie_scenes").delete().eq("movie_id", m.id);
    const { error } = await sb.from("movies").delete().eq("slug", slug);
    console.log("deleted", slug, error?.message ?? "OK");
  }
  const { count } = await sb.from("movies").select("*", { count: "exact", head: true });
  console.log("total:", count);
}
main().catch(console.error);
