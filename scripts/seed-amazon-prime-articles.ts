/**
 * Amazon Prime独占配信 SEO記事バッチ（5本）
 * npx tsx scripts/seed-amazon-prime-articles.ts
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
const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_IMG = "https://image.tmdb.org/t/p/w1280";

const COMMENTS: Record<string, string> = {
  // アクション・サスペンス
  "mission-impossible-final-reckoning": "シリーズ最終作。トム・クルーズが命がけで挑む最後のミッション。IMAXで観てほしい圧巻のアクション。",
  "mission-impossible-dead-reckoning-1": "AIの暴走と孤独な戦い。デッドレコニングの前編にして、シリーズ最高傑作との呼び声も高い。",
  "ballerina-john-wick-2025": "ジョン・ウィックの世界観を継承したスピンオフ。女性主人公の復讐劇が迫力満点。",
  "working-man-2025": "ジェイソン・ステイサムが一般人の父親に。娘を誘拐した組織に一人で挑む実力派アクション。",
  "road-house-2024": "アメリカの問題バーを立て直す元UFC王者。ジェイク・ジレンホール主演のアマプラ独占作。",
  "equalizer-3-2023": "デンゼル・ワシントンのイコライザーシリーズ完結編。美しいイタリアを舞台に繰り広げる静と動の対比。",
  "warfare-2025": "実際の特殊部隊の作戦を緻密に再現。全編に緊張感が漲るリアルな戦争アクション。",
  "accountant-2-2025": "ベン・アフレック主演の天才会計士が帰還。前作ファン必見の続編。",
  "transformers-rise-of-beasts": "ビーストウォーズを映画化。新キャラ登場でシリーズの新章が幕を開ける。",
  // ホラー
  "nosferatu-2024": "ロバート・エガース監督のゴシックホラー。19世紀の空気感と恐怖が圧倒的。",
  "smile-2022": "呪いのように伝染する笑顔の恐怖。シンプルな設定なのに想像以上に怖い。",
  "smile-2-2024": "前作の恐怖がスケールアップ。ポップスターを主人公に据えたホラーの続編。",
  "black-phone-2022": "誘拐犯の地下室に閉じ込められた少年。謎の電話が紡ぐ衝撃のホラー。",
  "the-substance-2024": "カンヌ最優秀脚本賞受賞の身体ホラー。女性の「若さへの執着」を風刺した問題作。",
  "scream-6-2023": "NYを舞台に新展開。シリーズ最多の犠牲者数でホラー史に刻まれた話題作。",
  // ファミリー・アニメ
  "super-mario-bros-movie-2023": "全世界興行収入13億ドル突破。子供も大人も楽しめるゲーム映画の決定版。",
  "spider-man-across-spider-verse": "スパイダーバースの待望の続編。映像表現のすべての常識を塗り替えた傑作アニメ。",
  "how-to-train-your-dragon-2025": "ドラゴンとバイキングの感動の友情物語。シリーズ最終章に相応しい涙の大作。",
  "wild-robot-2024": "無人島に流れ着いたロボットが子育てを学ぶ。親と子のすべての人に届く感動アニメ。",
  "sonic-shadow-tokyo-mission": "ソニック新作は東京が舞台！シャドウとの共闘が見どころのゲームファン必見作。",
  "dungeons-dragons-honor-thieves": "ゲームD&Dの映画化なのに超笑える。アクションとコメディの完璧なバランス。",
  "red-one-2024": "サンタが誘拐された！？ドウェイン・ジョンソン×クリス・エヴァンスのクリスマスアクション。",
  // 感動・ドラマ
  "jurassic-world-rebirth-2025": "スカーレット・ヨハンソン主演で再生した人気シリーズ。緊張と感動が共存する大作。",
  "it-ends-with-us-2024": "全米で社会現象になった女性の自立と愛の物語。ブレイク・ライヴリー主演。",
  "gran-turismo-2023": "ゲーマーが本物のレーサーになる実話。夢を諦めない人に勇気をくれる一本。",
  "babylon-2022-film": "1920年代ハリウッドの光と闇を描く壮大な絵巻。3時間超の映画への愛に満ちた大作。",
  "red-white-royal-blue-2023": "米国大統領の息子と英国王子の禁断の恋。甘くてキュートなLGBTQラブストーリー。",
  // サスペンス系
  "war-of-worlds-2025": "宇宙人侵略の新解釈。迫力の映像で人類の生存を描くSFスリラー。",
};

type ArticleDef = {
  slug: string; title: string; excerpt: string; body: string;
  article_type: string; published_at: string; lead_tmdb_id: number; movies: string[];
};

const ARTICLES: ArticleDef[] = [
  {
    slug: "amazon-prime-only-movies-2025",
    title: "Amazonプライムでしか見れない映画まとめ【2025〜2026最新版】",
    excerpt: "Amazon Prime Video（アマプライム）でしか見れない最新映画を厳選。独占配信タイトルをジャンル別に一覧で紹介します。プライム会員なら追加料金なしで全部見放題！",
    body: "Amazonプライムビデオには、他のVODサービス（Netflix・U-NEXT・Hulu）では見られない独占配信映画が続々登場しています。アクション大作からホラー、家族向けアニメまで、プライム会員なら今すぐ追加料金なしで視聴可能。気になる作品の「どこで見れる？」はタイトルリンクから確認できます。",
    article_type: "VOD特集",
    published_at: "2026-06-06",
    lead_tmdb_id: 575265,
    movies: [
      "mission-impossible-final-reckoning",
      "jurassic-world-rebirth-2025",
      "super-mario-bros-movie-2023",
      "spider-man-across-spider-verse",
      "how-to-train-your-dragon-2025",
      "wild-robot-2024",
      "it-ends-with-us-2024",
      "road-house-2024",
      "working-man-2025",
      "the-substance-2024",
      "nosferatu-2024",
      "ballerina-john-wick-2025",
    ],
  },
  {
    slug: "amazon-prime-action-movies",
    title: "Amazonプライムのアクション映画おすすめ｜独占配信で見れる最新作",
    excerpt: "Amazonプライムビデオで見放題のアクション映画を厳選。ミッション：インポッシブル最新作、ジェイソン・ステイサム主演作など話題作が勢揃い。",
    body: "Amazonプライムはアクション映画の独占配信に特に力を入れているサービスです。シリーズの最終章、スピンオフ、実力派俳優の新作など、他では見られない作品が揃っています。プライム会員であれば月額600円（年払い換算）で全作品見放題です。",
    article_type: "VOD特集",
    published_at: "2026-06-05",
    lead_tmdb_id: 575265,
    movies: [
      "mission-impossible-final-reckoning",
      "mission-impossible-dead-reckoning-1",
      "working-man-2025",
      "ballerina-john-wick-2025",
      "road-house-2024",
      "equalizer-3-2023",
      "warfare-2025",
      "accountant-2-2025",
      "transformers-rise-of-beasts",
      "war-of-worlds-2025",
    ],
  },
  {
    slug: "amazon-prime-horror-movies",
    title: "Amazonプライムのホラー映画どこで見れる？独占配信まとめ",
    excerpt: "Amazonプライムビデオでしか見れないホラー映画を厳選。スマイル、ノスフェラトゥ、サブスタンスなど話題作が続々独占配信中。",
    body: "夜中に一人で観たい、友達とわいわい楽しみたい——Amazon Prime Videoはホラー映画の独占配信作品が充実しています。カンヌ受賞のボディホラー、古典的ゴシックホラーのリメイク、スラッシャー続編まで幅広いラインナップ。プライム会員なら追加料金なしで今夜から楽しめます。",
    article_type: "VOD特集",
    published_at: "2026-06-04",
    lead_tmdb_id: 933260,
    movies: [
      "the-substance-2024",
      "nosferatu-2024",
      "smile-2022",
      "smile-2-2024",
      "black-phone-2022",
      "scream-6-2023",
    ],
  },
  {
    slug: "amazon-prime-family-anime-movies",
    title: "Amazonプライムで見れる家族・アニメ映画まとめ【子供も大人も楽しめる】",
    excerpt: "Amazonプライムビデオで見放題の家族向け・アニメ映画を厳選。スーパーマリオ、スパイダーバース、ヒックとドラゴンなど人気作が独占配信中！",
    body: "子供と一緒に観たい映画、大人も心を動かされるアニメ映画——Amazon Prime Videoには家族みんなで楽しめる作品が豊富に揃っています。世界的大ヒットのゲーム映画からアカデミー賞受賞アニメまで、週末の映画タイムに最適な作品を集めました。",
    article_type: "VOD特集",
    published_at: "2026-06-03",
    lead_tmdb_id: 502356,
    movies: [
      "super-mario-bros-movie-2023",
      "spider-man-across-spider-verse",
      "how-to-train-your-dragon-2025",
      "wild-robot-2024",
      "sonic-shadow-tokyo-mission",
      "dungeons-dragons-honor-thieves",
      "red-one-2024",
    ],
  },
  {
    slug: "amazon-prime-drama-romance-movies",
    title: "Amazonプライムの感動・恋愛映画どこで見れる？2024〜2025年最新作",
    excerpt: "Amazon Prime Videoで見放題の感動・恋愛映画を厳選。ジュラシック・ワールド最新作、IT ENDS WITH US（ふたりで終わらせる）など話題作が勢揃い。",
    body: "泣ける作品、胸キュンする作品——Amazon Prime Videoは感動的なドラマや恋愛映画の独占配信も充実しています。社会現象になった女性の自立を描く感動作から、ゲーマーの夢を実現した実話、LGBTQのラブストーリーまで幅広いジャンルをカバー。プライム会員なら月額600円（年払い換算）で全て見放題です。",
    article_type: "VOD特集",
    published_at: "2026-06-02",
    lead_tmdb_id: 1079091,
    movies: [
      "it-ends-with-us-2024",
      "jurassic-world-rebirth-2025",
      "gran-turismo-2023",
      "red-white-royal-blue-2023",
      "babylon-2022-film",
      "wild-robot-2024",
      "how-to-train-your-dragon-2025",
    ],
  },
];

async function fetchBackdrop(tmdb_id: number): Promise<string | null> {
  try {
    const r = await fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}/images?api_key=${TMDB_API_KEY}`);
    const d = await r.json();
    const bp = d.backdrops?.[0]?.file_path;
    return bp ? `${TMDB_IMG}${bp}` : null;
  } catch { return null; }
}

async function main() {
  console.log(`\n📝 Amazon Prime記事 ${ARTICLES.length}本を投入\n`);
  const { data: dbMovies } = await sb.from("movies").select("id, slug, title, release_year");
  const movieBySlug = Object.fromEntries((dbMovies ?? []).map((m: any) => [m.slug, m]));

  let ok = 0, links = 0;
  for (const a of ARTICLES) {
    const thumbnail = await fetchBackdrop(a.lead_tmdb_id);
    await new Promise(r => setTimeout(r, 300));

    const { data: article, error } = await sb.from("articles").upsert({
      slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body,
      article_type: a.article_type, thumbnail_url: thumbnail,
      status: "published", published_at: new Date(a.published_at).toISOString(),
    }, { onConflict: "slug" }).select("id").single();

    if (error || !article) { console.error(`❌ ${a.slug}: ${error?.message}`); continue; }

    await sb.from("article_movies").delete().eq("article_id", article.id);
    const rows = a.movies.flatMap((slug, i) => {
      const m = movieBySlug[slug];
      if (!m) { console.warn(`  ⚠ 作品なし: ${slug}`); return []; }
      const comment = COMMENTS[slug] ?? "";
      return [{ article_id: article.id, movie_id: (m as any).id, display_order: i, comment }];
    });
    if (rows.length) {
      const { error: e2 } = await sb.from("article_movies").insert(rows);
      if (e2) console.error(`  ❌ links ${a.slug}: ${e2.message}`);
      else links += rows.length;
    }
    console.log(`  ✅ ${a.slug} — ${rows.length}本リンク`);
    ok++;
  }
  console.log(`\n完了: ${ok}記事 / ${links}本リンク`);
}
main().catch(console.error);
