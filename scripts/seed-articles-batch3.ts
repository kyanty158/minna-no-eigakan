/**
 * 記事シードバッチ3 — 高検索ボリュームテーマ8本
 *   npx tsx scripts/seed-articles-batch3.ts
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
  // ジブリ
  "spirited-away": "2001年公開。宮崎駿監督の最高傑作との呼び声も高く、アカデミー賞長編アニメーション映画賞を受賞。何度観ても新しい発見がある普遍的な物語。",
  "howls-moving-castle": "魔法使いハウルと少女ソフィーの恋愛が軸。動く城のビジュアルが圧巻で、「あなたを守りたい」という台詞は何度聞いても胸が震える。",
  "my-neighbor-totoro": "田舎への引越しとトトロとの出会いを描く。大人になって観ると子どもたちの視点の純粋さが沁みる。なんでもない日常の幸せを再確認させてくれる。",
  "princess-mononoke": "自然と人間の共存をテーマにした壮大な叙事詩。エボシ御前やサンなど強い女性キャラが魅力。重くなりすぎず一緒に考えられる。",
  "kiki-delivery-service": "独り立ちした13歳の魔女・キキの成長を描く。恋愛ではなく自己成長のストーリーだが、2人で「頑張ろう」と思える温かさがある。",
  "nausicaa": "宮崎駿の原点ともいえる作品。腐海の謎と人類の未来を描く壮大なSFで、ナウシカの生き様に誰もが心を打たれる。",
  "laputa": "空中に浮かぶ城シータとパズーの冒険を描く王道冒険ロマン。ロボット兵のシーンで泣かない人はいない。",
  "grave-of-the-fireflies": "戦時中の兄妹の絆を描いた高畑勲の傑作。ただ「かわいそう」で終わらず、戦争の理不尽さを個人の視点から問いかける。覚悟して臨むべき一本。",
  "wind-rises": "零戦設計者・堀越二郎の夢と愛を描く宮崎駿の集大成。「生きねば」という言葉の重さを2人で噛みしめてほしい。",
  "whisper-of-the-heart": "図書館の本で気になる名前を追いかける少女の淡い恋。カントリーロードの演奏シーンは何度観ても胸が温かくなる。",
  // 音楽映画
  "bohemian-rhapsody": "クイーンとフレディ・マーキュリーの軌跡を描く伝記映画。ラスト20分のライブエイドシーンは映画史上最高クラスの興奮。",
  "a-star-is-born-2018": "レディー・ガガとブラッドリー・クーパーによる愛と音楽の物語。「Shallow」が流れるたびに2人の感情が溢れ出す。",
  "rocketman-2019": "エルトン・ジョンの半生をミュージカル形式で描く。事実を超えた幻想的な演出が美しく、音楽と人生の深さを感じる。",
  "yesterday-2019": "ビートルズの曲が誰も知らない世界でシンガーソングライターが奮闘するラブコメ。「Hey Jude」や「Let It Be」を一緒に口ずさみたくなる。",
  "la-la-land": "夢を追うカップルの葛藤と選択を描くミュージカル。ラストの「もしも」の場面で感情が溢れる。",
  "once-2007": "ダブリンの路上ミュージシャンと移民女性の出会いを描く低予算映画。「Falling Slowly」が心に刺さる。",
  "sing-street-2016": "80年代ダブリンでバンドを結成する少年の青春と恋愛。音楽への純粋な情熱が眩しく、見終わると何か始めたくなる。",
  "les-choristes-2004": "問題児ばかりの寮学校に赴任した音楽教師が合唱団を作る感動作。子どもたちの歌声に涙が止まらない。",
  "begin-again": "音楽プロデューサーとシンガーが出会い、NYの路上で音楽を作る物語。「Lost Stars」を聴きながら夜散歩したくなる。",
  "mamma-mia": "ABBAの名曲に乗せて描く結婚前夜の母娘の物語。歌って踊って笑って泣ける、デートムービーの定番。",
  // サスペンス
  "knives-out-2019": "大富豪の死の謎を探るウィットに富んだミステリー。犯人がわかってからも「なぜ？」「どうなる？」と引き込まれる構造が秀逸。",
  "parasite-2019": "格差社会の韓国を描くポン・ジュノ監督作。カンヌ・アカデミー賞席巻の衝撃的な展開。見た後に話し合いたくなる。",
  "decision-to-leave-2022": "刑事と容疑者の女性の心理戦と恋愛を絡めたパク・チャヌク監督作。美しい映像と複雑な感情が絡み合う大人のサスペンス。",
  "the-secret-in-their-eyes": "25年越しの未解決事件と叶えられなかった恋を描くアルゼンチン映画。ラストの1カットで全てが変わる衝撃。",
  "the-lives-of-others": "東ドイツの監視社会で繰り広げられる人間ドラマ。権力と芸術、愛の間で揺れる主人公に引き込まれる。",
  "initiation-love": "最後の5分で全ての印象が変わる仕掛けが話題になった邦画。絶対に途中でスマホを見ないで。",
  "cold-war-2018": "ポーランドとフランスを舞台に17年間すれ違い続けるカップルを描く。白黒映像の美しさと音楽が忘れられない。",
  "the-wailing-korean": "ある村で起きる連続死の謎を追う韓国ホラーサスペンス。圧倒的な緊張感とラストへの衝撃。",
  // ほっこり
  "life-is-beautiful": "ユダヤ人の父が息子を守るため収容所の中で「ゲーム」を演じる物語。笑って笑って、最後に号泣する奇跡的な映画。",
  "three-idiots-2009": "インドの名門工科大学を舞台に3人の友人を描くコメディ。「アール・イズ・ウェル」という言葉が生き方を変えてくれる。",
  "the-great-passage": "辞書を作るという地味な仕事に命を燃やす人々を描く邦画。静かで丁寧な愛の物語に心が洗われる。",
  "swing-kids-2018": "朝鮮戦争下の捕虜収容所でタップダンスを踊る若者たちの物語。笑いと感動と哀しみが同居する傑作。",
  "our-little-sister": "鎌倉を舞台に4姉妹の日常を描く是枝裕和作品。特別なことは何も起きないのに、なぜかずっと観ていたい。",
  "petite-maman-2021": "亡き祖母の家を訪れた少女が出会う不思議な出来事。80分の映画なのに見終わった後の余韻がずっと続く。",
  "everything-everywhere-all-at-once": "中年の中国系アメリカ人女性がマルチバースで戦う物語。バカバカしさの中に「愛とは何か」という問いが溢れている。",
  "shoplifters": "血の繋がりを超えた家族の絆を描く是枝裕和作品。カンヌ最高賞受賞。一緒に観て「家族って何だろう」と話したい。",
  "broker-2022": "赤ちゃんポストを巡る人々の旅路を描く是枝裕和の韓国作品。ソン・ガンホの演技と温かみのある結末が沁みる。",
  // ハリウッドクラシック
  "pretty-woman": "プロスティテュートとビジネスマンの恋愛を描く90年代を代表するラブコメ。ジュリア・ロバーツが最も輝いていた頃の作品。",
  "titanic": "1912年のタイタニック号を舞台にしたロマン。「飛んでる！」のシーンと「My Heart Will Go On」は永遠に色褪せない。",
  "sleepless-in-seattle": "ラジオ番組をきっかけに引き寄せられる2人を描くラブストーリー。エンパイアステートビルの屋上でのラストシーンが最高。",
  "youve-got-mail": "匿名のメール交換で恋に落ちる物語。今の時代ならSNSで起きそうなすれ違いを先取りした傑作。",
  "notting-hill": "世界的女優と普通の本屋の店主の恋。「私はただの女の子です…」という台詞に胸が熱くなる。",
  "four-weddings-and-a-funeral": "4つの結婚式と1つの葬式を通じて育まれる恋を描くヒュー・グラントのラブコメ。今観ても笑えて泣ける。",
  "when-harry-met-sally": "「男と女の間に友情は成立するか？」を問い続ける名作ラブコメ。ニューイヤーの告白シーンは映画史上屈指のロマン。",
  "ghost-1990": "陶芸のシーンと「Unchained Melody」の組み合わせは映画史上最高のラブシーン。泣けて泣けて仕方ない。",
  "the-notebook": "老人ホームで老いた妻に読み聞かせる男性。その内容が二人の若き日の恋愛物語。ニコラス・スパークス原作の感動作。",
  "serendipity": "たった一夜の出会いと「運命」を信じる2人。クリスマスシーズンに観たい、可愛らしいラブストーリー。",
  // 青春
  "koe-no-katachi": "聴覚障害の少女と彼女をいじめた少年の贖罪と再生。作画の美しさとリアルな感情描写が突出した傑作アニメ。",
  "chihayafuru": "百人一首で青春をかける少女の成長と恋愛を描く実写版。広瀬すずが体当たりで演じるちはやの姿に胸が熱くなる。",
  "boku-wa-asu-kinou-no-kimi-to-date": "出会った瞬間から泣き崩れる彼女。その謎が明かされるとき、全ての台詞の意味が変わる切ない恋愛映画。",
  "you-are-the-apple-of-my-eye": "台湾の高校生たちの青春と恋を描く名作。「好きだった」という感情の純粋さに、自分の青春時代を思い出す。",
  "my-20th-century-girl": "1999年、好きな男の子のために友人の代わりに近づいた少女の青春。Netflixの韓国映画で一番切ない。",
  "house-of-hummingbird-2018": "1994年ソウルを生きる14歳の少女の繊細な感情を描く韓国映画。「あなたはよく頑張ってきた」という言葉に涙が溢れる。",
  "blue-gate-crossing": "台湾の高校生の淡い恋と友情。静かな映像美とさりげない感情表現が心に残る青春映画の隠れた名作。",
  "kirishima-thing": "「桐島が部活を辞めた」という噂が広がる高校の一日を複数視点で描く。青春の痛みと輝きが細密に切り取られている。",
  "toki-wo-kakeru-shoujo": "時間を跳べる少女が経験する青春と後悔。「未来で待ってる」は今でも最高のアニメの台詞の一つ。",
  // 世界映画
  "cinema-paradiso": "シチリアの映画館と映写技師の愛を描くイタリアの名作。ラストのフィルムの場面は何度観ても涙が溢れる。",
  "farewell-my-concubine": "中国の激動の時代を生き抜く2人の俳優の物語。レスリー・チャンの美しさと悲しさが忘れられない。",
  "pans-labyrinth-2006": "スペイン内戦下で少女が迷い込む暗黒のファンタジー。現実と幻想が交差する美しくも残酷な物語。",
  "portrait-of-a-lady-on-fire": "18世紀フランスで画家と貴族令嬢が燃やした恋。台詞より眼差しで語る映像詩のような作品。",
  "the-lives-of-others": "東ドイツの監視社会で繰り広げられる人間ドラマ。権力と芸術、愛の間で揺れる主人公に引き込まれる。",
  "roma-2018": "1970年代メキシコシティで働く家政婦の一年を描くアルフォンソ・キュアロン作品。白黒映像の美しさに息をのむ。",
  "the-secret-in-their-eyes": "25年越しの未解決事件と叶えられなかった恋を描くアルゼンチン映画。ラストの1カットで全てが変わる衝撃。",
  // アニメ泣ける
  "maquia-2018": "不老不死の種族の少女が人間の赤ちゃんを育てる物語。時間の流れの残酷さと母の愛に号泣必至のアニメ。",
  "wolf-children": "2人の子どもを1人で育てる人間とオオカミのハーフの兄妹を描く。花が子どもたちを見送るラストに泣かない人はいない。",
  "summer-wars": "田舎の大家族とデジタル空間での戦いを描く。おばあちゃんの電話シーンで涙が止まらなくなる。",
  "suzume": "扉を閉める旅に出た少女と椅子になった青年の物語。喪失と再生をテーマにした新海誠の最新傑作。",
  "demon-slayer-mugen-train": "炎柱・煉獄杏寿郎の最後が描かれる。公開当時、全国で嗚咽が聞こえたと言われる号泣必至の劇場版。",
  "totto-chan-2023": "黒柳徹子の幼少期を描いた自伝的アニメ。大人が観ると「子どもの可能性を伸ばすとはどういうことか」を考えさせられる。",
  "kimi-no-na-wa": "時空を超えて繋がる2人の少年少女の物語。「君の名は。」の大ヒットは日本映画史に刻まれる。",
};

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  leadMovieQuery: string;
  movieSlugs: string[];
};

const ARTICLES: Article[] = [
  {
    slug: "ghibli-movies",
    title: "ジブリ映画おすすめ10選｜カップルで観たい名作・泣ける作品を厳選",
    excerpt: "千と千尋の神隠し、ハウルの動く城、火垂るの墓…スタジオジブリの名作10本を厳選。2人で観ると感動が2倍になる理由とあわせて紹介します。",
    body: "スタジオジブリの映画は、子どものころに観た作品も大人になって観ると全く違う感動があります。「なぜあの台詞がこんなに刺さるのか」「あの場面の本当の意味は何か」——大切な人と一緒に観て、語り合ってください。",
    leadMovieQuery: "千と千尋の神隠し",
    movieSlugs: ["spirited-away","howls-moving-castle","my-neighbor-totoro","princess-mononoke","kiki-delivery-service","nausicaa","laputa","grave-of-the-fireflies","wind-rises","whisper-of-the-heart"],
  },
  {
    slug: "music-movies",
    title: "感動の音楽映画おすすめ10選｜カップルで泣けるミュージシャン映画",
    excerpt: "ボヘミアン・ラプソディ、ラ・ラ・ランド、イエスタデイ…音楽が主役の感動映画10本。一緒に観た後、もっと音楽が好きになります。",
    body: "音楽映画には不思議な力があります。映画が終わっても曲が頭から離れず、その歌を聴くたびに映画のあのシーンが蘇る。2人の共通の「曲」を作るのに、音楽映画はこの上ない入り口です。",
    leadMovieQuery: "Bohemian Rhapsody",
    movieSlugs: ["bohemian-rhapsody","a-star-is-born-2018","rocketman-2019","yesterday-2019","la-la-land","once-2007","sing-street-2016","les-choristes-2004","begin-again","mamma-mia"],
  },
  {
    slug: "suspense-couple-movies",
    title: "カップルで見るサスペンス映画おすすめ8選｜ドキドキを共有できる名作",
    excerpt: "ナイブズ・アウト、パラサイト、別れる決心…怖すぎずドキドキできるサスペンス映画8本。謎解きの興奮を2人で共有しよう。",
    body: "「ホラーは怖くて無理だけど、刺激のある映画が観たい」そんなカップルにはサスペンスがぴったり。一緒に謎を考えて、展開を予想して、犯人が明かされた瞬間の興奮を共有する——これがサスペンスの醍醐味です。",
    leadMovieQuery: "Knives Out",
    movieSlugs: ["knives-out-2019","parasite-2019","decision-to-leave-2022","the-secret-in-their-eyes","the-lives-of-others","initiation-love","cold-war-2018","the-wailing-korean"],
  },
  {
    slug: "heartwarming-movies",
    title: "ほっこり心温まる映画おすすめ10選｜疲れた日に2人で観たい感動作",
    excerpt: "ライフ・イズ・ビューティフル、きっとうまくいく、コーラス…疲れた心がほぐれる映画10本。笑って泣いて、明日への活力が湧いてきます。",
    body: "仕事で疲れた日、なんとなく気持ちが沈む日——そんなとき、難解な映画より「観てよかった」と素直に思える映画の方がずっと価値があります。2人で笑って泣いて、心をリセットできる10本を厳選しました。",
    leadMovieQuery: "La vita è bella",
    movieSlugs: ["life-is-beautiful","three-idiots-2009","les-choristes-2004","the-great-passage","swing-kids-2018","our-little-sister","petite-maman-2021","everything-everywhere-all-at-once","shoplifters","broker-2022"],
  },
  {
    slug: "hollywood-classic-romance",
    title: "ハリウッド名作恋愛映画おすすめ10選｜90年代〜2000年代の不朽のラブストーリー",
    excerpt: "プリティ・ウーマン、タイタニック、ノッティングヒルの恋人…時代を超えて愛されるハリウッドの恋愛映画10本。何度観ても色褪せない名シーンが詰まっています。",
    body: "90年代〜2000年代に生まれたハリウッドのロマンス映画は、シンプルに「好きな人と幸せになりたい」という普遍的な願いを描いています。特別なエフェクトも複雑な設定もいらない——ただ2人の感情の動きだけで泣かせる、それが本物の恋愛映画です。",
    leadMovieQuery: "Titanic",
    movieSlugs: ["pretty-woman","titanic","sleepless-in-seattle","youve-got-mail","notting-hill","four-weddings-and-a-funeral","when-harry-met-sally","ghost-1990","the-notebook","serendipity"],
  },
  {
    slug: "youth-movies",
    title: "青春映画おすすめ10選｜切ない・胸キュン・成長を描いた傑作",
    excerpt: "聲の形、ちはやふる、那些年…日本・韓国・台湾の青春映画10本。懐かしくて、少し痛くて、でも温かい——あの頃の自分を思い出す作品ばかりです。",
    body: "青春映画が好きな人は多いですが、その理由はきっと「自分もあんな時間があった」という懐かしさと、「あのとき違う選択をしていたら」という後悔が混じり合うから。大切な人と一緒に観て、お互いの青春時代を語り合うきっかけにしてください。",
    leadMovieQuery: "映画 聲の形",
    movieSlugs: ["koe-no-katachi","chihayafuru","boku-wa-asu-kinou-no-kimi-to-date","you-are-the-apple-of-my-eye","my-20th-century-girl","house-of-hummingbird-2018","blue-gate-crossing","kirishima-thing","toki-wo-kakeru-shoujo","sing-street-2016"],
  },
  {
    slug: "world-classic-movies",
    title: "世界の名作映画おすすめ8選｜カップルで見るべき海外映画の傑作",
    excerpt: "ニュー・シネマ・パラダイス、覇王別姫、善き人のためのソナタ…アジア・欧州・中南米の映画8本。ハリウッド以外の世界映画の奥深さを2人で体験しよう。",
    body: "ハリウッド以外の映画にはまったとき、人は「まだこんなに素晴らしい映画があったのか」という驚きを経験します。イタリア、香港、ドイツ、アルゼンチン、フランス、メキシコ——それぞれの国の感情と美学が凝縮された8本を選びました。",
    leadMovieQuery: "Cinema Paradiso",
    movieSlugs: ["cinema-paradiso","farewell-my-concubine","life-is-beautiful","the-lives-of-others","pans-labyrinth-2006","portrait-of-a-lady-on-fire","the-secret-in-their-eyes","roma-2018"],
  },
  {
    slug: "anime-tearjerker",
    title: "泣けるアニメ映画おすすめ10選｜カップルで号泣できる感動作",
    excerpt: "鬼滅の刃・無限列車編、聲の形、さよならの朝に…泣けるアニメ映画10本。「アニメで泣けるの？」と思っている人こそ観てほしい感動作ばかりです。",
    body: "「アニメだから感動が薄い」は完全に間違いです。むしろアニメだからこそ表現できる感情の振れ幅があり、実写では不可能な映像詩のような美しさがある。2人でティッシュを用意して、思いきり泣いてください。",
    leadMovieQuery: "映画 聲の形",
    movieSlugs: ["demon-slayer-mugen-train","koe-no-katachi","grave-of-the-fireflies","maquia-2018","wolf-children","summer-wars","suzume","totto-chan-2023","kimi-no-na-wa","wind-rises"],
  },
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
  console.log(`\n📝 記事バッチ3 — ${ARTICLES.length}本\n`);
  const { data: movies } = await sb.from("movies").select("id, slug");
  const movieIdBySlug = Object.fromEntries((movies ?? []).map((m) => [m.slug, m.id]));

  let ok = 0;
  for (const a of ARTICLES) {
    const thumbnail_url = await getBackdrop(a.leadMovieQuery);
    const now = new Date().toISOString();

    const { data: article, error } = await sb.from("articles").upsert({
      slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body,
      thumbnail_url, status: "published", published_at: now, updated_at: now,
    }, { onConflict: "slug" }).select("id").single();

    if (error || !article) { console.error(`❌ ${a.slug}: ${error?.message}`); continue; }

    await sb.from("article_movies").delete().eq("article_id", article.id);
    const rows = a.movieSlugs
      .map((slug, i) => ({ article_id: article.id, movie_id: movieIdBySlug[slug], display_order: i + 1, comment: COMMENTS[slug] ?? null }))
      .filter((r) => r.movie_id);

    if (rows.length) await sb.from("article_movies").insert(rows);

    const found = rows.length;
    const missing = a.movieSlugs.filter((s) => !movieIdBySlug[s]);
    console.log(`✅ ${a.slug.padEnd(28)} 映画${found}本${missing.length ? ` (未登録: ${missing.join(",")})` : ""} ${thumbnail_url ? "🖼" : "🚫画像なし"}`);
    ok++;
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\n📊 完了: ${ok}/${ARTICLES.length}本`);
}
main().catch(console.error);
