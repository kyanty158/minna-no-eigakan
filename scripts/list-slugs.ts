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
  const { data } = await sb.from("movies").select("slug, title, release_year, country").order("slug");
  for (const m of data ?? []) console.log(`${m.slug}\t${m.title}\t${m.release_year ?? ""}\t${m.country ?? ""}`);
  console.log(`\n総数: ${(data ?? []).length}`);
}
main().catch(console.error);
