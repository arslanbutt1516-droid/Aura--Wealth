"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Plus, Trash2, MessageSquare, AlertCircle, Zap,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  message: string;
  toolUsed?: string | null;
}

interface Session {
  id: string;
  title: string;
  createdAt: string;
}

const SUGGESTIONS = [
  "Did any of my bonds win?",
  "What is my total bond portfolio value?",
  "What is the current USD to PKR rate?",
  "Convert 500 USD to PKR",
  "When is the next prize bond draw?",
  "Show my winning bond history",
  "Explain how prize bonds work",
  "What is my portfolio summary?",
];

export default function AssistantPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setError("");

    const userMsg: Message = { role: "user", message: msg };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });
      const json = await res.json();

      if (json.success) {
        setSessionId(json.data.sessionId);
        setMessages(p => [
          ...p,
          { role: "assistant", message: json.data.response, toolUsed: json.data.toolUsed },
        ]);
      } else {
        setError(json.error || "AI request failed.");
        setMessages(p => p.slice(0, -1)); // Remove optimistic user message
      }
    } catch {
      setError("Network error. Please try again.");
      setMessages(p => p.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setError("");
    setInput("");
  };

  // Format markdown-like AI responses
  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-cyan-300 text-xs">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-fade-in">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-56 glass-card p-4 gap-3">
        <button
          id="new-chat-btn"
          onClick={startNewChat}
          className="btn-primary text-sm flex items-center gap-2 justify-center"
        >
          <Plus className="w-3.5 h-3.5" /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
            Recent Chats
          </p>
          {sessions.length === 0 && (
            <p className="text-xs text-slate-600 px-2 py-2">No previous chats.</p>
          )}
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setSessionId(s.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all truncate ${sessionId === s.id ? "bg-brand-500/10 text-brand-400" : "text-slate-400 hover:text-white hover:bg-white/8"}`}
            >
              <MessageSquare className="w-3 h-3 inline mr-1.5" />
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg">
              <Bot className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Aura Wealth Terminal Assistant</p>
              <p className="text-xs text-slate-500">Powered by Google Gemini</p>
            </div>
          </div>
          <button onClick={startNewChat} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors lg:hidden">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-5">
                <Bot className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Aura Wealth Terminal Assistant
              </h2>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                Ask me about your prize bonds, currency rates, or portfolio. I use your real data — I never guess.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:border-brand-500/30 hover:bg-white/5 text-xs transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-cyan-500 to-violet-500"
                        : "bg-gradient-to-br from-slate-600 to-slate-700"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      "U"
                    )}
                  </div>
                  <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : ""} flex flex-col gap-1`}>
                    {msg.toolUsed && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 self-start">
                        <Zap className="w-2.5 h-2.5" /> Used: {msg.toolUsed}
                      </span>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-tr-sm"
                          : "bg-white/8 text-slate-200 rounded-tl-sm"
                      }`}
                      dangerouslySetInnerHTML={
                        msg.role === "assistant"
                          ? { __html: formatMessage(msg.message) }
                          : undefined
                      }
                    >
                      {msg.role === "user" ? msg.message : undefined}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/8 rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-2xl px-4 py-2 focus-within:border-brand-500/40 transition-colors">
            <input
              id="chat-input"
              type="text"
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              placeholder="Ask about your bonds, rates, or portfolio…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              disabled={loading}
            />
            <button
              id="send-message-btn"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            Aura Wealth Terminal uses your real data. Always verify financial decisions with official sources.
          </p>
        </div>
      </div>
    </div>
  );
}
