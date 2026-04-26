"use client";

import type { ScanResult } from "./FreshVisionApp";
import {
  X,
  Leaf,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const GRADE_CONFIG: Record<
  ScanResult["grade"],
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    Icon: typeof CheckCircle2;
  }
> = {
  A: {
    label: "Excellent",
    color: "#30d158",
    bg: "rgba(48,209,88,0.14)",
    border: "rgba(48,209,88,0.3)",
    Icon: CheckCircle2,
  },
  B: {
    label: "Good",
    color: "#34c759",
    bg: "rgba(52,199,89,0.14)",
    border: "rgba(52,199,89,0.3)",
    Icon: CheckCircle2,
  },
  C: {
    label: "Fair",
    color: "#ffd60a",
    bg: "rgba(255,214,10,0.14)",
    border: "rgba(255,214,10,0.3)",
    Icon: AlertTriangle,
  },
  D: {
    label: "Poor",
    color: "#ff453a",
    bg: "rgba(255,69,58,0.14)",
    border: "rgba(255,69,58,0.3)",
    Icon: XCircle,
  },
};

type SubmitScreenProps = {
  history: ScanResult[];
  onClose: () => void;
  onScanNew: () => void;
};

export default function SubmitScreen({
  history,
  onClose,
  onScanNew,
}: SubmitScreenProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      {/* Safe area top */}
      <div style={{ height: "env(safe-area-inset-top, 44px)", flexShrink: 0 }} />

      {/* ── HEADER ── */}
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #30d158, #34c759)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>
            Scan History
          </span>
        </div>

        <button
          className="ios-btn"
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Saved banner */}
      {history.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            margin: "14px 16px 0",
            padding: "12px 16px",
            borderRadius: 16,
            background: "rgba(48,209,88,0.1)",
            border: "1px solid rgba(48,209,88,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={18} color="#30d158" />
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#30d158" }}>
              Saved successfully
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
              Your scan has been added to history
            </p>
          </div>
        </div>
      )}

      {/* ── HISTORY LIST ── */}
      <div
        className="ios-scroll"
        style={{ flex: 1, padding: "14px 16px 16px" }}
      >
        {history.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={30} color="rgba(255,255,255,0.2)" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600, fontSize: 16 }}>No scans yet</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                Scan some produce to get started
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              Recent Scans · {history.length}
            </p>

            {history.map((item, i) => {
              const cfg = GRADE_CONFIG[item.grade];
              const GradeIcon = cfg.Icon;
              return (
                <div
                  key={i}
                  className="animate-fade-up"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px",
                    borderRadius: 18,
                    background: "#1c1c1e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    animationDelay: `${i * 0.06}s`,
                    animationFillMode: "both",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Produce"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 200,
                          color: cfg.color,
                        }}
                      >
                        {item.grade}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name || "Unknown"}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.description?.split(".")[0] || "No description"}
                    </p>
                  </div>

                  {/* Grade badge */}
                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: cfg.color,
                        }}
                      >
                        {item.grade}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 9,
                        color: cfg.color,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {cfg.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 20px",
          paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          className="ios-btn"
          onClick={onScanNew}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #30d158, #34c759)",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 4px 24px rgba(48,209,88,0.4)",
          }}
        >
          <Camera size={18} />
          Scan New Produce
        </button>
      </div>
    </div>
  );
}
