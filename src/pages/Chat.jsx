import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Zap, RotateCcw } from "lucide-react";
import { callGemini } from "../api";

const STARTERS = [
  "Why did you recommend this verdict?",
  "The court case was dismissed — update your risk score.",
  "Factory is now operating at 90% capacity, reassess.",
  "What would change your verdict to Approve?",
  "Explain the Character score in detail.",
  "How does the sector risk affect the interest rate?",
];

export default function Chat({ projectData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `I've completed the credit appraisal for **${projectData.companyName || "your company"}**.\n\nVerdict: **${projectData.riskScore?.verdict || "pending"}** · Score: **${projectData.riskScore?.overall_score || "N/A"}/100** · Limit: **${projectData.riskScore?.suggested_limit || "N/A"}** @ **${projectData.riskScore?.suggested_rate || "N/A"}**\n\nYou can challenge any part of my reasoning. I'll recalculate and explain every change.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    const history = messages
      .map((m) => `${m.role === "assistant" ? "CreditLens AI" : "Credit Officer"}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are CreditLens AI, an expert Indian corporate credit analyst co-pilot.

Appraisal data for ${projectData.companyName}:
FINANCIALS: ${JSON.stringify(projectData.extractedData || {})}
RESEARCH: ${JSON.stringify(projectData.researchData || {})}
RISK SCORES: ${JSON.stringify(projectData.riskScore || {})}
QUALITATIVE NOTES: ${projectData.qualitativeNotes || "None"}

Conversation so far:
${history}

Credit Officer: ${userMsg}

Respond concisely in 3-5 sentences. If new information changes the risk, explicitly state how. Use **bold** for key numbers and verdicts. Always cite which data drives your reasoning.`;

    try {
      const reply = await callGemini(prompt);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([{
      role: "assistant",
      content: `Conversation reset. Ready to discuss the appraisal for **${projectData.companyName || "your company"}**.`,
    }]);
  };

  const renderMessage = (content) =>
    content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold">$1</strong>')
      .replace(/\n/g, "<br/>");

  return (
    <div className="max-w-4xl mx-auto animate-fade-up flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-serif text-4xl text-white mb-1">AI Co-pilot</h1>
          <p className="text-muted">Challenge the reasoning. The AI explains and recalculates.</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-muted hover:text-white border border-border rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {projectData.riskScore && (
        <div className="flex items-center gap-4 bg-ink2 border border-border rounded-xl px-5 py-3 mb-4 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gold" />
            <span className="text-xs font-mono text-muted">LIVE CONTEXT</span>
          </div>
          <span className="text-xs text-white">{projectData.companyName}</span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            projectData.riskScore.verdict === "Approve" ? "bg-teal/20 text-teal" :
            projectData.riskScore.verdict === "Reject" ? "bg-danger/20 text-danger" :
            "bg-amber/20 text-amber"
          }`}>{projectData.riskScore.verdict}</span>
          <span className="text-xs text-muted">Score: <span className="text-white">{projectData.riskScore.overall_score}/100</span></span>
          <span className="text-xs text-muted">Limit: <span className="text-white">{projectData.riskScore.suggested_limit}</span></span>
        </div>
      )}

      {messages.length <= 1 && (
        <div className="mb-4 flex-shrink-0">
          <p className="text-xs font-mono text-muted mb-2">SUGGESTED CHALLENGES</p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                className="text-xs bg-ink2 border border-border text-muted hover:text-white hover:border-gold px-3 py-2 rounded-lg transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={15} className="text-ink" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user" ? "bg-ink3 border border-border text-white" : "bg-ink2 border border-border text-white"
            }`}>
              <div dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 bg-ink3 border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <User size={15} className="text-muted" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-ink" />
            </div>
            <div className="bg-ink2 border border-border rounded-xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Challenge the AI's reasoning..."
          disabled={loading}
          className="flex-1 bg-ink2 border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-gold transition-colors text-sm disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-gold text-ink p-3 rounded-xl hover:bg-gold2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}