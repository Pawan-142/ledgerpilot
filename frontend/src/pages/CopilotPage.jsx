import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

const SUGGESTED_PROMPTS = [
  "Why did our match rate fall?",
  "Show me the highest-value exceptions.",
  "Which transactions require human review?",
  "How many settlements are missing?",
  "What are the most common exception types?",
  "Summarize today's reconciliation batch.",
  "Which exceptions should I investigate first?"
];

export function CopilotPage({ summary, health }) {
  const isGroqActive = Boolean(health?.groq_configured);
  const activeModel = health?.groq_model || 'openai/gpt-oss-120b';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am LedgerPilot Copilot. I'm connected to your active reconciliation batch of 120 synthetic financial records. Ask me anything about match rates, root causes of variances, high-risk exceptions, or recommended remediation steps.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_ai: isGroqActive,
      model: isGroqActive ? activeModel : 'Deterministic Engine'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askCopilot(query, summary?.run_id);
      const assistantMsg = {
        role: 'assistant',
        content: res.answer,
        grounded_stats: res.grounded_stats,
        followups: res.suggested_followups,
        model: res.model_used || activeModel,
        is_ai: Boolean(res.is_ai_generated),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Error contacting finance intelligence: ${err.message || 'Unknown failure'}. The deterministic reconciliation engine remains operational.`,
        is_error: true,
        is_ai: false,
        model: 'Fallback Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Finance Copilot</span>
            </h2>
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded font-mono border ${
              isGroqActive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
            }`}>
              {isGroqActive ? '● Groq API Connected' : '○ Offline Deterministic'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask natural-language finance operations questions grounded strictly in active batch reconciliation evidence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-slate-500 text-[11px]">Active Model:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{activeModel}</span>
        </div>
      </div>

      {/* Suggested Questions Carousel/Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wider">
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto scroll-smooth space-y-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-3 shadow-sm ${
                  isUser
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono">
                  <div className="flex items-center gap-2">
                    <span>{isUser ? 'Finance Operator' : 'LedgerPilot AI Controller'}</span>
                    {!isUser && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] border font-mono ${
                        msg.is_ai 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {msg.is_ai ? `● Live Groq API (${msg.model || activeModel})` : '⚙️ Deterministic Logic'}
                      </span>
                    )}
                  </div>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="text-xs leading-relaxed font-sans whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Grounded Stats Pill if returned */}
                {msg.grounded_stats && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Match Rate</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{msg.grounded_stats.match_rate_percent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Accuracy</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{msg.grounded_stats.accuracy_percent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Throughput</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{msg.grounded_stats.throughput_rps}/s</span>
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.followups && msg.followups.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Recommended Follow-ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followups.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(f)}
                          className="text-[11px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition flex items-center gap-1 shadow-sm"
                        >
                          <span>{f}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-300 font-mono shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Analyzing reconciliation batch with Groq LLM ({activeModel})...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder={`Ask a question about the active reconciliation batch (processed via ${activeModel})...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Ask Copilot</span>
        </button>
      </form>
    </div>
  );
}
