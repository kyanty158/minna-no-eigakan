-- 映画メモ DB スキーマ

-- genres (ジャンル)
create table if not exists genres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- scenes (見るシーン)
create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- movies (作品)
create table if not exists movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  original_title text,
  release_year int,
  description text,
  summary text,
  runtime_minutes int,
  country text,
  age_rating text,
  poster_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- movie_genres (作品とジャンルの紐付け)
create table if not exists movie_genres (
  movie_id uuid not null references movies(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  primary key (movie_id, genre_id)
);

-- movie_scenes (作品とシーンの紐付け)
create table if not exists movie_scenes (
  movie_id uuid not null references movies(id) on delete cascade,
  scene_id uuid not null references scenes(id) on delete cascade,
  primary key (movie_id, scene_id)
);

-- vod_services (VODサービス)
create table if not exists vod_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  monthly_price int,
  free_trial_text text,
  official_url text not null,
  affiliate_url text,
  logo_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- movie_availability (作品の配信状況)
create table if not exists movie_availability (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references movies(id) on delete cascade,
  vod_service_id uuid not null references vod_services(id) on delete cascade,
  availability_type text not null check (availability_type in ('見放題', 'レンタル', '購入', '配信なし', '不明')),
  is_available boolean not null default false,
  note text,
  checked_at timestamptz,
  unique (movie_id, vod_service_id)
);

-- articles (記事)
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  article_type text,
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

-- article_movies (記事と作品の紐付け)
create table if not exists article_movies (
  article_id uuid not null references articles(id) on delete cascade,
  movie_id uuid not null references movies(id) on delete cascade,
  display_order int not null default 0,
  comment text,
  primary key (article_id, movie_id)
);

-- affiliate_links (アフィリエイトリンク管理)
create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  vod_service_id uuid not null references vod_services(id) on delete cascade,
  asp_name text,
  campaign_name text,
  url text not null,
  is_active boolean not null default true,
  reward_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at を自動更新するトリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger movies_updated_at before update on movies
  for each row execute function update_updated_at();

create trigger vod_services_updated_at before update on vod_services
  for each row execute function update_updated_at();

create trigger articles_updated_at before update on articles
  for each row execute function update_updated_at();

create trigger affiliate_links_updated_at before update on affiliate_links
  for each row execute function update_updated_at();

-- インデックス
create index if not exists movies_slug_idx on movies(slug);
create index if not exists articles_slug_idx on articles(slug);
create index if not exists articles_status_idx on articles(status);
create index if not exists vod_services_slug_idx on vod_services(slug);
create index if not exists movie_availability_movie_id_idx on movie_availability(movie_id);
