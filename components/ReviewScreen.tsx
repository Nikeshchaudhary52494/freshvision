"use client";

import type { ScanResult } from "./FreshVisionApp";
import {
  RotateCcw,
  Share2,
  Save,
  ChevronLeft,
  Leaf,
  CheckCircle2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef } from "react";

const GRADE_CONFIG: Record<
  ScanResult["grade"],
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  A: {
    label: "Excellent",
    color: "#30d158",
    bg: "rgba(48,209,88,0.12)",
    border: "rgba(48,209,88,0.3)",
    glow: "rgba(48,209,88,0.35)",
  },
  B: {
    label: "Good",
    color: "#34c759",
    bg: "rgba(52,199,89,0.12)",
    border: "rgba(52,199,89,0.3)",
    glow: "rgba(52,199,89,0.35)",
  },
  C: {
    label: "Fair",
    color: "#ffd60a",
    bg: "rgba(255,214,10,0.12)",
    border: "rgba(255,214,10,0.3)",
    glow: "rgba(255,214,10,0.35)",
  },
  D: {
    label: "Poor",
    color: "#ff453a",
    bg: "rgba(255,69,58,0.12)",
    border: "rgba(255,69,58,0.3)",
    glow: "rgba(255,69,58,0.35)",
  },
};

type ReviewScreenProps = {
  result: ScanResult;
  onBack: () => void;
  onSave: () => void;
  onShare: () => void;
  onScanAgain: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
};

export default function ReviewScreen({
  result,
  onBack,
  onSave,
  onShare,
  onScanAgain,
  isSoundEnabled,
  toggleSound,
  language,
  setLanguage,
}: ReviewScreenProps) {
  const cfg = GRADE_CONFIG[result.grade];
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (isSoundEnabled && !hasSpoken.current) {
      const speak = () => {
        const name = result.name || "Produce";
        const gradeText = language === "hi" ? "ग्रेड" : "Grade";
        const description = result.description;
        const recommendation = language === "hi" ? `सुझाव: ${result.useCase}` : `Recommendation: ${result.useCase}`;

        let textToSpeak = "";
        if (language === "hi") {
          const hindiGrade = result.grade === "A" ? "उत्कृष्ट" : result.grade === "B" ? "अच्छा" : result.grade === "C" ? "ठीक-ठाक" : "खराब";
          textToSpeak = `${name} की गुणवत्ता ${hindiGrade} है। ${description}। ${recommendation}`;
        } else {
          textToSpeak = `${name}. Grade ${result.grade}. ${description}. ${recommendation}`;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Find a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
          (language === "hi" ? v.lang.includes("hi") : v.lang.includes("en")) && 
          (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Aria") || v.name.includes("Samantha"))
        );

        utterance.voice = femaleVoice || voices[0];
        if (language === "hi" && femaleVoice?.lang.includes("hi")) {
          utterance.lang = "hi-IN";
        }
        utterance.rate = 0.85;
        utterance.pitch = 1.1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        hasSpoken.current = true;
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speak();
      } else {
        window.speechSynthesis.onvoiceschanged = speak;
      }
    }
  }, [isSoundEnabled, result, language]);

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
        <button
          className="ios-btn"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#30d158",
            background: "none",
            border: "none",
            fontWeight: 600,
            fontSize: 16,
            padding: 0,
          }}
        >
          <ChevronLeft size={22} />
          {language === "hi" ? "पीछे" : "Back"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #30d158, #34c759)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.5 }}>
            FreshVision
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Language Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 2,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <button
              onClick={() => setLanguage("en")}
              style={{
                padding: "4px 8px",
                borderRadius: 14,
                fontSize: 11,
                fontWeight: 700,
                background: language === "en" ? "#30d158" : "transparent",
                color: language === "en" ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none",
                transition: "all 0.2s ease",
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              style={{
                padding: "4px 8px",
                borderRadius: 14,
                fontSize: 11,
                fontWeight: 700,
                background: language === "hi" ? "#30d158" : "transparent",
                color: language === "hi" ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none",
                transition: "all 0.2s ease",
              }}
            >
              HI
            </button>
          </div>

          <button
            className="ios-btn"
            onClick={toggleSound}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: isSoundEnabled
                ? "rgba(48,209,88,0.15)"
                : "rgba(255,255,255,0.1)",
              border: isSoundEnabled
                ? "1px solid rgba(48,209,88,0.3)"
                : "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isSoundEnabled ? "#30d158" : "rgba(255,255,255,0.5)",
            }}
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            className="ios-btn"
            onClick={onShare}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "6px 14px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Share2 size={13} />
            {language === "hi" ? "शेयर" : "Share"}
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="ios-scroll" style={{ flex: 1, padding: "0 0 20px" }}>
        {/* Grade hero */}
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 20px 12px",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: cfg.bg,
              border: `2px solid ${cfg.border}`,
              boxShadow: `0 0 40px ${cfg.glow}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 68,
                fontWeight: 200,
                lineHeight: 1,
                color: cfg.color,
                letterSpacing: -4,
              }}
            >
              {result.grade}
            </span>
          </div>
          <p
            style={{
              marginTop: 10,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: -0.5,
            }}
          >
            {result.name || "Unknown Produce"}
          </p>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 20,
              padding: "5px 14px",
            }}
          >
            <CheckCircle2 size={13} color={cfg.color} />
            <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
              {language === "hi" ? cfg.label + " गुणवत्ता" : cfg.label + " Quality"}
            </span>
          </div>
        </div>

        {/* Image + info card */}
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              background: "#1c1c1e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {/* Photo */}
                <div
                  style={{
                    width: "100%",
                    height: 120,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={result.image}
                    alt="Scanned produce"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

            {/* Description */}
            <div style={{ padding: "18px 18px 0" }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                {language === "hi" ? "AI विश्लेषण" : "AI Analysis"}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.6,
                }}
              >
                {result.description || "No description available."}
              </p>
            </div>

            {/* Use case */}
            {result.useCase && (
              <div
                style={{
                  margin: "14px 18px",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                }}
              >
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
                    {language === "hi" ? "सुझाव" : "Recommendation"}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.5,
                  }}
                >
                  {result.useCase}
                </p>
              </div>
            )}

            {/* Action row */}
            <div
              style={{
                display: "flex",
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <button
                className="ios-btn"
                onClick={onScanAgain}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "14px 0",
                  background: "none",
                  border: "none",
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <RotateCcw size={18} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>{language === "hi" ? "फिर से स्कैन" : "Scan Again"}</span>
              </button>
              <button
                className="ios-btn"
                onClick={onShare}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "14px 0",
                  background: "none",
                  border: "none",
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <Share2 size={18} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>{language === "hi" ? "शेयर" : "Share"}</span>
              </button>
              <button
                className="ios-btn"
                onClick={onSave}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "14px 0",
                  background: "none",
                  border: "none",
                  color: "#30d158",
                }}
              >
                <Save size={18} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>{language === "hi" ? "सेव" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
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
        }}
      >
        <button
          className="ios-btn"
          onClick={onSave}
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
          <Save size={18} />
          {language === "hi" ? "हिस्ट्री में सेव करें" : "Save to History"}
        </button>
      </div>
    </div>
  );
}
