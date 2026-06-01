/**
 * Amazon Prime おすすめ映画記事
 *   npx tsx scripts/seed-amazon-prime-article.ts
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
const TMDB_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";
const BACKDROP = "https://image.tmdb.org/t/p/w1280";

const COMMENTS: Record<string, string> = {
  "shawshank-redemption": "映画史上最高傑作との呼び声も高い感動作。希望を失いかけた夜に観てほしい一本。",
  "forrest-gump": "トム・ハンクスが体現する波乱万丈の人生と純愛。何度観ても新たな発見がある名作。",
  "coda-2021": "聴こえない家族の中で生まれた少女の夢と葛藤。歌唱シーンで必ず泣く。アカデミー賞3部門受賞。",
  "leon-1994": "孤独な殺し屋と少女の奇妙な絆。ジャン・レノとナタリー・ポートマンの演技が忘れられない。",
  "jojo-rabbit-2019": "ナチスドイツを生きる少年の成長を描くブラックコメディ。笑いと悲しみが交差する唯一無二の映画。",
  "sound-of-metal-2019": "突然聴力を失ったドラマーの物語。「静けさ」の意味を問いかけるアカデミー賞受賞作。",
  "the-farewell-2019": "末期がんの祖母に告げずに集まる家族の物語。文化を越えた愛の形に胸を打たれる。",
  "ito-2020": "「糸」の歌詞が映像になった物語。縁と縁が繋がる運命のラブストーリー。",
  "demon-slayer-mugen-train": "煉獄さんの生き様が全てを語る。国内興行収入No.1の感動アニメ映画。",
  "koe-no-katachi": "いじめと贖罪、再生を描く傑作アニメ。観終わった後に人に優しくなれる。",
  "shoplifters": "血のつながりのない擬似家族の絆。是枝裕和監督のカンヌ最高賞受賞作。",
  "drive-my-car": "妻を失った舞台俳優と女性ドライバーの対話。カンヌ脚本賞受賞の濱口竜介監督作。",
  "train-to-busan": "列車内でのゾンビサバイバル＋父と娘の絆。韓国映画入門に最適な傑作。",
  "monster-2023": "是枝裕和監督×坂元裕二脚本。「怪物」は誰かを問いかける多層的なドラマ。",
  "totto-chan-2023": "窓ぎわのトットちゃんの映画化。大人になって観ると子どもの感受性の豊かさに胸を打たれる。",
  "decision-to-leave-2022": "刑事と容疑者の女性の心理戦と愛。パク・チャヌク監督の映像美が圧倒的。",
  "broker-2022": "是枝裕和監督×韓国キャストの赤ちゃんポストを巡る人間ドラマ。笑いと涙が共存する。",
  "soshite-chichi-ni-naru": "取り違えられた子どもを通じて父親像を問う。カンヌ審査員賞受賞の是枝裕和作品。",
  "titanic": "タイタニック号の悲劇を背景にした世紀のラブストーリー。ジャックとローズの愛は永遠。",
  "silver-linings-playbook": "精神的な問題を抱える男女のラブコメ。笑えて泣けてアカデミー賞作品賞ノミネート。",
};

const MOVIES = [
  "shawshank-redemption","forrest-gump","coda-2021","leon-1994","jojo-rabbit-2019",
  "sound-of-metal-2019","the-farewell-2019","ito-2020","demon-slayer-mugen-train",
  "koe-no-katachi","shoplifters","drive-my-car","train-to-busan","monster-2023",
  "totto-chan-2023","decision-to-leave-2022","broker-2022","soshite-chichi-ni-naru",
  "titanic","silver-linings-playbook",
];

async function getBackdrop(query: string): Promise<string | null> {
  try {
    const r = await fetch(`${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_KEY}&language=ja-JP`);
    const d = await r.json();
    const movie = (d.results ?? []).find((m: { backdrop_path: string | null }) => m.backdrop_path) ?? d.results?.[0];
    if (!movie?.id) return null;
    const detail = await fetch(`${TMDB_BASE}/movie/${movie.id}?api_key=${TMDB_KEY}&language=ja-JP`);
    const md = await detail.json();
    return md.backdrop_path ? `${BACKDROP}${md.backdrop_path}` : null;
  } catch { return null; }
}

async function main() {
  const { data: movies } = await sb.from("movies").select("id, slug");
  const movieIdBySlug = Object.fromEntries((movies ?? []).map((m) => [m.slug, m.id]));

  const thumbnail_url = await getBackdrop("The Shawshank Redemption");
  const now = new Date().toISOString();

  const { data: article, error } = await sb.from("articles").upsert({
    slug: "amazon-prime-recommended-movies",
    title: "Amazon Primeで見れるおすすめ映画20選【2026年最新・見放題】",
    excerpt: "ショーシャンクの空に、フォレスト・ガンプ、万引き家族…Amazon Prime Videoで今すぐ見放題の傑作20本を厳選紹介。月額600円で全部観られます。",
    body: "Amazon Prime Videoは月額600円という業界随一のコスパで、映画・ドラマ・アニメを楽しめるVODサービスです。Amazonのショッピング特典（送料無料など）もついてくるため、すでに利用中の方も多いはず。ここでは当サイト掲載作品の中でAmazon Primeで見放題のものを厳選して紹介します。",
    thumbnail_url, status: "published", published_at: now, updated_at: now,
  }, { onConflict: "slug" }).select("id").single();

  if (error || !article) { console.error("❌", error?.message); return; }

  await sb.from("article_movies").delete().eq("article_id", article.id);
  const rows = MOVIES
    .map((slug, i) => ({ article_id: article.id, movie_id: movieIdBySlug[slug], display_order: i + 1, comment: COMMENTS[slug] ?? null }))
    .filter(r => r.movie_id);

  await sb.from("article_movies").insert(rows);
  console.log(`✅ amazon-prime-recommended-movies  thumbnail=${thumbnail_url ? "✓" : "✗"}  movies=${rows.length}`);
}
main().catch(console.error);
