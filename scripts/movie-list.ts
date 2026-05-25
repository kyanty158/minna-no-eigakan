// TMDB映画IDリスト
// slug: URLに使う文字列（英数字・ハイフンのみ）
// scenes: シーン紐付け（supabase/seed.sql のscenes.slugと一致させる）
// genres: ジャンル紐付け（supabase/seed.sql のgenres.slugと一致させる）
//
// ※ tmdbId は scripts/fix-catalog.ts で邦題＋公開年から検索・検証済みの正しい値。
//   修復・配信状況の再取得は `npx tsx scripts/fix-catalog.ts` を推奨。

export const MOVIES: {
  tmdbId: number;
  slug: string;
  scenes?: string[];
  genres?: string[];
}[] = [
  // ── 日本映画 ──────────────────────────────────
  { tmdbId: 695932, slug: "hanataba-mitaina-koi-wo-shita", scenes: ["couple", "home-date", "after-breakup"], genres: ["romance", "tearjerker"] },
  { tmdbId: 876797, slug: "yomei-10-nen", scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },
  { tmdbId: 449132, slug: "kimi-no-suizou-wo-tabetai", scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "youth"] },
  { tmdbId: 977871, slug: "konya-sekai-kara-kono-koi-ga-kiete-mo", scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "tearjerker"] },
  { tmdbId: 568160, slug: "tenki-no-ko", scenes: ["couple", "home-date", "rainy-day"], genres: ["romance", "anime"] },
  { tmdbId: 372058, slug: "kimi-no-na-wa", scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "anime"] },
  { tmdbId: 198375, slug: "kotonoha-no-niwa", scenes: ["rainy-day", "cry-alone"], genres: ["romance", "anime"] },
  { tmdbId: 38142, slug: "byousoku-5-centimeter", scenes: ["cry-alone", "after-breakup", "long-distance"], genres: ["romance", "anime", "tearjerker"] },
  { tmdbId: 36092, slug: "ima-ai-ni-yukimasu", scenes: ["couple", "heartwarming", "rainy-day"], genres: ["romance", "tearjerker"] },
  { tmdbId: 401146, slug: "shigatsu-wa-kimi-no-uso", scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker", "youth"] },
  { tmdbId: 364111, slug: "kokoro-ga-sakebitagatterunda", scenes: ["couple", "youth", "heartwarming"], genres: ["romance", "anime", "youth"] },
  { tmdbId: 36091, slug: "sekai-no-chuushin-de-ai-wo-sakebu", scenes: ["couple", "cry-alone", "after-breakup"], genres: ["romance", "tearjerker"] },
  { tmdbId: 40243, slug: "tada-kimi-wo-aishiteru", scenes: ["couple", "cry-alone", "heartwarming"], genres: ["romance", "tearjerker"] },

  // ── 洋画 ──────────────────────────────────────
  { tmdbId: 597, slug: "titanic", scenes: ["couple", "home-date", "heartwarming"], genres: ["romance", "tearjerker"] },
  { tmdbId: 313369, slug: "la-la-land", scenes: ["couple", "home-date", "anniversary"], genres: ["romance"] },
  { tmdbId: 11036, slug: "the-notebook", scenes: ["couple", "heartwarming", "cry-alone"], genres: ["romance", "tearjerker"] },
  { tmdbId: 194, slug: "amelie", scenes: ["rainy-day", "home-date", "not-awkward"], genres: ["romance", "comedy"] },
  { tmdbId: 76, slug: "before-sunrise", scenes: ["couple", "before-dating", "not-awkward"], genres: ["romance"] },
  { tmdbId: 80, slug: "before-sunset", scenes: ["couple", "after-breakup"], genres: ["romance"] },
  { tmdbId: 132344, slug: "before-midnight", scenes: ["couple", "home-date"], genres: ["romance"] },
  { tmdbId: 122906, slug: "about-time", scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "tearjerker"] },
  { tmdbId: 19913, slug: "500-days-of-summer", scenes: ["after-breakup", "before-dating"], genres: ["romance", "comedy"] },
  { tmdbId: 38, slug: "eternal-sunshine", scenes: ["after-breakup", "couple"], genres: ["romance"] },
  { tmdbId: 114, slug: "pretty-woman", scenes: ["couple", "not-awkward", "home-date"], genres: ["romance", "comedy"] },
  { tmdbId: 509, slug: "notting-hill", scenes: ["couple", "heartwarming", "home-date"], genres: ["romance", "comedy"] },
  { tmdbId: 804, slug: "roman-holiday", scenes: ["couple", "not-awkward", "before-dating"], genres: ["romance"] },
  { tmdbId: 634, slug: "bridget-jones-diary", scenes: ["home-date", "not-awkward", "rainy-day"], genres: ["romance", "comedy"] },
  { tmdbId: 350, slug: "devil-wears-prada", scenes: ["home-date", "not-awkward"], genres: ["comedy"] },
  { tmdbId: 59436, slug: "midnight-in-paris", scenes: ["couple", "rainy-day", "anniversary"], genres: ["romance", "comedy"] },
  { tmdbId: 9778, slug: "serendipity", scenes: ["couple", "heartwarming", "before-dating"], genres: ["romance", "comedy"] },
  { tmdbId: 198277, slug: "begin-again", scenes: ["after-breakup", "rainy-day", "home-date"], genres: ["romance"] },
  { tmdbId: 492188, slug: "marriage-story", scenes: ["couple"], genres: ["romance"] },

  // ── 韓国映画 ──────────────────────────────────
  { tmdbId: 77117, slug: "sunny-2011", scenes: ["home-date", "heartwarming"], genres: ["korean-drama", "comedy"] },
  { tmdbId: 11178, slug: "my-sassy-girl", scenes: ["couple", "before-dating", "not-awkward"], genres: ["korean-drama", "romance", "comedy"] },
  { tmdbId: 338729, slug: "beauty-inside", scenes: ["couple", "heartwarming"], genres: ["korean-drama", "romance"] },

  // ── アニメ・ジブリ ────────────────────────────
  { tmdbId: 129, slug: "spirited-away", scenes: ["home-date", "not-awkward"], genres: ["anime"] },
  { tmdbId: 8392, slug: "my-neighbor-totoro", scenes: ["home-date", "not-awkward", "rainy-day"], genres: ["anime"] },
  { tmdbId: 4935, slug: "howls-moving-castle", scenes: ["couple", "home-date", "heartwarming"], genres: ["anime", "romance"] },
  { tmdbId: 37797, slug: "whisper-of-the-heart", scenes: ["couple", "before-dating", "heartwarming"], genres: ["anime", "romance", "youth"] },
  { tmdbId: 128, slug: "princess-mononoke", scenes: ["home-date", "not-awkward"], genres: ["anime"] },
  { tmdbId: 475215, slug: "mirai", scenes: ["home-date", "heartwarming"], genres: ["anime"] },

  // ── ホラー・サスペンス（デートで盛り上がる） ──
  { tmdbId: 694, slug: "the-shining", scenes: ["home-date"], genres: ["horror"] },
  { tmdbId: 539, slug: "psycho", scenes: ["home-date"], genres: ["horror", "suspense"] },
  { tmdbId: 218, slug: "the-terminator", scenes: ["home-date", "not-awkward"], genres: ["suspense"] },
  { tmdbId: 105, slug: "back-to-the-future", scenes: ["home-date", "not-awkward"], genres: ["comedy"] },
  { tmdbId: 475303, slug: "a-rainy-day-in-new-york", scenes: ["rainy-day", "couple"], genres: ["romance", "comedy"] },
];
