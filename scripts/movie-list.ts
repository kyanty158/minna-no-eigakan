// TMDB映画IDリスト
// slug: URLに使う文字列（英数字・ハイフンのみ）
// scenes: シーン紐付け（supabase/seed.sql のscenes.slugと一致させる）
// genres: ジャンル紐付け（supabase/seed.sql のgenres.slugと一致させる）

export const MOVIES: {
  tmdbId: number;
  slug: string;
  scenes?: string[];
  genres?: string[];
}[] = [
  // ── 日本映画 ──────────────────────────────────
  {
    tmdbId: 710295,
    slug: "hanataba-mitaina-koi-wo-shita",
    scenes: ["couple", "home-date", "after-breakup"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 862510,
    slug: "yomei-10-nen",
    scenes: ["couple", "cry-alone", "heartwarming"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 445827,
    slug: "kimi-no-suizou-wo-tabetai",
    scenes: ["couple", "cry-alone", "heartwarming"],
    genres: ["romance", "tearjerker", "youth"],
  },
  {
    tmdbId: 976366,
    slug: "konya-sekai-kara-kono-koi-ga-kiete-mo",
    scenes: ["couple", "home-date", "heartwarming"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 529203,
    slug: "tenki-no-ko",
    scenes: ["couple", "home-date", "rainy-day"],
    genres: ["romance", "anime"],
  },
  {
    tmdbId: 372058,
    slug: "kimi-no-na-wa",
    scenes: ["couple", "home-date", "heartwarming"],
    genres: ["romance", "anime"],
  },
  {
    tmdbId: 109424,
    slug: "kotonoha-no-niwa",
    scenes: ["rainy-day", "cry-alone"],
    genres: ["romance", "anime"],
  },
  {
    tmdbId: 41491,
    slug: "byousoku-5-centimeter",
    scenes: ["cry-alone", "after-breakup", "long-distance"],
    genres: ["romance", "anime", "tearjerker"],
  },
  {
    tmdbId: 14317,
    slug: "ima-ai-ni-yukimasu",
    scenes: ["couple", "heartwarming", "rainy-day"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 388399,
    slug: "shigatsu-wa-kimi-no-uso",
    scenes: ["couple", "cry-alone", "heartwarming"],
    genres: ["romance", "tearjerker", "youth"],
  },
  {
    tmdbId: 644093,
    slug: "last-letter",
    scenes: ["couple", "heartwarming"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 329542,
    slug: "kokoro-ga-sakebitagatterunda",
    scenes: ["couple", "youth", "heartwarming"],
    genres: ["romance", "anime", "youth"],
  },
  {
    tmdbId: 28682,
    slug: "sekai-no-chuushin-de-ai-wo-sakebu",
    scenes: ["couple", "cry-alone", "after-breakup"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 22371,
    slug: "tada-kimi-wo-aishiteru",
    scenes: ["couple", "cry-alone", "heartwarming"],
    genres: ["romance", "tearjerker"],
  },

  // ── 洋画 ──────────────────────────────────────
  {
    tmdbId: 597,
    slug: "titanic",
    scenes: ["couple", "home-date", "heartwarming"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 313369,
    slug: "la-la-land",
    scenes: ["couple", "home-date", "anniversary"],
    genres: ["romance"],
  },
  {
    tmdbId: 11036,
    slug: "the-notebook",
    scenes: ["couple", "heartwarming", "cry-alone"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 3095,
    slug: "amelie",
    scenes: ["rainy-day", "home-date", "not-awkward"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 98,
    slug: "before-sunrise",
    scenes: ["couple", "before-dating", "not-awkward"],
    genres: ["romance"],
  },
  {
    tmdbId: 12994,
    slug: "before-sunset",
    scenes: ["couple", "after-breakup"],
    genres: ["romance"],
  },
  {
    tmdbId: 122906,
    slug: "before-midnight",
    scenes: ["couple", "home-date"],
    genres: ["romance"],
  },
  {
    tmdbId: 178809,
    slug: "about-time",
    scenes: ["couple", "heartwarming", "home-date"],
    genres: ["romance", "tearjerker"],
  },
  {
    tmdbId: 19913,
    slug: "500-days-of-summer",
    scenes: ["after-breakup", "before-dating"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 38,
    slug: "eternal-sunshine",
    scenes: ["after-breakup", "couple"],
    genres: ["romance"],
  },
  {
    tmdbId: 11799,
    slug: "pretty-woman",
    scenes: ["couple", "not-awkward", "home-date"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 1650,
    slug: "notting-hill",
    scenes: ["couple", "heartwarming", "home-date"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 820,
    slug: "roman-holiday",
    scenes: ["couple", "not-awkward", "before-dating"],
    genres: ["romance"],
  },
  {
    tmdbId: 5170,
    slug: "bridget-jones-diary",
    scenes: ["home-date", "not-awkward", "rainy-day"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 3232,
    slug: "devil-wears-prada",
    scenes: ["home-date", "not-awkward"],
    genres: ["comedy"],
  },
  {
    tmdbId: 59436,
    slug: "midnight-in-paris",
    scenes: ["couple", "rainy-day", "anniversary"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 12230,
    slug: "serendipity",
    scenes: ["couple", "heartwarming", "before-dating"],
    genres: ["romance", "comedy"],
  },
  {
    tmdbId: 190955,
    slug: "begin-again",
    scenes: ["after-breakup", "rainy-day", "home-date"],
    genres: ["romance"],
  },
  {
    tmdbId: 492188,
    slug: "marriage-story",
    scenes: ["couple"],
    genres: ["romance"],
  },

  // ── 韓国映画 ──────────────────────────────────
  {
    tmdbId: 76726,
    slug: "sunny-2011",
    scenes: ["home-date", "heartwarming"],
    genres: ["korean-drama", "comedy"],
  },
  {
    tmdbId: 58787,
    slug: "my-sassy-girl",
    scenes: ["couple", "before-dating", "not-awkward"],
    genres: ["korean-drama", "romance", "comedy"],
  },
  {
    tmdbId: 338068,
    slug: "beauty-inside",
    scenes: ["couple", "heartwarming"],
    genres: ["korean-drama", "romance"],
  },
  {
    tmdbId: 256669,
    slug: "your-name-is-rose",
    scenes: ["couple", "heartwarming"],
    genres: ["korean-drama", "tearjerker"],
  },

  // ── アニメ・ジブリ ────────────────────────────
  {
    tmdbId: 128,
    slug: "spirited-away",
    scenes: ["home-date", "not-awkward"],
    genres: ["anime"],
  },
  {
    tmdbId: 8392,
    slug: "my-neighbor-totoro",
    scenes: ["home-date", "not-awkward", "rainy-day"],
    genres: ["anime"],
  },
  {
    tmdbId: 12429,
    slug: "howls-moving-castle",
    scenes: ["couple", "home-date", "heartwarming"],
    genres: ["anime", "romance"],
  },
  {
    tmdbId: 37797,
    slug: "whisper-of-the-heart",
    scenes: ["couple", "before-dating", "heartwarming"],
    genres: ["anime", "romance", "youth"],
  },
  {
    tmdbId: 129,
    slug: "princess-mononoke",
    scenes: ["home-date", "not-awkward"],
    genres: ["anime"],
  },
  {
    tmdbId: 458156,
    slug: "mirai",
    scenes: ["home-date", "heartwarming"],
    genres: ["anime"],
  },
  {
    tmdbId: 421395,
    slug: "your-lie-in-april-movie",
    scenes: ["couple", "cry-alone", "heartwarming"],
    genres: ["anime", "romance", "tearjerker"],
  },

  // ── ホラー・サスペンス（デートで盛り上がる） ──
  {
    tmdbId: 694,
    slug: "the-shining",
    scenes: ["home-date"],
    genres: ["horror"],
  },
  {
    tmdbId: 539,
    slug: "psycho",
    scenes: ["home-date"],
    genres: ["horror", "suspense"],
  },
  {
    tmdbId: 218,
    slug: "the-terminator",
    scenes: ["home-date", "not-awkward"],
    genres: ["suspense"],
  },
  {
    tmdbId: 105,
    slug: "back-to-the-future",
    scenes: ["home-date", "not-awkward"],
    genres: ["comedy"],
  },
  {
    tmdbId: 597219,
    slug: "a-rainy-day-in-new-york",
    scenes: ["rainy-day", "couple"],
    genres: ["romance", "comedy"],
  },
];
