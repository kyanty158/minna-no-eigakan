"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialValue?: string;
  placeholder?: string;
  variant?: "header" | "hero";
  autoFocus?: boolean;
};

export default function SearchBox({
  initialValue = "",
  placeholder = "作品名で探す",
  variant = "header",
  autoFocus = false,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  if (variant === "hero") {
    return (
      <form
        onSubmit={submit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "var(--bg-card)",
          border: "1.5px solid var(--border)",
          borderRadius: 40,
          padding: "6px 6px 6px 18px",
          marginBottom: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          maxWidth: 420,
        }}
      >
        <span style={{ fontSize: 16, color: "var(--fg-muted)" }}>🔍</span>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 15,
            backgroundColor: "transparent",
            color: "var(--fg)",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 30,
            padding: "9px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          検索
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "0 6px 0 10px",
        height: 36,
      }}
    >
      <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: 140,
          border: "none",
          outline: "none",
          fontSize: 13,
          backgroundColor: "transparent",
          color: "var(--fg)",
        }}
      />
    </form>
  );
}
