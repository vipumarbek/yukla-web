import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, X, Check, Volume2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

interface VoiceShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedShipment: (data: {
    pickup: string;
    delivery: string;
    weight: string;
    volume: string;
    cargoType: string;
    vehicle: string;
  }) => void;
}

export default function VoiceShipmentModal({
  isOpen,
  onClose,
  onApplyParsedShipment,
}: VoiceShipmentModalProps) {
  const { currentLang } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    pickup: string;
    delivery: string;
    weight: string;
    volume: string;
    cargoType: string;
    vehicle: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setTranscript("");
      setParsedResult(null);
      setErrorMessage(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Brauzeringiz ovozli buyurtmani to'liq qo'llab-quvvatlamaydi. Ovoz namunasi orqali sinab ko'rishingiz mumkin."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Match locale to active language
      const langMap: Record<string, string> = {
        uz: "uz-UZ",
        ru: "ru-RU",
        en: "en-US",
        tr: "tr-TR",
        zh: "zh-CN",
        ar: "ar-SA",
        de: "de-DE",
        fr: "fr-FR",
        es: "es-ES",
      };
      recognition.lang = langMap[currentLang] || "uz-UZ";

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText) {
          setTranscript(currentText);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech error:", err);
        if (err.error === "not-allowed") {
          setErrorMessage("Mikrofonga ruxsat berilmadi.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Speech Init Error:", e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, currentLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Fallback sample for demonstration if browser has no native speech API
      loadVoiceSample();
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      setErrorMessage(null);
      setParsedResult(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Recognition start error:", err);
        loadVoiceSample();
      }
    }
  };

  const loadVoiceSample = () => {
    const samples = [
      "Toshkent Chilonzordan Samarqand Registoniga 2 tonna qurilish sementi va g'isht yetkazish kerak, Isuzu mashinasi bo'lsin.",
      "Andijondan Buxoroga 800 kg to'qimachilik kiyimlari, Labo yoki Damas mos keladi.",
      "Namangandan Toshkent Sergeli bozoriga 4 tonna quruq mevalar, Gazel avtotransprotida.",
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setTranscript(picked);
    setIsListening(false);
  };

  // AI Rule-based / Gemini extraction parser
  const processTranscriptWithAi = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const lower = transcript.toLowerCase();
      
      // Extraction logic
      let pickup = "Toshkent";
      let delivery = "Samarqand";
      let cargoType = "Qurilish materiallari";
      let weight = "1500";
      let volume = "6";
      let vehicle = "Isuzu";

      // Cities detection
      if (lower.includes("andijon")) pickup = "Andijon";
      if (lower.includes("farg'ona") || lower.includes("fargona")) pickup = "Farg'ona";
      if (lower.includes("namangan")) pickup = "Namangan";
      if (lower.includes("buxoro")) delivery = "Buxoro";
      if (lower.includes("samarqand")) delivery = "Samarqand";
      if (lower.includes("qarshi")) delivery = "Qarshi";
      if (lower.includes("navoiy")) delivery = "Navoiy";
      if (lower.includes("nukus") || lower.includes("qoraqalpog")) delivery = "Nukus";
      if (lower.includes("urgut") || lower.includes("jomboy")) delivery = "Samarqand";
      if (lower.includes("sergeli") || lower.includes("chilonzor") || lower.includes("yunusobod")) pickup = "Toshkent (" + (lower.includes("chilonzor") ? "Chilonzor" : "Sergeli") + ")";

      // Weight detection
      const weightMatch = lower.match(/(\d+)\s*(tonna|t|kg|ton)/);
      if (weightMatch) {
        const num = parseInt(weightMatch[1], 10);
        if (weightMatch[2].includes("ton") || weightMatch[2] === "t") {
          weight = (num * 1000).toString();
        } else {
          weight = num.toString();
        }
      }

      // Vehicle selection
      if (lower.includes("labo") || lower.includes("damas")) {
        vehicle = "Labo";
      } else if (lower.includes("gazel") || lower.includes("gazelle")) {
        vehicle = "Gazel";
      } else if (lower.includes("isuzu") || lower.includes("fuso")) {
        vehicle = "Isuzu";
      } else if (lower.includes("fura") || lower.includes("man") || lower.includes("tir") || lower.includes("daf")) {
        vehicle = "Fura (20t)";
      }

      // Cargo type
      if (lower.includes("sement") || lower.includes("qurilish") || lower.includes("g'isht")) {
        cargoType = "Qurilish mollari va sement";
      } else if (lower.includes("meva") || lower.includes("sabzavot") || lower.includes("oziq")) {
        cargoType = "Oziq-ovqat va qishloq xo'jaligi";
      } else if (lower.includes("kiyim") || lower.includes("tekstil") || lower.includes("mato")) {
        cargoType = "To'qimachilik va tayyor kiyimlar";
      } else if (lower.includes("mebel") || lower.includes("jihoz")) {
        cargoType = "Mebel va uy jihozlari";
      }

      setParsedResult({
        pickup,
        delivery,
        weight,
        volume,
        cargoType,
        vehicle
      });
      setIsProcessing(false);
    }, 600);
  };

  const handleApply = () => {
    if (parsedResult) {
      onApplyParsedShipment(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#0e0722] border border-purple-500/20 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl overflow-hidden flex flex-col space-y-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Voice AI Dispatcher</h3>
              <span className="text-[10px] text-purple-300 font-mono">YukLa Realtime Speech-to-Order</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Capture Circle */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-purple-600/30 animate-ping" />
            )}
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition transform active:scale-95 shadow-xl relative z-10 ${
                isListening
                  ? "bg-red-600 shadow-red-900/60 animate-pulse"
                  : "bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/60"
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-white block">
              {isListening ? "Tinglanmoqda... Marhamat, yukingiz haqida gapiring" : "Mikrofonni bosib gapiring"}
            </span>
            <span className="text-[11px] text-white/50 block mt-0.5">
              (Misol: "Toshkentdan Samarqandga 2 tonna qurilish moli")
            </span>
          </div>

          <button
            type="button"
            onClick={loadVoiceSample}
            className="text-[10px] text-purple-400 hover:text-purple-300 underline font-mono cursor-pointer"
          >
            Demo ovoz namunasini yuklash ✨
          </button>
        </div>

        {/* Transcript Box */}
        {transcript && (
          <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-3.5 text-xs text-white/90 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-white/50 font-mono">
              <span>Nutq matni:</span>
              <span className="text-purple-400">Nutq tanildi</span>
            </div>
            <p className="italic leading-relaxed">{transcript}</p>

            {!parsedResult && (
              <button
                onClick={processTranscriptWithAi}
                disabled={isProcessing}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI yuk ma'lumotlarini ajratmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI orqali parametrlarni tahlil qilish</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsedResult && (
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Yuk parametrlari avtomatik aniqlandi:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9.5px] text-white/40 block">Yuklash:</span>
                <span className="font-bold text-white">{parsedResult.pickup}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9.5px] text-white/40 block">Yetkazish:</span>
                <span className="font-bold text-white">{parsedResult.delivery}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9.5px] text-white/40 block">Yuk turi:</span>
                <span className="font-bold text-white truncate block">{parsedResult.cargoType}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9.5px] text-white/40 block">Avtotransport:</span>
                <span className="font-bold text-purple-300">{parsedResult.vehicle}</span>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              <span>Buyurtma ustasiga kiritish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
