/**
 * まとめ記事（リスティクル）を作成するシードスクリプト。
 * 既存の movies（slug）にひも付けて articles / article_movies を投入する。
 *
 *   npx tsx scripts/seed-articles.ts
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
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ .env.local の SUPABASE 設定を確認してください");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const TMDB_IMG = "https://image.tmdb.org/t/p/w1280";
const tmdbIdBySlug = Object.fromEntries(MOVIES.map((m) => [m.slug, m.tmdbId]));

// 作品ごとの編集部コメント（記事のランキングで表示）
const COMMENTS: Record<string, string> = {
  "hanataba-mitaina-koi-wo-shita": "サブカル男女の5年間をリアルに描く。共感とほろ苦さで胸がいっぱいになる恋愛映画の傑作。",
  "yomei-10-nen": "余命10年を宣告された女性の純愛。ラスト30分は涙なしには観られない。",
  "kimi-no-suizou-wo-tabetai": "ベストセラーの実写化。“生きる”ことの意味を問う青春恋愛の名作。",
  "konya-sekai-kara-kono-koi-ga-kiete-mo": "記憶障害のヒロインとの切ない恋。終盤のどんでん返しに号泣必至。",
  "tenki-no-ko": "新海誠が描く“雨”と少年少女の物語。映像美と音楽に酔いしれる。",
  "kimi-no-na-wa": "入れ替わりから始まる運命の恋。何度観ても心が震える大ヒット作。",
  "kotonoha-no-niwa": "雨の庭で出会う二人。45分に凝縮された新海誠の珠玉の短編。",
  "byousoku-5-centimeter": "距離と時間がすれ違わせる切ない初恋。大人になった今こそ刺さる。",
  "ima-ai-ni-yukimasu": "亡き妻が雨の季節に帰ってくる。家族の優しさに包まれる感動作。",
  "shigatsu-wa-kimi-no-uso": "ピアノと初恋の青春群像。鮮やかな映像と音楽で綴る感動の物語。",
  "kokoro-ga-sakebitagatterunda": "言葉を失った少女が歌で心を開く。思春期のもどかしさが眩しい。",
  "sekai-no-chuushin-de-ai-wo-sakebu": "“セカチュー”の愛称で社会現象に。永遠の純愛を描いた不朽の名作。",
  "tada-kimi-wo-aishiteru": "写真でつながる不器用な二人。ラストの一枚に涙が止まらない。",
  "titanic": "豪華客船で芽生えた身分違いの恋。映画史に残る不朽のラブストーリー。",
  "la-la-land": "夢と恋に揺れる二人をミュージカルで。切なくも美しいラストが胸を打つ。",
  "the-notebook": "一途な愛を貫く青年の物語。“全米が泣いた”純愛映画の定番。",
  "amelie": "パリを舞台にした空想好き女性の恋。可愛い世界観に元気をもらえる。",
  "before-sunrise": "一夜限りの出会いと会話だけで魅せる。恋の高揚感が詰まった名作。",
  "before-sunset": "9年後の再会を描く続編。大人になった二人の会話が沁みる。",
  "before-midnight": "三部作完結編。長く一緒にいる二人のリアルが胸に刺さる。",
  "about-time": "時間を巻き戻せる男の人生と愛。“今日”の大切さに気づかせてくれる。",
  "500-days-of-summer": "うまくいかない恋のリアル。失恋を経験した人ほど刺さる一本。",
  "eternal-sunshine": "記憶を消しても惹かれ合う二人。切なくも温かいSFラブストーリー。",
  "pretty-woman": "シンデレラストーリーの王道。観ると元気になるロマンティック・コメディ。",
  "notting-hill": "大スターと書店員の恋。ヒュー・グラントの魅力が光る名作ラブコメ。",
  "roman-holiday": "王女と記者のひと夏の恋。オードリーが輝く永遠の名作。",
  "bridget-jones-diary": "等身大の女性の恋と奮闘。笑って共感できる元気が出るラブコメ。",
  "devil-wears-prada": "一流ファッション業界で奮闘する新人。働く女性に刺さる痛快作。",
  "midnight-in-paris": "パリの夜に時を超える幻想恋愛譚。ロマンチックで美しい一本。",
  "serendipity": "運命を信じる二人の再会劇。クリスマスに観たい王道ラブストーリー。",
  "begin-again": "失意の二人が音楽で再生していく。爽やかで心に沁みる傑作。",
  "marriage-story": "離婚に向かう夫婦のリアル。愛と別れの機微を繊細に描く。",
  "sunny-2011": "かつての親友と再会する女性たち。笑って泣ける韓国の名作。",
  "my-sassy-girl": "破天荒な彼女に振り回される純愛コメディ。韓流ブームの火付け役。",
  "beauty-inside": "毎日姿が変わる男の切ない恋。設定が秀逸な韓国ラブストーリー。",
  "spirited-away": "異世界で成長する少女の物語。世代を超えて愛されるジブリの最高傑作。",
  "my-neighbor-totoro": "子どもと不思議な生き物の交流。家族で観たい心温まる名作。",
  "howls-moving-castle": "呪いをかけられた少女と魔法使いの恋。幻想的な世界に引き込まれる。",
  "whisper-of-the-heart": "夢に向かう中学生の淡い初恋。青春のきらめきが詰まったジブリ作。",
  "princess-mononoke": "人と自然の共生を描く壮大な物語。圧巻のスケールで魅せる。",
  "mirai": "兄妹の絆と家族の歴史を描く。優しい涙がこぼれる細田守作品。",
  "the-shining": "閉ざされたホテルで狂気が忍び寄る。ホラー映画の金字塔。",
  "psycho": "サスペンスの常識を変えた名匠の傑作。今なお色褪せない緊張感。",
  "the-terminator": "未来から来た殺人マシンとの死闘。SFアクションの原点。",
  "back-to-the-future": "タイムスリップで巻き起こる大冒険。家族で楽しめる永遠の娯楽作。",
  "a-rainy-day-in-new-york": "雨のNYを舞台にしたおしゃれな恋模様。大人のための洒落た一本。",
};

type ArticleDef = {
  slug: string; title: string; excerpt: string; body: string;
  article_type: string; published_at: string; movies: string[];
};

const ARTICLES: ArticleDef[] = [
  {
    slug: "couple-movies",
    title: "カップルで観たい恋愛映画おすすめ20選【2026年最新】",
    excerpt: "おうちデートの夜にぴったりな、二人で観て盛り上がる恋愛映画を厳選。胸キュンから感動作まで、今すぐ配信で観られる作品を紹介します。",
    body: "「今夜は何を観よう？」と迷うカップルへ。一緒に笑って、キュンとして、ときに泣ける——二人の時間がもっと特別になる恋愛映画を、編集部が厳選しました。各作品が今どのVODで配信中かもまとめているので、観たい作品が見つかったらそのまま無料トライアルで楽しめます。",
    article_type: "シーン別まとめ",
    published_at: "2026-05-20",
    movies: ["kimi-no-na-wa", "la-la-land", "hanataba-mitaina-koi-wo-shita", "titanic", "the-notebook", "about-time", "kimi-no-suizou-wo-tabetai", "konya-sekai-kara-kono-koi-ga-kiete-mo", "before-sunrise", "notting-hill", "my-sassy-girl", "serendipity"],
  },
  {
    slug: "tearjerker-movies",
    title: "泣ける映画ランキング｜涙腺崩壊の感動作15選",
    excerpt: "とにかく泣きたい夜に。号泣必至の感動作・純愛映画を編集部がランキング形式で紹介。ハンカチを用意して観てほしい名作ばかりです。",
    body: "思いきり泣くと、心がすっと軽くなる——そんな“涙活”にぴったりな感動作を集めました。余命もの、純愛、家族の物語まで、観たあとに優しい気持ちになれる名作を厳選。配信状況も一緒にチェックできます。",
    article_type: "ランキング",
    published_at: "2026-05-18",
    movies: ["yomei-10-nen", "kimi-no-suizou-wo-tabetai", "konya-sekai-kara-kono-koi-ga-kiete-mo", "sekai-no-chuushin-de-ai-wo-sakebu", "hanataba-mitaina-koi-wo-shita", "byousoku-5-centimeter", "titanic", "the-notebook", "ima-ai-ni-yukimasu", "shigatsu-wa-kimi-no-uso", "tada-kimi-wo-aishiteru", "about-time"],
  },
  {
    slug: "rainy-day-movies",
    title: "雨の日に見たい映画15選｜おうちでまったり名作集",
    excerpt: "しっとり、ほっこり。雨音をBGMにおうちで観たい映画を集めました。雨の日の気分にそっと寄り添う名作ばかりです。",
    body: "外に出られない雨の日は、おうちで映画を観る絶好のチャンス。しっとりとした空気感の作品から、心が温まる物語まで、雨の日の気分にぴったりな映画を厳選しました。",
    article_type: "シーン別まとめ",
    published_at: "2026-05-15",
    movies: ["tenki-no-ko", "kotonoha-no-niwa", "a-rainy-day-in-new-york", "amelie", "midnight-in-paris", "begin-again", "ima-ai-ni-yukimasu", "bridget-jones-diary"],
  },
  {
    slug: "home-date-movies",
    title: "おうちデートで見たい映画｜二人の夜にぴったり12選",
    excerpt: "ソファでまったり、二人だけの夜に。気まずくならず一緒に楽しめる、おうちデート向けの映画を厳選しました。",
    body: "おうちデートの主役といえば映画。盛り上がる娯楽作から、しっとり寄り添える恋愛映画まで、二人で観て楽しい作品を集めました。気まずくならないラインナップなので、付き合いたてのカップルにもおすすめです。",
    article_type: "シーン別まとめ",
    published_at: "2026-05-12",
    movies: ["kimi-no-na-wa", "la-la-land", "titanic", "back-to-the-future", "pretty-woman", "notting-hill", "spirited-away", "howls-moving-castle", "about-time", "devil-wears-prada", "begin-again", "the-shining"],
  },
  {
    slug: "korean-romance",
    title: "韓国の恋愛映画おすすめ｜キュンと泣けるラブストーリー",
    excerpt: "韓流ブームの名作から最新作まで。胸キュンと感動が詰まった韓国の恋愛映画を厳選して紹介します。",
    body: "切ない純愛から笑える恋愛コメディまで、韓国映画には心を動かすラブストーリーが詰まっています。日本でも人気の名作を集めたので、韓ドラ好きさんはぜひチェックしてみてください。",
    article_type: "ジャンル別まとめ",
    published_at: "2026-05-10",
    movies: ["my-sassy-girl", "beauty-inside", "sunny-2011"],
  },
  {
    slug: "anime-movies",
    title: "大人も泣けるアニメ映画おすすめ｜名作アニメ映画11選",
    excerpt: "新海誠作品からジブリまで。大人こそ刺さる感動のアニメ映画を厳選。映像美と物語に心を奪われる名作ばかりです。",
    body: "アニメ映画は子どものものだと思っていませんか？ 美しい映像と深い物語で、大人の心も揺さぶる名作が揃っています。新海誠作品やスタジオジブリの傑作まで、世代を問わず楽しめる作品を集めました。",
    article_type: "ジャンル別まとめ",
    published_at: "2026-05-08",
    movies: ["kimi-no-na-wa", "tenki-no-ko", "spirited-away", "kotonoha-no-niwa", "byousoku-5-centimeter", "princess-mononoke", "howls-moving-castle", "mirai", "kokoro-ga-sakebitagatterunda", "whisper-of-the-heart", "my-neighbor-totoro"],
  },
  {
    slug: "before-dating-movies",
    title: "付き合う前に観たい恋愛映画｜距離が縮まる名作集",
    excerpt: "気になるあの人ともっと仲良くなりたい。会話のきっかけになって、距離が縮まる恋愛映画を集めました。",
    body: "付き合う前のドキドキした時期にこそ観たい、恋の始まりを描いた映画を厳選。観たあとに二人で語り合えば、きっと距離が縮まるはず。デートのお供にもおすすめです。",
    article_type: "シーン別まとめ",
    published_at: "2026-05-05",
    movies: ["before-sunrise", "roman-holiday", "serendipity", "500-days-of-summer", "my-sassy-girl", "whisper-of-the-heart"],
  },
  {
    slug: "after-breakup-movies",
    title: "失恋した日に観たい映画｜そっと寄り添う作品7選",
    excerpt: "つらい失恋の夜に。泣いて、共感して、また前を向ける——そんな心に寄り添う映画を集めました。",
    body: "失恋した夜は、無理に元気を出さなくて大丈夫。思いきり泣ける作品や、そっと背中を押してくれる物語を集めました。観終わるころには、少しだけ心が軽くなっているはずです。",
    article_type: "シーン別まとめ",
    published_at: "2026-05-02",
    movies: ["500-days-of-summer", "before-sunset", "eternal-sunshine", "hanataba-mitaina-koi-wo-shita", "byousoku-5-centimeter", "begin-again", "sekai-no-chuushin-de-ai-wo-sakebu"],
  },
];

async function fetchBackdrop(tmdbId: number): Promise<string | null> {
  if (!tmdbId || !TMDB_API_KEY) return null;
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=ja-JP`);
    if (!res.ok) return null;
    const d = await res.json();
    return d.backdrop_path ? `${TMDB_IMG}${d.backdrop_path}` : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`\n📝 まとめ記事シード開始 (${ARTICLES.length}本)\n`);

  const { data: dbMovies } = await supabase.from("movies").select("id, slug");
  const movieIdBySlug = Object.fromEntries((dbMovies ?? []).map((m) => [m.slug, m.id]));

  let ok = 0, links = 0;

  for (const a of ARTICLES) {
    // サムネはリード作品のバックドロップ（横長）を利用
    const leadTmdb = tmdbIdBySlug[a.movies[0]];
    const thumbnail = await fetchBackdrop(leadTmdb);

    const { data: article, error } = await supabase
      .from("articles")
      .upsert({
        slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body,
        article_type: a.article_type, thumbnail_url: thumbnail,
        status: "published", published_at: new Date(a.published_at).toISOString(),
      }, { onConflict: "slug" })
      .select("id").single();

    if (error || !article) { console.error(`❌ ${a.slug}: ${error?.message}`); continue; }

    // 紐付けを作り直し
    await supabase.from("article_movies").delete().eq("article_id", article.id);
    const rows = a.movies
      .map((slug, i) => {
        const movieId = movieIdBySlug[slug];
        if (!movieId) { console.warn(`  ⚠️ 作品が見つからない: ${slug}`); return null; }
        return { article_id: article.id, movie_id: movieId, display_order: i, comment: COMMENTS[slug] ?? null };
      })
      .filter(Boolean) as { article_id: string; movie_id: string; display_order: number; comment: string | null }[];

    if (rows.length) {
      const { error: linkErr } = await supabase.from("article_movies").insert(rows);
      if (linkErr) { console.error(`❌ ${a.slug} links: ${linkErr.message}`); continue; }
      links += rows.length;
    }

    console.log(`✅ ${a.slug.padEnd(22)} 「${a.title}」 作品${rows.length}本${thumbnail ? " +サムネ" : ""}`);
    ok++;
  }

  console.log(`\n📊 完了: 記事${ok}本 / 紐付け${links}件\n`);
}

main();
