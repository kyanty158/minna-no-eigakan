/**
 * まとめ記事バッチ2 — 新規追加映画を活用したSEO記事8本
 *   npx tsx scripts/seed-articles-batch2.ts
 *
 * サムネは各記事のリード作品をTMDB検索してbackdrop(16:9)を取得。
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) { const [k, ...r] = line.split("="); if (k && r.length) process.env[k.trim()] = r.join("=").trim(); }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error("❌ SUPABASE設定確認"); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_IMG = "https://image.tmdb.org/t/p/w1280";

// 作品ごとの編集部コメント
const COMMENTS: Record<string, string> = {
  // 台湾
  "you-are-the-apple-of-my-eye": "あの頃の片思いがよみがえる。台湾青春映画ブームの火付け役となった大ヒット作。",
  "our-times-taiwan": "冴えない女子高生のときめきと成長。最後まで笑って泣ける王道の青春ラブ。",
  "secret-2007-hou": "ジェイ・チョウ初監督作。ピアノと時を超える切ない仕掛けに胸が震える。",
  "blue-gate-crossing": "夏の光がまぶしい台湾青春の名作。揺れる思春期の心を繊細に描く。",
  // 少女漫画
  "ao-haru-ride": "すれ違う初恋のもどかしさが眩しい。本田翼主演の人気漫画実写化。",
  "strobe-edge": "片思いの切なさにキュン。有村架純が初々しいヒロインを好演。",
  "ore-monogatari": "見た目はゴツいけど純粋な男子の純愛。笑えて泣ける王道ラブコメ。",
  "kimi-ni-todoke": "“貞子”と呼ばれる地味な少女の初恋。多部未華子の透明感が光る名作。",
  "orange-movie": "未来から届く手紙が後悔を変える。号泣必至の青春タイムリープ。",
  // 韓国泣ける
  "the-classic-korean": "母と娘、二世代の純愛が交差する。雨のシーンが涙を誘う韓国恋愛の金字塔。",
  "a-moment-to-remember": "記憶を失っていく妻と夫の愛。“消しゴム”の愛称で愛される感動作。",
  "il-mare": "2年の時を越えて手紙を交わす二人。『イルマーレ』のオリジナル韓国版。",
  "ditto-2022": "無線機でつながる時を超えた恋。1999年と2022年が交差する切なさ。",
  "architecture-101": "初恋の彼女と再会し家を建てる。誰もが共感する“はじめての恋”。",
  // ヨーロッパ
  "amelie": "パリの空想好き女性が起こす小さな奇跡。観ると元気をもらえる名作。",
  "les-intouchables": "正反対の二人に芽生える友情。笑って泣けるフランス映画の傑作。",
  "cinema-paradiso": "映画を愛するすべての人へ。ラストの名シーンは映画史に残る感動。",
  "call-me-by-your-name": "イタリアの夏に芽生えるひと夏の恋。美しくも切ない余韻が残る。",
  "before-sunrise": "一夜限りの出会いと会話で魅せる。恋の高揚感が詰まった不朽の名作。",
  // ラブコメ
  "love-actually": "クリスマスのロンドンで交差する9つの愛の物語。多幸感あふれる定番作。",
  "the-holiday-2006": "家を交換した二人の女性の恋。冬に観たくなる王道ラブコメ。",
  "crazy-stupid-love": "離婚危機の男が恋を学び直す。笑えて温かい大人のラブコメ。",
  "mamma-mia": "ABBAの名曲に乗せた結婚式の物語。歌って踊れる最高にハッピーな一本。",
  // 邦画純愛
  "koizora": "ケータイ小説発の大ヒット純愛。10代の切ない恋に涙が止まらない。",
  "taiyou-no-uta": "陽の光を浴びられない少女の儚い恋と歌。YUIの歌声が胸に沁みる。",
  "nada-sou-sou": "兄妹の深い絆を描く感動作。夏川りみの名曲とともに涙腺崩壊。",
  "hanamizuki": "10年の時と距離を越える初恋。新垣結衣が清楚なヒロインを好演。",
  "love-letter-1995": "“お元気ですか”——亡き恋人への手紙から始まる岩井俊二の不朽の名作。",
  "the-last-letter": "手紙が時を超えて想いをつなぐ。岩井俊二が描く大人の純愛。",
  // アニメ
  "koe-no-katachi": "いじめと贖罪、そして再生。京アニが描く繊細で美しい青春の物語。",
  "toki-wo-kakeru-shoujo": "時を駆ける少女のひと夏。細田守の名を世に広めた青春SFアニメ。",
  "wolf-children": "おおかみの子を育てる母の13年。家族愛に涙する細田守の傑作。",
  "josee-tiger-fish-movie": "車椅子の少女と青年の恋。美しい作画で描く繊細なラブストーリー。",
  "summer-wars": "ネット世界で家族が団結する。何度観ても胸が熱くなる細田守の代表作。",
  "suzume": "扉を閉じる旅に出る少女の物語。新海誠が描く喪失と再生のロードムービー。",
  // 邦画ドラマ
  "shoplifters": "血のつながらない“家族”の物語。カンヌ最高賞に輝いた是枝裕和の代表作。",
  "our-little-sister": "鎌倉で暮らす四姉妹の一年。優しい時間が流れる癒やしの群像劇。",
  "like-father-like-son": "我が子の取り違えに揺れる父親。“家族とは何か”を問う感動作。",
  "drive-my-car": "喪失を抱える男と寡黙な運転手。米アカデミー賞を受賞した世界的名作。",
  "kim-ji-young": "ある女性の人生を通して描く生きづらさ。社会現象になった話題作。",
};

type ArticleDef = {
  slug: string; title: string; excerpt: string; body: string;
  article_type: string; published_at: string; movies: string[];
};

const ARTICLES: ArticleDef[] = [
  {
    slug: "taiwan-movies",
    title: "台湾映画おすすめ｜青春＆切ない名作ラブストーリー",
    excerpt: "甘酸っぱい青春から切ないラブストーリーまで。日本でも人気の台湾映画を厳選。配信で観られる名作を紹介します。",
    body: "ノスタルジックな映像と瑞々しい物語で人気の台湾映画。あの頃の片思いを思い出す青春作から、時を超える切ない恋まで、心に残る名作を集めました。観たい作品が見つかったら、配信中のVODでそのまま楽しめます。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-24",
    movies: ["you-are-the-apple-of-my-eye", "our-times-taiwan", "secret-2007-hou", "blue-gate-crossing", "someday-or-one-day-movie", "yi-yi", "a-sun-taiwan"],
  },
  {
    slug: "shoujo-manga-movies",
    title: "少女漫画原作の実写映画おすすめ｜キュンとする恋愛作",
    excerpt: "人気少女漫画が原作の実写映画を厳選。胸キュン必至の恋愛ストーリーを、配信情報つきで紹介します。",
    body: "実写化された人気少女漫画には、ときめきが詰まっています。片思い、両想い、すれ違い——キュンとする恋の物語を集めました。お気に入りの俳優が原作キャラを演じる姿もみどころです。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-23",
    movies: ["ao-haru-ride", "strobe-edge", "ore-monogatari", "kimi-ni-todoke", "orange-movie", "heroine-shikkaku", "ookami-shoujo-to-kuro-ouji", "sukitte-ii-na-yo", "kinkyori-renai", "drowning-love", "nisekoi-movie", "princess-jellyfish"],
  },
  {
    slug: "korean-tearjerker",
    title: "切ない韓国恋愛映画｜泣ける名作ラブストーリー",
    excerpt: "とにかく泣きたい人へ。韓国の切ない恋愛映画を厳選しました。純愛から運命のすれ違いまで、涙腺崩壊の名作ばかりです。",
    body: "韓国映画の真骨頂といえば、切なく美しいラブストーリー。記憶、時間、運命——二人を引き裂くものに抗う純愛の物語を集めました。ハンカチを用意して観てほしい名作ばかりです。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-22",
    movies: ["the-classic-korean", "a-moment-to-remember", "il-mare", "ditto-2022", "architecture-101", "christmas-in-august", "one-fine-spring-day", "be-with-you-korean", "moonlit-winter", "tune-in-for-love", "on-your-wedding-day-kr", "windstruck"],
  },
  {
    slug: "european-movies",
    title: "おしゃれな大人のヨーロッパ映画おすすめ12選",
    excerpt: "フランス・イタリアを中心に、洗練されたヨーロッパ映画を厳選。大人の時間にぴったりな名作を配信情報つきで紹介します。",
    body: "美しい映像とセンスあふれる物語で魅了するヨーロッパ映画。パリの街並み、イタリアの夏、心に響く会話劇——大人だからこそ味わえる名作を集めました。週末の夜にゆっくり浸りたい作品ばかりです。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-21",
    movies: ["amelie", "les-intouchables", "cinema-paradiso", "before-sunrise", "before-sunset", "before-midnight", "call-me-by-your-name", "blue-is-the-warmest-color", "the-artist", "brooklyn-2015", "atonement"],
  },
  {
    slug: "romcom-movies",
    title: "気軽に笑えるラブコメ映画おすすめ｜元気が出る名作集",
    excerpt: "笑って、キュンとして、元気になれる。気軽に楽しめるラブコメ映画を厳選しました。デートや気分転換にもおすすめです。",
    body: "難しいことを考えず、笑ってハッピーな気分になりたい日に。王道のロマンティック・コメディを集めました。観終わったあとに思わず笑顔になれる、元気が出る作品ばかりです。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-19",
    movies: ["love-actually", "the-holiday-2006", "crazy-stupid-love", "hitch-2005", "two-weeks-notice", "music-and-lyrics", "mamma-mia", "enchanted-2007", "kate-and-leopold", "when-harry-met-sally", "youve-got-mail", "four-weddings-and-a-funeral"],
  },
  {
    slug: "japanese-romance",
    title: "邦画の純愛・泣ける恋愛映画おすすめ｜感動の名作集",
    excerpt: "日本の純愛映画を厳選。切ない初恋から運命の愛まで、涙なしには観られない感動の恋愛映画を配信情報つきで紹介します。",
    body: "まっすぐで切ない——日本ならではの純愛映画には、心を打つ物語が詰まっています。ケータイ小説原作の青春恋愛から、岩井俊二の不朽の名作まで、世代を超えて愛される作品を集めました。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-17",
    movies: ["love-letter-1995", "koizora", "taiyou-no-uta", "nada-sou-sou", "hanamizuki", "hidamari-no-kanojo", "boku-wa-asu-kinou-no-kimi-to-date", "heaven-cannot-wait", "the-last-letter", "haru-no-yuki", "boku-no-hatsukoi-wo-kimi-ni-sasagu", "50-kaime-no-first-kiss"],
  },
  {
    slug: "non-ghibli-anime",
    title: "大人も泣けるアニメ映画｜ジブリ以外の名作13選",
    excerpt: "ジブリだけじゃない。細田守・京アニ作品など、大人こそ刺さるアニメ映画を厳選。感動の名作を配信情報つきで紹介します。",
    body: "アニメ映画はジブリだけではありません。細田守監督作や京都アニメーションの感動作など、大人の心を揺さぶる名作が揃っています。美しい映像と深い物語に、きっと涙があふれます。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-14",
    movies: ["koe-no-katachi", "toki-wo-kakeru-shoujo", "wolf-children", "summer-wars", "the-boy-and-the-beast", "suzume", "josee-tiger-fish-movie", "penguin-highway", "words-bubble-up-like-soda", "a-letter-to-momo", "patema-inverted", "nakitai-watashi-wa-neko-wo-kaburu"],
  },
  {
    slug: "japanese-drama-movies",
    title: "心に残る日本の人間ドラマ映画｜是枝裕和ほか名作集",
    excerpt: "家族や人生をテーマにした日本の人間ドラマを厳選。カンヌ・アカデミー賞に輝いた名作を配信情報つきで紹介します。",
    body: "派手さはなくても、静かに心を揺さぶる人間ドラマ。家族とは何か、人生とは何かを問いかける、世界が認めた日本映画の名作を集めました。じっくりと味わいたい夜におすすめです。",
    article_type: "ジャンル別まとめ", published_at: "2026-05-11",
    movies: ["shoplifters", "our-little-sister", "like-father-like-son", "drive-my-car", "kim-ji-young"],
  },
];

async function fetchBackdropByTitle(title: string, year: number | null): Promise<string | null> {
  if (!TMDB_API_KEY) return null;
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=ja-JP&query=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = await res.json();
    const hit = d.results?.find((r: { backdrop_path?: string }) => r.backdrop_path) ?? d.results?.[0];
    return hit?.backdrop_path ? `${TMDB_IMG}${hit.backdrop_path}` : null;
  } catch { return null; }
}

async function main() {
  console.log(`\n📝 まとめ記事バッチ2 開始 (${ARTICLES.length}本)\n`);
  const { data: dbMovies } = await supabase.from("movies").select("id, slug, title, release_year");
  const movieBySlug = Object.fromEntries((dbMovies ?? []).map((m) => [m.slug, m]));

  let ok = 0, links = 0;
  for (const a of ARTICLES) {
    const lead = movieBySlug[a.movies[0]];
    const thumbnail = lead ? await fetchBackdropByTitle(lead.title, lead.release_year) : null;

    const { data: article, error } = await supabase.from("articles").upsert({
      slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body,
      article_type: a.article_type, thumbnail_url: thumbnail,
      status: "published", published_at: new Date(a.published_at).toISOString(),
    }, { onConflict: "slug" }).select("id").single();
    if (error || !article) { console.error(`❌ ${a.slug}: ${error?.message}`); continue; }

    await supabase.from("article_movies").delete().eq("article_id", article.id);
    const rows = a.movies.map((slug, i) => {
      const m = movieBySlug[slug];
      if (!m) { console.warn(`  ⚠️ 作品なし: ${slug}`); return null; }
      return { article_id: article.id, movie_id: m.id, display_order: i, comment: COMMENTS[slug] ?? null };
    }).filter(Boolean) as { article_id: string; movie_id: string; display_order: number; comment: string | null }[];

    if (rows.length) {
      const { error: linkErr } = await supabase.from("article_movies").insert(rows);
      if (linkErr) { console.error(`❌ ${a.slug} links: ${linkErr.message}`); continue; }
      links += rows.length;
    }
    console.log(`✅ ${a.slug.padEnd(22)} 「${a.title}」 作品${rows.length}本${thumbnail ? " +サムネ" : ""}`);
    ok++;
  }
  console.log(`\n📊 完了: 記事${ok}本 / 紐付け${links}件`);
  const { count } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published");
  console.log(`📦 公開記事総数: ${count}本`);
}
main().catch(console.error);
