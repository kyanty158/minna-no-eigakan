"use client";

type AdSize = "leaderboard" | "rectangle" | "square";

const sizes: Record<AdSize, { width: number; height: number; label: string }> = {
  leaderboard: { width: 728, height: 90, label: "728×90" },
  rectangle:   { width: 300, height: 250, label: "300×250" },
  square:      { width: 300, height: 300, label: "300×300" },
};

type Props = {
  size?: AdSize;
  className?: string;
  style?: React.CSSProperties;
};

// Google AdSense 承認後、ここを実際の adsbygoogle スクリプトに差し替える
// 現在はプレースホルダーを表示
export default function AdBanner({ size = "rectangle", className, style }: Props) {
  const { width, height, label } = sizes[size];

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: width,
        height,
        backgroundColor: "#f0ede8",
        border: "1px dashed #c8c4bc",
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        margin: "0 auto",
        ...style,
      }}
    >
      <span style={{ fontSize: 10, color: "#a09890", letterSpacing: "0.05em" }}>広告</span>
      <span style={{ fontSize: 10, color: "#c0bbb5" }}>{label}</span>
    </div>
  );
}
