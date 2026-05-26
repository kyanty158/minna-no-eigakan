"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

export type BrowserMovie = {
  id: string;
  title: string;
  slug: string;
  release_year: number | null;
  country: string | null;
  poster_url: string | null;
  isFlat: boolean;
  genreSlugs: string[];
};

type GenreOption = { slug: string; name: string };
type SortKey = "year-desc" | "year-asc" | "title";

type Props = {
  movies: BrowserMovie[];
  genres: GenreOption[];
  countries: string[];
};

const SORT_LABELS: Record<SortKey, string> = {
  "year-desc": "新しい順",
  "year-asc": "古い順",
  title: "タイトル順",
};

const chipBase: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 14px",
  borderRadius: 20,
  border: "1px solid var(--border)",
  backgroundColor: "var(--bg-card)",
  color: "var(--fg-muted)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const chipActive: React.CSSProperties = {
  ...chipBase,
  backgroundColor: "var(--accent)",
  borderColor: "var(--accent)",
  color: "#fff",
  fontWeight: 600,
};

export default function MoviesBrowser({ movies, genres, countries }: Props) {
  const [genre, setGenre] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [flatOnly, setFlatOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("year-desc");

  const filtered = useMemo(() => {
    let list = movies.filter((m) => {
      if (genre !== "all" && !m.genreSlugs.includes(genre)) return false;
      if (country !== "all" && m.country !== country) return false;
      if (flatOnly && !m.isFlat) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "ja");
      const ay = a.release_year ?? 0, by = b.release_year ?? 0;
      return sort === "year-asc" ? ay - by : by - ay;
    });
    return list;
  }, [movies, genre, country, flatOnly, sort]);

  return (
    <div>
      {/* フィルタバー */}
      <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 8 }}>ジャンル</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button onClick={() => setGenre("all")} style={genre === "all" ? chipActive : chipBase}>すべて</button>
            {genres.map((g) => (
              <button key={g.slug} onClick={() => setGenre(g.slug)} style={genre === g.slug ? chipActive : chipBase}>{g.name}</button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 8 }}>制作国</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button onClick={() => setCountry("all")} style={country === "all" ? chipActive : chipBase}>すべて</button>
            {countries.map((c) => (
              <button key={c} onClick={() => setCountry(c)} style={country === c ? chipActive : chipBase}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, paddingTop: 4 }}>
          <button
            onClick={() => setFlatOnly((v) => !v)}
            style={flatOnly ? chipActive : chipBase}
          >
            {flatOnly ? "✓ " : ""}見放題ありのみ
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>並び替え</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{ fontSize: 13, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--bg-card)", color: "var(--fg)", cursor: "pointer" }}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 16 }}>
        <strong style={{ color: "var(--fg)" }}>{filtered.length}</strong> 作品
      </p>

      {filtered.length > 0 ? (
        <div className="movie-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {filtered.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.slug}`} style={{ display: "block", textDecoration: "none" }}>
              <div style={{ aspectRatio: "2/3", borderRadius: 12, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #2d1f15 0%, #5c3d2a 100%)", marginBottom: 8, border: "1px solid var(--border)" }}>
                {movie.poster_url ? (
                  <Image src={movie.poster_url} alt={movie.title} fill style={{ objectFit: "cover" }} sizes="220px" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 40, opacity: 0.3 }}>🎬</span></div>
                )}
                {movie.isFlat && (
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, backgroundColor: "rgba(31,122,70,0.92)", color: "#fff" }}>見放題あり</span>
                )}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }} className="line-clamp-2">{movie.title}</p>
              <p style={{ fontSize: 11, color: "var(--fg-muted)" }}>{[movie.release_year ? `${movie.release_year}年` : null, movie.country].filter(Boolean).join(" · ")}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--fg-muted)", textAlign: "center", padding: "60px 0" }}>
          条件に一致する作品がありません。フィルタを変更してお試しください。
        </p>
      )}
    </div>
  );
}
