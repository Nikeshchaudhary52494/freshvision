"use client";

import { useState, useCallback } from "react";
import InspectScreen from "./InspectScreen";
import ReviewScreen from "./ReviewScreen";
import SubmitScreen from "./SubmitScreen";

export type ScanResult = {
  name: string | null;
  grade: "A" | "B" | "C" | "D";
  description: string;
  useCase: string;
  image?: string;
};

type Step = "inspect" | "review" | "submit";

export default function FreshVisionApp() {
  const [step, setStep] = useState<Step>("inspect");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [history, setHistory] = useState<ScanResult[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedSound = localStorage.getItem("soundEnabled");
      if (savedSound !== null) setIsSoundEnabled(savedSound === "true");

      const savedLang = localStorage.getItem("language");
      if (savedLang === "hi" || savedLang === "en") setLanguage(savedLang as "en" | "hi");

      return JSON.parse(localStorage.getItem("history") || "[]");
    } catch {
      return [];
    }
  });

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("soundEnabled", String(next));
      return next;
    });
  }, []);

  const changeLanguage = useCallback((lang: "en" | "hi") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, []);

  const handleResult = useCallback((res: ScanResult) => {
    setResult(res);
    setStep("review");
  }, []);

  const handleSave = useCallback(() => {
    if (!result) return;
    const updated = [result, ...history].slice(0, 10);
    setHistory(updated);
    try {
      localStorage.setItem("history", JSON.stringify(updated));
    } catch {}
    setStep("submit");
  }, [result, history]);

  const handleScanAgain = useCallback(() => {
    setResult(null);
    setStep("inspect");
  }, []);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `🍃 FreshVision Report\n\nProduce: ${result.name || "Unknown"}\nGrade: ${result.grade}\n\n${result.description}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "FreshVision Report", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Report copied to clipboard!");
    }
  }, [result]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        overflow: "hidden",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      {step === "inspect" && (
        <InspectScreen
          onResult={handleResult}
          onViewHistory={() => setStep("submit")}
          isSoundEnabled={isSoundEnabled}
          toggleSound={toggleSound}
          language={language}
          setLanguage={changeLanguage}
        />
      )}
      {step === "review" && result && (
        <ReviewScreen
          result={result}
          onBack={handleScanAgain}
          onSave={handleSave}
          onShare={handleShare}
          onScanAgain={handleScanAgain}
          isSoundEnabled={isSoundEnabled}
          toggleSound={toggleSound}
          language={language}
          setLanguage={changeLanguage}
        />
      )}
      {step === "submit" && (
        <SubmitScreen
          history={history}
          onClose={() => setStep("inspect")}
          onScanNew={() => setStep("inspect")}
        />
      )}
    </div>
  );
}
