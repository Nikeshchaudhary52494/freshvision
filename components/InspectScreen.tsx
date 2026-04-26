"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Upload,
  ImagePlus,
  Leaf,
  ClockIcon,
  Loader2,
  X,
  Zap,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";

type InspectMode = "camera" | "upload";

export default function InspectScreen({
  onResult,
  onViewHistory,
  isSoundEnabled,
  toggleSound,
  language,
  setLanguage,
}: {
  onResult: (res: any) => void;
  onViewHistory: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  const startCamera = useCallback(async () => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraError(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      setCameraError(true);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const image = canvasRef.current.toDataURL("image/jpeg", 0.9);
    setPreviewImage(image);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const image = ev.target?.result as string;
      setPreviewImage(image);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const analyzeImage = async (image: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      onResult({ ...data, image });
    } catch (err) {
      console.error("Analysis failed:", err);
      // Show a fallback for demo
      onResult({
        name: "Unknown",
        grade: "C",
        description: "Could not analyze image. Please try again.",
        useCase: "Ensure good lighting and center the produce in frame.",
        image,
      });
    } finally {
      setIsAnalyzing(false);
      setPreviewImage(null);
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

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
      {/* ── STATUS BAR AREA ── */}
      <div style={{ height: "env(safe-area-inset-top, 44px)" }} />

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
            onClick={onViewHistory}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "6px 14px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <ClockIcon size={13} />
            {language === "hi" ? "हिस्ट्री" : "History"}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <>
          {/* Live camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Camera not ready overlay */}
          {!cameraReady && !cameraError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#111",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <Loader2 size={32} color="#30d158" className="animate-spin" />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                Starting camera…
              </p>
            </div>
          )}

          {/* Camera error state */}
          {cameraError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#111",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                padding: 32,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(255,69,58,0.15)",
                  border: "1px solid rgba(255,69,58,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={28} color="#ff453a" />
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Camera Access Denied
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Please allow camera access in your browser settings to use the
                inspector.
              </p>
            </div>
          )}

          {/* Scanning overlay */}
          {cameraReady && !isAnalyzing && !previewImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
              }}
            >
              {/* Hint text */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 20,
                  padding: "7px 16px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                }}
              >
                {language === "hi"
                  ? "उत्पाद को बीच में रखें"
                  : "Center produce in the frame"}
              </div>

              {/* Corner guides */}
              {[
                {
                  top: "50%",
                  left: "50%",
                  mt: -100,
                  ml: -80,
                  bt: 2,
                  bl: 2,
                  bb: 0,
                  br: 0,
                  r: "tl",
                },
                {
                  top: "50%",
                  left: "50%",
                  mt: -100,
                  ml: 44,
                  bt: 2,
                  bl: 0,
                  bb: 0,
                  br: 2,
                  r: "tr",
                },
                {
                  top: "50%",
                  left: "50%",
                  mt: 60,
                  ml: -80,
                  bt: 0,
                  bl: 2,
                  bb: 2,
                  br: 0,
                  r: "bl",
                },
                {
                  top: "50%",
                  left: "50%",
                  mt: 60,
                  ml: 44,
                  bt: 0,
                  bl: 0,
                  bb: 2,
                  br: 2,
                  r: "br",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: c.top,
                    left: c.left,
                    marginTop: c.mt,
                    marginLeft: c.ml,
                    width: 36,
                    height: 36,
                    borderTop: c.bt
                      ? `${c.bt}px solid rgba(48,209,88,0.9)`
                      : "none",
                    borderLeft: c.bl
                      ? `${c.bl}px solid rgba(48,209,88,0.9)`
                      : "none",
                    borderBottom: c.bb
                      ? `${c.bb}px solid rgba(48,209,88,0.9)`
                      : "none",
                    borderRight: c.br
                      ? `${c.br}px solid rgba(48,209,88,0.9)`
                      : "none",
                    borderRadius:
                      c.r === "tl"
                        ? "4px 0 0 0"
                        : c.r === "tr"
                          ? "0 4px 0 0"
                          : c.r === "bl"
                            ? "0 0 0 4px"
                            : "0 0 4px 0",
                  }}
                />
              ))}

              {/* Center dot */}
              <div
                className="animate-pulse-ring"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#30d158",
                  boxShadow: "0 0 12px #30d158, 0 0 24px rgba(48,209,88,0.5)",
                }}
              />
            </div>
          )}

          {/* Uploaded Preview Overlay */}
          {previewImage && (
            <div
              className="animate-fade-in"
              style={{
                position: "absolute",
                inset: 0,
                background: "#000",
                display: "flex",
                flexDirection: "column",
                zIndex: 40,
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#111",
                }}
              >
                <img
                  src={previewImage}
                  alt="Selected"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "24px 20px",
                  paddingBottom: "calc(24px + env(safe-area-inset-bottom, 16px))",
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {/* Retake Button */}
                  <button
                    className="ios-btn"
                    onClick={() => setPreviewImage(null)}
                    style={{
                      flex: "1 1 150px",
                      padding: "16px",
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <RefreshCw size={18} />
                    {language === "hi" ? "फिर से लें" : "Retake"}
                  </button>

                  {/* Analyze Button */}
                  <button
                    className="ios-btn"
                    onClick={() => analyzeImage(previewImage)}
                    disabled={isAnalyzing}
                    style={{
                      flex: "2 1 220px",
                      padding: "16px",
                      borderRadius: 18,
                      background: isAnalyzing
                        ? "rgba(48,209,88,0.3)"
                        : "linear-gradient(135deg, #30d158, #34c759)",
                      border: "none",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: "0 4px 24px rgba(48,209,88,0.35)",
                    }}
                  >
                    {isAnalyzing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Zap size={18} />
                    )}
                    {language === "hi" ? "विश्लेषण करें" : "Analyze"}
                  </button>
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 12,
                  }}
                >
                  {language === "hi"
                    ? "फोटो चयन की पुष्टि करें"
                    : "Confirming your photo selection"}
                </p>
              </div>
            </div>
          )}
        </>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div
        style={{
          flexShrink: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 24px",
          paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Flip camera */}
          <button
            className="ios-btn"
            onClick={flipCamera}
            disabled={!cameraReady || !!previewImage}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                cameraReady && !previewImage ? "#fff" : "rgba(255,255,255,0.3)",
            }}
          >
            <RefreshCw size={18} />
          </button>

          {/* Shutter button */}
          <button
            className="ios-btn"
            onClick={captureFromCamera}
            disabled={!cameraReady || isAnalyzing || !!previewImage}
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background:
                !cameraReady || isAnalyzing || !!previewImage
                  ? "rgba(48,209,88,0.3)"
                  : "linear-gradient(135deg, #30d158, #28b84e)",
              border: "3px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                cameraReady && !isAnalyzing && !previewImage
                  ? "0 0 0 6px rgba(48,209,88,0.15), 0 8px 32px rgba(48,209,88,0.4)"
                  : "none",
              transition: "all 0.2s ease",
            }}
          >
            <Zap size={28} color="#fff" />
          </button>

          {/* Upload shortcut */}
          <button
            className="ios-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isAnalyzing ? "rgba(255,255,255,0.3)" : "#fff",
            }}
          >
            <Upload size={18} />
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            marginTop: 10,
            letterSpacing: "0.04em",
          }}
        >
          {language === "hi"
            ? "स्कैन करने के लिए शटर दबाएं · गैलरी से चुनने के लिए अपलोड आइकन दबाएं"
            : "Tap shutter to analyze · Tap upload icon to pick from gallery"}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
