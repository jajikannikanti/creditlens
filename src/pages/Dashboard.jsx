import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Loader } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { callGemini } from "../api";

export default function Dashboard({ projectData, setProjectData, setPage }) {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState(projectData.riskScore || null);
  const company = projectData.companyName || "";

  const computeScore = async () => {
    if (!projectData.extractedData && !projectData.researchData)
      return alert("Please complete Ingestor and Research steps first.");

    setLoading(true);
    try {
      const prompt = `You are an expert Indian credit risk scoring analyst.

Based on this data for ${company}:
EXTRACTED FINANCIALS: ${JSON.stringify(projectData.extractedData || {})}
RESEARCH DATA: ${JSON.stringify(projectData.researchData || {})}
QUALITATIVE NOTES: ${projectData.qualitativeNotes || "None"}

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "character": { "score": 72, "reason": "one sentence explanation" },
  "capacity": { "score": 65, "reason": "one sentence explanation" },
  "capital": { "score": 80, "reason": "one sentence explanation" },
  "collateral": { "score": 55, "reason": "one sentence explanation" },
  "conditions": { "score": 60, "reason": "one sentence explanation" },
  "overall_score": 66,
  "risk_grade": "BB+",
  "red_flags": [
    { "severity": "high", "flag": "flag description", "source": "source" },
    { "severity": "medium", "flag": "flag description", "source": "source" }
  ],
  "green_flags": ["positive signal 1", "positive signal 2"],
  "verdict": "Approve or Reject or Conditional Approve",
  "suggested_limit": "X Crore",
  "suggested_rate": "X.X%",
  "verdict_reason": "2 sentence explanation"
}`;

      const text = await callGemini(prompt);
      const parsed = JSON.parse(text);
      setScores(parsed);
      setProjectData((prev) => ({ ...prev, riskScore: parsed }));
    } catch (err) {
      console.error(err);
      alert("Scoring failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const fiveCs = scores ? [
    { C: "Character",  score: scores.character?.score  || 0 },
    { C: "Capacity",   score: scores.capacity?.score   || 0 },
    { C: "Capital",    score: scores.capital?.score    || 0 },
    { C: "Collateral", score: scores.collateral?.score || 0 },
    { C: "Conditions", score: scores.conditions?.score || 0 },
  ] : [];

  const severityColor = (s) =>
    s === "high" ? "text-danger" : s === "medium" ? "text-amber" : "text-teal";
  const severityBg = (s) =>
    s === "high" ? "bg-danger/10 border-danger/30" : s === "medium" ? "bg-amber/10 border-amber/30" : "bg-teal/10 border-teal/30";
  const verdictColor = (v) =>
    v === "Approve" ? "text-teal" : v === "Reject" ? "text-danger" : "text-amber";
  const verdictBg = (v) =>
    v === "Approve" ? "bg-teal/10 border-teal/30" : v === "Reject" ? "bg-danger/10 border-danger/30" : "bg-amber/10 border-amber/30";
  const scoreColor = (s) =>
    s >= 70 ? "#38c9b0" : s >= 50 ? "#f5a623" : "#f05a5a";

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-white mb-2">Risk Dashboard</h1>
        <p className="text-muted">
          Five Cs scoring, red flag panel, and final verdict for{" "}
          <span className="text-gold">{company || "your company"}</span>.
        </p>
      </div>

      <button
        onClick={computeScore}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-4 rounded-xl hover:bg-gold2 transition-all disabled:opacity-50 mb-8"
      >
        {loading ? (
          <><Loader size={18} className="animate-spin" /> Computing Risk Score...</>
        ) : (
          <><Shield size={18} /> Generate Risk Score</>
        )}
      </button>

      {scores && (
        <div className="space-y-6 animate-fade-up">

          <div className="bg-ink2 border border-border rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted mb-1">OVERALL CREDIT SCORE</p>
              <div className="flex items-end gap-3">
                <span className="font-serif text-6xl text-white">{scores.overall_score}</span>
                <span className="text-muted text-lg mb-2">/100</span>
              </div>
              <p className="text-sm text-muted mt-1">Risk Grade: <span className="text-gold font-mono">{scores.risk_grade}</span></p>
            </div>
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1c2030" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={scoreColor(scores.overall_score)}
                  strokeWidth="10"
                  strokeDasharray={`${scores.overall_score * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-lg text-white">{scores.overall_score}%</span>
              </div>
            </div>
          </div>

          <div className={`border rounded-xl p-5 ${verdictBg(scores.verdict)}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono text-muted">AI VERDICT</p>
              <span className={`font-serif text-2xl ${verdictColor(scores.verdict)}`}>{scores.verdict}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-muted">Suggested Limit</p>
                <p className="text-white font-medium">{scores.suggested_limit}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Interest Rate</p>
                <p className="text-white font-medium">{scores.suggested_rate}</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mt-3 leading-relaxed">{scores.verdict_reason}</p>
          </div>

          <div className="bg-ink2 border border-border rounded-xl p-5">
            <p className="text-xs font-mono text-muted mb-4">FIVE Cs BREAKDOWN</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fiveCs} barSize={32}>
                <XAxis dataKey="C" tick={{ fill: "#8891a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#8891a8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1c2030", border: "1px solid #252a38", borderRadius: 8, color: "#c8cdd8" }} cursor={{ fill: "#252a38" }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="#e8b84b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Character",  data: scores.character },
              { label: "Capacity",   data: scores.capacity },
              { label: "Capital",    data: scores.capital },
              { label: "Collateral", data: scores.collateral },
              { label: "Conditions", data: scores.conditions },
            ].map(({ label, data }) => (
              <div key={label} className="bg-ink2 border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 text-right flex-shrink-0">
                  <span className="font-mono text-xl" style={{ color: scoreColor(data?.score || 0) }}>
                    {data?.score || 0}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">{label}</p>
                  <div className="h-1.5 bg-ink3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${data?.score || 0}%`, backgroundColor: scoreColor(data?.score || 0) }} />
                  </div>
                  <p className="text-xs text-muted mt-1">{data?.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-ink2 border border-border rounded-xl p-5">
            <p className="text-xs font-mono text-muted mb-3">RED FLAG PANEL</p>
            <div className="space-y-2">
              {scores.red_flags?.map((flag, i) => (
                <div key={i} className={`flex items-start gap-3 border rounded-lg p-3 ${severityBg(flag.severity)}`}>
                  <AlertTriangle size={14} className={`${severityColor(flag.severity)} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{flag.flag}</p>
                    <p className="text-xs text-muted mt-0.5">Source: {flag.source}</p>
                  </div>
                  <span className={`text-xs font-mono uppercase ${severityColor(flag.severity)}`}>{flag.severity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ink2 border border-border rounded-xl p-5">
            <p className="text-xs font-mono text-muted mb-3">POSITIVE SIGNALS</p>
            <div className="space-y-2">
              {scores.green_flags?.map((flag, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={14} className="text-teal flex-shrink-0" />
                  <span className="text-white">{flag}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPage("cam")}
            className="w-full flex items-center justify-center gap-2 border border-gold text-gold font-medium py-3 rounded-xl hover:bg-gold hover:text-ink transition-all"
          >
            Generate CAM Report <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}