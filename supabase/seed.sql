-- 映画メモ 初期データ

-- ジャンル
insert into genres (name, slug) values
  ('恋愛', 'romance'),
  ('青春', 'youth'),
  ('アニメ', 'anime'),
  ('韓国ドラマ', 'korean-drama'),
  ('ホラー', 'horror'),
  ('コメディ', 'comedy'),
  ('泣ける', 'tearjerker'),
  ('サスペンス', 'suspense')
on conflict (slug) do nothing;

-- シーン
insert into scenes (name, slug) values
  ('カップルで見る', 'couple'),
  ('おうちデート', 'home-date'),
  ('雨の日に見る', 'rainy-day'),
  ('付き合う前に見る', 'before-dating'),
  ('記念日に見る', 'anniversary'),
  ('失恋した日に見る', 'after-breakup'),
  ('気まずくない', 'not-awkward'),
  ('一人で泣きたい夜', 'cry-alone'),
  ('遠距離恋愛中', 'long-distance'),
  ('胸キュン', 'heartwarming')
on conflict (slug) do nothing;

-- VODサービス
insert into vod_services (name, slug, monthly_price, free_trial_text, official_url, description) values
  ('U-NEXT', 'unext', 2189, '31日間無料', 'https://video.unext.jp', '国内最大級の作品数。映画・ドラマ・アニメが充実。'),
  ('DMM TV', 'dmm-tv', 550, '30日間無料', 'https://tv.dmm.com', 'コスパ最強。アニメ・成人向けも豊富。'),
  ('Hulu', 'hulu', 1026, '2週間無料', 'https://www.hulu.jp', '海外ドラマ・日本テレビ作品に強い。'),
  ('Lemino', 'lemino', 990, '初月無料', 'https://lemino.docomo.ne.jp', 'ドコモ系。映画・ドラマ・スポーツが見られる。'),
  ('ABEMAプレミアム', 'abema', 960, '2週間無料', 'https://abema.tv', '韓ドラ・恋愛リアリティ・アニメに強い。'),
  ('Amazon Prime Video', 'amazon-prime', 600, '30日間無料', 'https://www.amazon.co.jp/primevideo', 'Primeに含まれる。幅広いジャンルをカバー。')
on conflict (slug) do nothing;

-- サンプル作品
insert into movies (title, slug, original_title, release_year, description, summary, runtime_minutes, country, age_rating) values
  (
    '花束みたいな恋をした',
    'hanataba-mitaina-koi-wo-shita',
    null,
    2021,
    '渋谷で偶然出会った山音麦と八谷絹。共通の趣味を持つ二人は瞬く間に恋に落ち、同棲を始める。しかし、社会に出ることで二人の関係は少しずつ変化していく。',
    'サブカルチャーをこよなく愛する男女の5年間の恋愛を描いたラブストーリー。',
    124,
    '日本',
    'G'
  ),
  (
    '余命10年',
    'yomei-10-nen',
    null,
    2022,
    '不治の病により余命10年を宣告された20歳の茉莉。彼女は恋愛することを諦めていたが、幼馴染の和人と再会し、恋に落ちてしまう。',
    '余命わずかな女性と彼女を想い続ける男性の純愛を描いた涙の恋愛映画。',
    124,
    '日本',
    'G'
  ),
  (
    '君の膵臓をたべたい',
    'kimi-no-suizou-wo-tabetai',
    null,
    2017,
    '内向的な高校生の僕が、偶然クラスメイト・山内桜良の「共病文庫」を読んでしまう。彼女が膵臓の病で余命わずかだと知った僕は、彼女と秘密を共有することに。',
    'ベストセラー小説の実写化。余命わずかな少女と無気力な少年の特別な関係を描く。',
    108,
    '日本',
    'G'
  ),
  (
    'ラ・ラ・ランド',
    'la-la-land',
    'La La Land',
    2016,
    'ハリウッドで女優を夢見るミアと、ジャズバーの経営を夢見るセブ。夢を追う二人は恋に落ちるが、それぞれの夢が二人の関係を試していく。',
    'アカデミー賞6冠。夢と恋の間で揺れる男女の切ないラブストーリー。',
    128,
    'アメリカ',
    'G'
  ),
  (
    '愛の不時着',
    'crash-landing-on-you',
    '사랑의 불시착',
    2019,
    '韓国の財閥令嬢ユン・セリが、パラグライダーの事故で北朝鮮に不時着。北朝鮮の将校リ・ジョンヒョクに助けられ、ともに韓国への帰還を目指す。',
    '韓国と北朝鮮の男女の禁断の恋を描いた超人気ロマンスドラマ。全16話。',
    null,
    '韓国',
    'G'
  )
on conflict (slug) do nothing;
