/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { TRANSLATIONS } from "../translations";
import { LanguageCode } from "../types";
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2 } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

interface AiAssistantProps {
  currentLang: LanguageCode;
  token: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function AiAssistant({ currentLang, token }: AiAssistantProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: currentLang === "uz"
        ? "Assalomu alaykum! Men YukLa Cognitive AI yordamchisiman. Sizga yuk tashish narxlari, haydovchi daromadlari yoki sizning buyurtmangiz haqida savollarga javob bera olaman. Savolingizni yozing."
        : currentLang === "ru"
        ? "Здравствуйте! Я когнитивный ИИ-ассистент YukLa. Я могу помочь рассчитать стоимость, объяснить выплаты водителям или проверить статус ваших грузов. Опишите задачу!"
        : "Hello! I am YukLa Cognitive AI Assistant. Ask me anything about freight prices, carrier commissions, or your current delivery tracking updates.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update welcome message reactively when language changes
  useEffect(() => {
    setChatHistory((prev) =>
      prev.map((msg) => {
        if (msg.id === "welcome") {
          return {
            ...msg,
            text: currentLang === "uz"
              ? "Assalomu alaykum! Men YukLa Cognitive AI yordamchisiman. Sizga yuk tashish narxlari, haydovchi daromadlari yoki sizning buyurtmangiz haqida savollarga javob bera olaman. Savolingizni yozing."
              : currentLang === "ru"
              ? "Здравствуйте! Я когнитивный ИИ-ассистент YukLa. Я могу помочь рассчитать стоимость, объяснить выплаты водителям или проверить статус ваших грузов. Опишите задачу!"
              : "Hello! I am YukLa Cognitive AI Assistant. Ask me anything about freight prices, carrier commissions, or your current delivery tracking updates.",
          };
        }
        return msg;
      })
    );
  }, [currentLang]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  // Handle Quick suggestions
  const handleSuggestionClass = (suggestion: string) => {
    setMessage(suggestion);
  };

  const currentSuggestions = currentLang === "uz"
    ? [
        "Labo/Bongo tariflari qancha?",
        "Platformada komissiya narxi necha foiz?",
        "Yuk buyurtmasini qanday yarataman?",
        "Buyurtmam holati nima bo'ldi?"
      ]
    : currentLang === "ru"
    ? [
        "Каковы тарифы для Labo/Bongo?",
        "Какой процент комиссии удерживает платформа?",
        "Как правильно создать заказ?",
        "Где сейчас мой заказ?"
      ]
    : [
        "What are the Labo/Bongo rates?",
        "What is the platform commission rate?",
        "How can I submit a cargo load?",
        "What is the status of my order?"
      ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    setErrorText("");
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((p) => [...p, userMsg]);
    setIsLoading(true);
    const originalMessage = message;
    setMessage("");

    try {
      if (!token) {
        throw new Error(currentLang === "uz"
          ? "Iltimos, AI xizmatidan foydalanish uchun hisobingizga kiring."
          : "Please login to have a discussion with the Cognitive AI.");
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: originalMessage.trim(),
          chatHistory: chatHistory.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            text: m.text,
          })),
          language: currentLang,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Savolni uzatishda xatolik yuz berdi.");
      }

      setChatHistory((p) => [
        ...p,
        {
          id: "bot-" + Date.now(),
          role: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Ulanishda muammo");
      setChatHistory((p) => [
        ...p,
        {
          id: "err-" + Date.now(),
          role: "bot",
          text: currentLang === "uz"
            ? `Kechirasiz, xatolik yuz berdi: ${err.message || 'API kaliti ulanmagan'}. Iltimos keyinroq harakat qiling.`
            : `Sorry, there was an issue processing that: ${err.message || 'API key missing'}. Please try again shortly.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Sparkly Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group h-14 w-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-bounce"
        >
          {/* Pulsing rings */}
          <div className="absolute -inset-1 rounded-full bg-indigo-500/30 blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>

          <Sparkles className="w-6 h-6 animate-pulse" />
          
          {token && (
            <span className="absolute -top-1 -right-1 bg-green-500 h-3.5 w-3.5 rounded-full border border-[#0d0617] animate-pulse"></span>
          )}
        </button>
      )}

      {/* Expanded Chat Box Sheet (Glassmorphic) */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] bg-[#0c0617]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-fade-in text-white">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none"></div>

          {/* Assistant Header */}
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-tight">YukLa Cognitive AI</h4>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                  <span>System Smart Agent Active</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation list */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed border ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white border-purple-500 rounded-br-none"
                      : "bg-white/5 text-white/90 border-white/5 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block text-[8px] text-white/30 text-right mt-1.5 font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 text-white/70 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span>{t("common.loading") || "O'ylanmoqda..."}</span>
                </div>
              </div>
            )}
            
            {errorText && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400">
                {errorText}
              </div>
            )}
          </div>

          {/* Quick prompt Recommendations list */}
          <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
            {currentSuggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClass(suggestion)}
                className="text-[10px] bg-white/5 hover:bg-purple-600/20 text-white/80 hover:text-white border border-white/10 hover:border-purple-500/30 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Message input panel */}
          <form onSubmit={handleSend} className="p-3 bg-[#0d0617] border-t border-white/10 flex gap-2">
            {!token ? (
              <div className="w-full text-center text-xs text-white/40 py-2.5 bg-white/5 rounded-xl border border-dashed border-white/10">
                {t("chat.loginPrompt") || "Muloqot qilish uchun tizimga kiring."}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("chat.placeholder") || t("aiPlaceholder") || "Yuk tashish va narxlar bo'yicha so'rang..."}
                  className="flex-1 bg-white/5 border border-white/10 h-10 px-3.5 text-xs rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
