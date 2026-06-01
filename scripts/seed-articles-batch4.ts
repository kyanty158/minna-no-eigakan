/**
 * 記事シードバッチ4 — 高収益キーワード5本
 *   npx tsx scripts/seed-articles-batch4.ts
 *   ※ add-movies-batch8.ts の実行後に実行すること
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
  // 泣ける映画
  "shawshank-redemption": "「希望は素晴らしいものだ」——冤罪で投獄された男の19年間の物語。ラストシーンで涙が止まらない、映画史上最高の感動作。",
  "forrest-gump": "「人生はチョコレートの箱のようなもの」——トム・ハンクスが体現する不思議な人生と愛の物語。何度観ても泣ける名作。",
  "coda-2021": "聴こえない家族の中で生まれた唯一の聴こえる娘の夢と家族愛を描く。「Both Sides Now」の歌唱シーンで必ず泣く。アカデミー賞3部門受賞。",
  "life-is-beautiful": "収容所の中で息子を笑顔にし続ける父の愛。笑いと涙が奇跡的に共存する映画史上随一の感動作。",
  "grave-of-the-fireflies": "戦争の中を生きた兄妹の物語。泣くというより胸が痛くなる。日本人として忘れてはいけない一本。",
  "demon-slayer-mugen-train": "煉獄さんの生き様が全てを語る。アニメ映画で泣かない人はいない、国内興行収入No.1の感動作。",
  "a-star-is-born-2018": "レディー・ガガとブラッドリー・クーパーの音楽と愛の物語。「Shallow」が流れるたびに感情が溢れ出す。",
  "past-lives-2023": "24年越しの初恋の再会を描く。余韻が長く残る、静かで美しいラブストーリー。",
  "along-with-the-gods-2017": "死後の裁判を通じて描く親子愛。韓国映画最高の感動作のひとつ。",
  "green-book-2018": "1960年代アメリカを舞台に白人ドライバーと黒人ピアニストの旅。笑いながら泣ける最高の映画。",
  "les-choristes-2004": "問題児ばかりの寮学校に赴任した音楽教師が合唱団を作る感動作。子どもたちの歌声に涙が止まらない。",
  "the-great-passage": "辞書を作ることに一生を捧げる人々の静かな感動。じんわり涙が出てくる、大人の映画。",
  "once-2007": "ダブリンの路上ミュージシャンと移民女性の出会いを描く低予算映画の傑作。「Falling Slowly」が心に刺さる。",
  "8-nen-goshi-no-hanayome": "8年間の闘病と愛を描く実話。「普通の日常」がどれほど大切かを教えてくれる邦画の感動作。",
  "koe-no-katachi": "いじめと贖罪、再生を描く傑作アニメ。見終わった後にもっと人に優しくなれる気がする。",
  "totto-chan-2023": "窓ぎわのトットちゃんの映画化。大人になって観ると子どもの感受性の豊かさに胸を打たれる。",
  "the-farewell-2019": "末期がんの祖母に告げずに集まる家族の物語。文化的な違いを越えた愛の形を描く。オークワフィナの演技が圧倒的。",
  "everything-everywhere-all-at-once": "中年の移民女性がマルチバースで戦う物語。バカバカしさの中に「愛とは何か」という問いが溢れている。",
  "soshite-chichi-ni-naru": "取り違えられた子どもを巡る父親像を問う是枝裕和作品。カンヌ審査員賞受賞。じんわりと心に刺さる感動作。",
  "wind-rises": "零戦設計者の夢と愛を描く宮崎駿の集大成。「生きねば」という言葉の重さを噛みしめてほしい。",
  // U-NEXT特集
  "hanataba-mitaina-koi-wo-shita": "菅田将暉×有村架純のラブストーリー。同棲カップルの日常と別れを丁寧に描く、同世代に刺さる傑作。",
  "kimi-no-na-wa": "全世界で社会現象を起こした新海誠監督の最高傑作。時空を超えた恋の物語は何度観ても胸が震える。",
  "tenki-no-ko": "晴れ女の少女と家出少年の恋と選択を描く新海誠作品。「誰かのために世界を変えることができる」という強いメッセージ。",
  "byousoku-5-centimeter": "遠距離恋愛のもどかしさを描いた新海誠の短編。桜の花びらが5センチで落ちる速度——タイトルの意味を知るたびに切なくなる。",
  "kotonoha-no-niwa": "雨の公園で出会う高校生と大人の女性の恋。46分という短編ながら、新海誠の叙情性が凝縮されている。",
  "drive-my-car": "カンヌ脚本賞受賞の濱口竜介監督作。3時間の長さを感じさせない、演技と言葉の映画。",
  "shoplifters": "是枝裕和監督のカンヌ最高賞作品。血のつながりとは何かを問いかける、じんわりと泣ける傑作。",
  "suzume": "新海誠監督の最新作。日本各地を旅する少女の冒険と成長。シリーズ中最も「泣けた」という声が多い。",
  "ryu-to-sobakasu-no-hime": "仮想空間に歌手として登場する女子高生の物語。美女と野獣へのオマージュを含む新海誠以外の新世代アニメ。",
  "wolf-children": "狼の男と人間の女性の恋から生まれた子どもたちを描く細田守監督作。母の愛が胸に刺さる感動作。",
  "summer-wars": "ネット仮想空間と田舎の大家族を巻き込んだ夏の冒険。細田守監督作の中で最もエンタメ度が高い一本。",
  "howls-moving-castle": "魔法使いハウルと少女ソフィーの恋愛が軸。「あなたを守りたい」という台詞は何度聞いても胸が震える。",
  "princess-mononoke": "自然と人間の共存をテーマにした壮大な叙事詩。強い女性キャラと重厚なテーマが2人の会話を弾ませる。",
  "whisper-of-the-heart": "図書館の本で気になる名前を追いかける少女の淡い恋。カントリーロードの演奏シーンが温かい。",
  "la-la-land": "夢を追うカップルの葛藤と選択を描くミュージカル。「もしも」のラストシーンで感情が溢れる。",
  "marriage-story": "結婚と離婚を通じて愛を描くノア・バームバック監督作。スカーレット・ヨハンソンとアダム・ドライバーの演技が圧倒的。",
  "yomei-10-nen": "余命10年の女性と出会う男性の純愛を描く邦画。松岡茉優×坂口健太郎の演技に涙が溢れる。",
  "parasite-2019": "格差社会の韓国を描くポン・ジュノ監督作。カンヌ・アカデミー賞席巻の衝撃的な展開。見た後に話し合いたくなる。",
  // ハリウッド名作
  "eternal-sunshine": "記憶を消す手術で恋人を消そうとする男の物語。「たとえ失敗しても、あなたに恋したい」——ラストの言葉が忘れられない。",
  "titanic": "タイタニック号の悲劇を背景にした世紀のラブストーリー。ジャックとローズの愛が永遠に語り継がれる。",
  "pretty-woman": "ジュリア・ロバーツとリチャード・ギアによる現代のシンデレラ物語。明るく楽しく泣けるロマコメの王道。",
  "interstellar-2014": "宇宙と時間、父と娘の愛を壮大なスケールで描く。「テッセラクト」のシーンで号泣必至。ノーラン監督の最高傑作。",
  "whiplash-2014": "最高の音楽家を目指す青年と鬼教師の闘い。ラストの演奏シーンは映画史上最高の緊張感。「セッション」の邦題で公開。",
  "leon-1994": "孤独な殺し屋と少女の奇妙な絆。ジャン・レノとナタリー・ポートマンの演技が忘れられない。",
  "jojo-rabbit-2019": "ナチスドイツを生きる少年の成長を描くブラックコメディ。笑いと悲しみが絶妙に交差する唯一無二の映画。",
  "moonlight-2016": "黒人の少年の成長を3章で描くアカデミー賞作品。「愛とは何か」を静かに問い続ける詩のような映画。",
  "lady-bird-2017": "カリフォルニアの17歳少女の成長と母娘の葛藤を描く。誰もが「自分の話だ」と感じる普遍的な青春映画。",
  "moonrise-kingdom-2012": "ウェス・アンダーソン監督。島で出会った12歳同士の初恋と逃避行。可愛くてキュートなラブストーリー。",
  "the-grand-budapest-hotel": "ウェス・アンダーソンの極彩色世界と笑いと感動が詰まった傑作。ホテルのコンシェルジュと若いロビーボーイの友情。",
  "get-out-2017": "ジョーダン・ピール監督のデビュー作。人種差別を独自の視点で描いたスリラー。見た後に絶対に話し合いたくなる。",
  "silver-linings-playbook": "精神的な問題を抱える男女が出会うラブコメ。「普通」とは何かを問いながら笑えて泣ける。",
  "sound-of-metal-2019": "ドラマーが突然聴力を失う物語。「静けさ」が何であるかを問いかける、アカデミー賞受賞の感動作。",
  "the-perks-of-being-a-wallflower": "傷を抱えた高校生たちの友情と恋愛を描く青春映画。「We accept the love we think we deserve」という言葉が刺さる。",
  "the-farewell-2019": "末期がんの祖母に告げずに集まる家族の物語。文化的な違いを越えた愛の形。オークワフィナの演技が圧倒的。",
  "coda-2021": "聴こえない家族の中で生まれた唯一の聴こえる娘の夢と家族愛。「Both Sides Now」の歌唱シーンで必ず泣く。",
  "nomadland-2020": "夫を失い家を失った女性のバンライフを描く。フランシス・マクドーマンドの演技が圧倒的。孤独な美しさに満ちたアカデミー賞作品。",
  // 韓国映画
  "parasite-2019": "格差社会の韓国を描くポン・ジュノ監督作。カンヌ・アカデミー賞席巻の衝撃的な展開。",
  "train-to-busan": "列車内でのゾンビサバイバル。ホラーとしてだけでなく、父と娘の絆の感動作として超おすすめ。",
  "decision-to-leave-2022": "刑事と容疑者の女性の心理戦と愛を絡めたパク・チャヌク監督作。美しい映像と複雑な感情が絡み合う大人のサスペンス。",
  "past-lives-2023": "幼馴染が24年後に再会するラブストーリー。静かな余韻が心に残る、近年最高の恋愛映画。",
  "kim-ji-young": "1982年生まれのキム・ジヨンが経験してきた女性差別を描く。韓国でも日本でも大きな話題を呼んだ社会派感動作。",
  "broker-2022": "是枝裕和監督×韓国キャストで描く赤ちゃんポストをめぐる人間ドラマ。笑いと涙が共存する温かい映画。",
  "along-with-the-gods-2017": "死後の裁判を通じて描く親子愛の物語。韓国映画最高の感動作のひとつ。",
  "my-sassy-girl": "クールビューティな「猟奇的な彼女」との恋愛コメディ。韓国ラブコメの原点にして最高傑作。",
  "a-moment-to-remember": "記憶を失っていく女性と夫の純愛。韓国映画で一番泣けるという声も多い感動作。",
  "tune-in-for-love": "同じラジオ番組を聴きながらすれ違い続けた男女の恋愛。チョン・ヘインのデビュー作で切ない展開が待つ。",
  "my-20th-century-girl": "ネット以前の1999年、20歳になる前の青春を描く。セットやファッションも含め全てが愛おしい韓国映画。",
  "swing-kids-2018": "朝鮮戦争下の捕虜収容所でタップダンスを踊る若者たちの物語。笑いと感動と哀しみが同居する傑作。",
  "house-of-hummingbird-2018": "1994年の韓国・ソウルで生きる14歳少女の日常を繊細に描く。カメラが近すぎて息が詰まりそうになる傑作。",
  "birthday-2019-korean": "セウォル号事故で子どもを失った家族の物語。涙なしには観られないが、希望を忘れない強さがある。",
  "little-forest-korea": "都会から田舎に戻った若い女性の四季を描く。料理と自然の美しさに癒され、人生の選択を考えさせてくれる。",
  // 邦画泣ける
  "hanataba-mitaina-koi-wo-shita": "菅田将暉×有村架純。同棲4年の別れを描く。「この映画を観ると恋人と話したくなる」という感想が絶えない。",
  "yomei-10-nen": "余命10年を宣告された女性の純愛。小松菜奈と坂口健太郎の演技に涙が止まらない。",
  "koe-no-katachi": "いじめと贖罪を繊細に描くアニメ映画。見終わった後に誰かに優しくしたくなる。",
  "8-nen-goshi-no-hanayome": "8年間の闘病を経た結婚。実話ベースの純愛は「普通の日常がどれほど尊いか」を教えてくれる。",
  "soshite-chichi-ni-naru": "産院での子どもの取り違えを通じて父親像を問う是枝裕和作品。じんわりと心に刺さる感動作。",
  "drive-my-car": "妻を失った舞台俳優と若い女性ドライバーの対話。カンヌ脚本賞受賞の静かな傑作。",
  "shoplifters": "血のつながりのない擬似家族の絆を描く是枝裕和監督作。カンヌ最高賞受賞。",
  "monster-2023": "是枝裕和監督作。学校を舞台に「怪物」は誰かを問いかける。坂元裕二脚本の傑作。",
  "ryuurou-no-tsuki": "社会から疎外された男女の純粋な繋がりを描く。李相日監督×松坂桃李×広瀬すずの力強い映画。",
  "aru-otoko-2022": "ある男の正体をめぐる人間ドラマ。石川慶監督。妻夫木聡の演技が見事。",
  "asausa-kid": "ビートたけしが師・深見千三郎を演じる感動の師弟物語。Netflix制作で高い評価を得た感動作。",
  "mamorarenakatta": "震災と福祉制度の狭間で「護られなかった命」を問う。阿部寛・松坂桃李の演技が心を揺さぶる。",
  "totto-chan-2023": "窓ぎわのトットちゃんの映画化。大人になって観ると子どもの感受性の豊かさに胸を打たれる。",
  "52-hertz-whale": "虐待を受けた子どもを助けようとする女性の物語。タイトルの意味を理解した瞬間、涙が溢れる。",
  "the-great-passage": "辞書作りに命を燃やす人々の静かな感動。松田龍平×宮崎あおいの純粋な愛も美しい。",
  "konya-sekai-kara-kono-koi-ga-kiete-mo": "記憶障害の少女と彼女に恋する男子高生の純愛。道枝駿佑×福本莉子の演技に心が揺れる。",
  "ito-2020": "「糸」の歌詞が映像になった物語。コロナ前の日本を舞台に、縁と縁が繋がっていく感動のラブストーリー。",
  "sekai-no-chuushin-de-ai-wo-sakebu": "余命わずかな彼女との高校時代の記憶を辿る純愛映画。「セカチュー」として社会現象を起こした名作。",
  "nada-sou-sou": "沖縄を舞台にした兄妹の絆と純愛の物語。「涙そうそう」の歌声とともに心が溶ける。",
  "shigatsu-wa-kimi-no-uso": "ピアノを弾けなくなった少年とヴァイオリン少女の出会いと別れ。演奏シーンの美しさと感動のラストに涙。",
};

const ARTICLES = [
  {
    slug: "naki-eru-eiga",
    title: "絶対に泣ける映画おすすめ20選｜号泣確定の感動名作まとめ",
    excerpt: "ショーシャンクの空に、フォレスト・ガンプ、コーダ…一人でも、カップルでも、思いきり泣きたい夜に観たい感動映画20選。VOD配信情報つき。",
    body: "「泣きたいのに泣けない」夜がある。そんなときに「泣くための映画」を1本用意しておくと、感情の詰まりがすっきりします。涙は心のデトックスです。ここでは「見終わったあとに清々しくなれる」感動作を厳選しました。VODの無料トライアルを使えば今夜から全部観られます。",
    leadMovieQuery: "The Shawshank Redemption",
    movieSlugs: ["shawshank-redemption","forrest-gump","coda-2021","life-is-beautiful","grave-of-the-fireflies","demon-slayer-mugen-train","a-star-is-born-2018","past-lives-2023","along-with-the-gods-2017","green-book-2018","les-choristes-2004","the-great-passage","once-2007","8-nen-goshi-no-hanayome","koe-no-katachi","totto-chan-2023","the-farewell-2019","everything-everywhere-all-at-once","soshite-chichi-ni-naru","wind-rises"],
  },
  {
    slug: "unext-recommended-movies",
    title: "U-NEXTで今すぐ見れるおすすめ映画20選【2026年最新】",
    excerpt: "U-NEXTの見放題作品の中から、恋愛・感動・アニメ・邦画のジャンル別に厳選した20本を紹介。31日間の無料トライアルで全部タダで観られます。",
    body: "U-NEXTは見放題40万本以上という国内最大規模のVODサービスです。邦画・洋画・アニメ・韓国ドラマまで幅広いジャンルをカバーし、最新映画の配信も早い。ここでは当サイト掲載作品の中でU-NEXTで見放題のものを厳選して紹介します。31日間の無料トライアルで今すぐ全作品を試せます。",
    leadMovieQuery: "花束みたいな恋をした",
    movieSlugs: ["hanataba-mitaina-koi-wo-shita","kimi-no-na-wa","tenki-no-ko","byousoku-5-centimeter","kotonoha-no-niwa","drive-my-car","shoplifters","suzume","ryu-to-sobakasu-no-hime","koe-no-katachi","wolf-children","summer-wars","howls-moving-castle","princess-mononoke","whisper-of-the-heart","la-la-land","marriage-story","past-lives-2023","parasite-2019","yomei-10-nen"],
  },
  {
    slug: "hollywood-masterpiece-movies",
    title: "ハリウッド名作映画おすすめ20選｜ショーシャンク・フォレストガンプほか傑作まとめ",
    excerpt: "ショーシャンクの空に、フォレスト・ガンプ、インターステラー…誰もが一度は観るべきハリウッド名作映画20本。VOD配信情報と見どころを紹介。",
    body: "「映画を観るなら外れは引きたくない」——そんな人に最初に観てほしいハリウッド映画の名作を20本まとめました。ランキングサイトの上位常連、口コミで語り継がれてきた本当の傑作たちです。どれを観ても「観てよかった」と言える自信があります。",
    leadMovieQuery: "The Shawshank Redemption",
    movieSlugs: ["shawshank-redemption","forrest-gump","interstellar-2014","la-la-land","eternal-sunshine","titanic","pretty-woman","whiplash-2014","green-book-2018","jojo-rabbit-2019","moonlight-2016","lady-bird-2017","moonrise-kingdom-2012","everything-everywhere-all-at-once","silver-linings-playbook","the-grand-budapest-hotel","get-out-2017","the-farewell-2019","coda-2021","sound-of-metal-2019"],
  },
  {
    slug: "korean-movie-ranking",
    title: "韓国映画おすすめランキング15選【VOD配信情報つき】",
    excerpt: "パラサイト、列車に乗った少女…U-NEXTやHuluで今すぐ見れる韓国映画の傑作15選。ジャンル別に徹底紹介。",
    body: "K-POPだけじゃない。映画でも韓国は今、世界最高水準の作品を次々と生み出しています。パラサイトのアカデミー賞受賞以来、韓国映画への注目が急上昇。この記事では「韓国映画を観てみたいけど何から観ればいい？」という方に向けて、必見の15作品を紹介します。",
    leadMovieQuery: "パラサイト 半地下の家族",
    movieSlugs: ["parasite-2019","train-to-busan","decision-to-leave-2022","past-lives-2023","kim-ji-young","broker-2022","along-with-the-gods-2017","my-sassy-girl","a-moment-to-remember","tune-in-for-love","my-20th-century-girl","swing-kids-2018","house-of-hummingbird-2018","birthday-2019-korean","little-forest-korea"],
  },
  {
    slug: "japanese-tearjerker-movies",
    title: "泣ける邦画おすすめ20選【感動の国内名作まとめ・VOD配信情報つき】",
    excerpt: "花束みたいな恋をした、余命10年、声の形…ひとりで泣いても、恋人と泣いてもいい。感動必至の邦画20選とVOD配信情報を紹介。",
    body: "日本映画には日本人だからこそ心に刺さる感情表現があります。派手な演出がなくても、日常の中に潜む「愛おしさ」「切なさ」「後悔」を丁寧に描いた作品に、私たちは何度でも涙を流します。今日はそんな泣ける邦画の名作を20本集めました。",
    leadMovieQuery: "花束みたいな恋をした",
    movieSlugs: ["hanataba-mitaina-koi-wo-shita","yomei-10-nen","koe-no-katachi","8-nen-goshi-no-hanayome","soshite-chichi-ni-naru","drive-my-car","shoplifters","monster-2023","ryuurou-no-tsuki","aru-otoko-2022","asausa-kid","mamorarenakatta","totto-chan-2023","52-hertz-whale","the-great-passage","konya-sekai-kara-kono-koi-ga-kiete-mo","ito-2020","sekai-no-chuushin-de-ai-wo-sakebu","nada-sou-sou","shigatsu-wa-kimi-no-uso"],
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
  console.log(`\n📝 記事バッチ4 — ${ARTICLES.length}本\n`);
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
    console.log(`✅ ${a.slug.padEnd(32)} thumbnail=${thumbnail_url ? "✓" : "✗"} movies=${rows.length}`);
    ok++;
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\n📊 記事 ${ok}本完了`);
}
main().catch(console.error);
