"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Bot, X, Send, Sparkles, HelpCircle,
  TrendingUp, Award, ShieldCheck, ChevronRight
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  "When is the next Rs. 1,500 draw?",
  "What is the USD/PKR exchange rate?",
  "What is tax on prize bond winnings?",
  "Which bond denomination has most prizes?",
];

const KNOWLEDGE_BASE: Record<string, string> = {
  "next draw": "The next upcoming Rs. 1,500 Prize Bond draw (Draw #104) is scheduled for November 15, 2026 in Rawalpindi. First prize is Rs. 3,000,000, 2nd prize is Rs. 1,000,000 (x3), and 3rd prize is Rs. 18,500 (x1,696).",
  "usd": "Current Interbank USD/PKR exchange rate is Rs. 278.40. Open market rate is approx Rs. 279.10. Bank spread is 0.35 PKR.",
  "rate": "Current Interbank Rates: USD: 278.40 PKR, EUR: 294.15 PKR, GBP: 352.80 PKR, AED: 75.82 PKR, SAR: 74.20 PKR, CAD: 204.60 PKR.",
  "tax": "Under FBR rules, withholding tax on prize bond winnings is 15% for Active Tax Filers and 30% for Non-Filers, deducted automatically at source upon claim encashment.",
  "denomination": "The Rs. 200 denomination offers the highest number of winners (2,400 prizes per quarterly draw), while Rs. 40,000 Premium Bonds offer the highest jackpot of Rs. 80 Million!",
  "check": "You can check any 6-digit prize bond number instantly using the Instant Checker on this page or save your bonds in your Portfolio Dashboard for automatic win notifications!",
};

export default function FloatingAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "👋 Welcome to Aura Wealth Terminal! I can assist you with Pakistan Prize Bond draw schedules, winning numbers, tax rules, and live PKR currency conversion. How can I help you today?",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      // Try backend AI route
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "bot",
              text: data.data.message,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to local intelligent knowledge base
    }

    // Smart fallback response
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let matchedResponse = "";

      for (const [key, val] of Object.entries(KNOWLEDGE_BASE)) {
        if (lower.includes(key)) {
          matchedResponse = val;
          break;
        }
      }

      if (!matchedResponse) {
        matchedResponse =
          "State Bank of Pakistan and National Savings hold quarterly prize bond draws for Rs. 100, 200, 750, 1500, 25000, and 40000 denominations. Live PKR exchange rates are updated every 60 seconds from the interbank feed. Launch the dashboard to track your personal portfolio!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: matchedResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* ── Chat Widget Dialog ────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[350px] sm:w-[390px] h-[500px] rounded-3xl bg-[#080d24]/95 backdrop-blur-2xl border border-brand-500/30 shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-sky-950/80 via-[#0a1128] to-indigo-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080d24]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Aura AI Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-mono font-semibold">24/7</span>
                </div>
                <span className="text-[11px] text-slate-400">Prize Bonds &amp; Live Currency</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium rounded-tr-sm shadow-md shadow-sky-500/10"
                      : "bg-white/[0.07] border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-xs text-sky-300 max-w-[70%]">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Assistant is typing…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 hover:text-white border border-white/5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about prize bonds or currency…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Buttons Row ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/923001234567?text=Hello%20Aura%20Wealth%20Support%2C%20I%20have%20an%20inquiry%20about%20Pakistan%20Prize%20Bonds."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/40 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="WhatsApp Support"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.027-.477-1.427-.589-2.348-2.039-2.42-2.133-.071-.095-.572-.763-.572-1.455 0-.693.361-1.033.49-1.176.129-.144.281-.18.375-.18.095 0 .19.001.272.006.088.005.205-.033.32.245.12.289.408 1.002.444 1.075.036.073.06.158.01.256-.049.098-.073.159-.146.244-.073.085-.154.19-.22.256-.073.072-.15.15-.064.298.086.148.382.631.821 1.022.564.502 1.04.658 1.188.732.148.073.235.061.323-.037.087-.098.375-.438.475-.589.1-.151.2-.126.334-.076.134.049.851.401.997.474.146.073.244.11.28.171.036.061.036.356-.108.761zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.177L2 22l4.981-1.397A9.946 9.946 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
          <span className="text-xs font-bold tracking-wide">WhatsApp</span>
        </a>

        {/* AI Chatbot FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all duration-300 shadow-xl ${
            isOpen
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
              : "bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/30 border border-sky-400/40 hover:scale-105 active:scale-95"
          }`}
          aria-label="Toggle AI Chatbot"
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span>AI Chatbot</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
