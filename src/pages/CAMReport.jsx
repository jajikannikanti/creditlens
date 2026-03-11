import { useState } from "react";
import { FileText, Loader, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { callGemini } from "../api";

export default function CAMReport({ projectData, setProjectData, setPage }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(projectData.camReport || null);
  const company = projectData.companyName || "";

  const generateCAM = async () => {
    if (!projectData.riskScore) return alert("Please complete the Risk Dashboard step first.");
    setLoading(true);

    try {
      const prompt = `You are a senior Indian bank credit manager writing a formal Credit Appraisal Memo.

Data for ${company}:
FINANCIALS: ${JSON.stringify(projectData.extractedData || {})}
RESEARCH: ${JSON.stringify(projectData.researchData || {})}
RISK SCORES: ${JSON.stringify(projectData.riskScore || {})}
QUALITATIVE NOTES: ${projectData.qualitativeNotes || "None"}

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "cam_number": "CAM/2025/001",
  "date": "March 2025",
  "company": "${company}",
  "executive_summary": "3-4 sentence overview",
  "character": { "score": 72, "assessment": "2-3 sentence assessment" },
  "capacity": { "score": 65, "assessment": "2-3 sentence assessment" },
  "capital": { "score": 80, "assessment": "2-3 sentence assessment" },
  "collateral": { "score": 55, "assessment": "2-3 sentence assessment" },
  "conditions": { "score": 60, "assessment": "2-3 sentence assessment" },
  "financial_highlights": [
    { "metric": "Revenue", "value": "X Cr", "trend": "up" },
    { "metric": "Net Profit", "value": "X Cr", "trend": "stable" },
    { "metric": "Debt/Equity", "value": "X.X", "trend": "down" },
    { "metric": "GST Compliance", "value": "Compliant", "trend": "stable" }
  ],
  "recommendation": "Approve or Reject or Conditional Approve",
  "sanctioned_limit": "X Crore",
  "interest_rate": "X.X% p.a.",
  "tenure": "X years",
  "conditions_precedent": ["condition1", "condition2"],
  "covenants": ["covenant1", "covenant2"],
  "conclusion": "2-3 sentence formal conclusion"
}`;

      const text = await callGemini(prompt);
      const parsed = JSON.parse(text);
      setReport(parsed);
      setProjectData((prev) => ({ ...prev, camReport: parsed }));
    } catch (err) {
      console.error(err);
      alert("CAM generation failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const trendIcon = (t) => t === "up" ? "↑" : t === "down" ? "↓" : "→";
  const trendColor = (t) => t === "up" ? "text-teal" : t === "down" ? "text-danger" : "text-muted";
  const scoreColor = (s) => s >= 70 ? "text-teal" : s >= 50 ? "text-amber" : "text-danger";
  const verdictColor = (v) => v === "Approve" ? "text-teal" : v === "Reject" ? "text-danger" : "text-amber";
  const verdictBg = (v) => v === "Approve" ? "bg-teal/10 border-teal/30" : v === "Reject" ? "bg-danger/10 border-danger/30" : "bg-amber/10 border-amber/30";

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-white mb-2">CAM Report</h1>
        <p className="text-muted">Formal Credit Appraisal Memo for <span className="text-gold">{company || "your company"}</span>.</p>
      </div>

      <button
        onClick={generateCAM}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-4 rounded-xl hover:bg-gold2 transition-all disabled:opacity-50 mb-8"
      >
        {loading ? (
          <><Loader size={18} className="animate-spin" /> Generating CAM...</>
        ) : (
          <><FileText size={18} /> Generate Credit Appraisal Memo</>
        )}
      </button>

      {report && (
        <div className="space-y-5 animate-fade-up">
          <div className="bg-ink2 border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-gold mb-1">CREDIT APPRAISAL MEMO</p>
                <h2 className="font-serif text-3xl text-white mb-1">{report.company}</h2>
                <p className="text-sm text-muted font-mono">{report.cam_number} · {report.date}</p>
              </div>
              <div className={`border rounded-xl px-5 py-3 text-center ${verdictBg(report.recommendation)}`}>
                <p className="text-xs font-mono text-muted mb-1">VERDICT</p>
                <p className={`font-serif text-2xl ${verdictColor(report.recommendation)}`}>{report.recommendation}</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mt-4 border-t border-border pt-4">{report.executive_summary}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Sanctioned Limit", value: report.sanctioned_limit },
              { label: "Interest Rate",    value: report.interest_rate },
              { label: "Tenure",           value: report.tenure },
            ].map(({ label, value }) => (
              <div key={label} className="bg-ink2 border border-border rounded-xl p-5 text-center">
                <p className="text-xs font-mono text-muted mb-2">{label.toUpperCase()}</p>
                <p className="text-xl text-white font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-ink2 border border-border rounded-xl p-5">
            <p className="text-xs font-mono text-muted mb-4">FINANCIAL HIGHLIGHTS</p>
            <div className="grid grid-cols-2 gap-3">
              {report.financial_highlights?.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-ink3 rounded-lg px-4 py-3">
                  <span className="text-sm text-muted">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{item.value}</span>
                    <span className={`text-sm font-mono ${trendColor(item.trend)}`}>{trendIcon(item.trend)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ink2 border border-border rounded-xl p-5">
            <p className="text-xs font-mono text-muted mb-4">FIVE Cs ASSESSMENT</p>
            <div className="space-y-4">
              {[
                { label: "Character",  data: report.character },
                { label: "Capacity",   data: report.capacity },
                { label: "Capital",    data: report.capital },
                { label: "Collateral", data: report.collateral },
                { label: "Conditions", data: report.conditions },
              ].map(({ label, data }) => (
                <div key={label} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{label}</p>
                    <span className={`font-mono text-lg ${scoreColor(data?.score || 0)}`}>{data?.score}/100</span>
                  </div>
                  <div className="h-1 bg-ink3 rounded-full mb-2">
                    <div className="h-full rounded-full"
                      style={{ width: `${data?.score || 0}%`, backgroundColor: data?.score >= 70 ? "#38c9b0" : data?.score >= 50 ? "#f5a623" : "#f05a5a" }} />
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{data?.assessment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-3">CONDITIONS PRECEDENT</p>
              <ul className="space-y-2">
                {report.conditions_precedent?.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={13} className="text-amber mt-0.5 flex-shrink-0" />
                    <span className="text-white">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-3">COVENANTS</p>
              <ul className="space-y-2">
                {report.covenants?.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={13} className="text-blue mt-0.5 flex-shrink-0" />
                    <span className="text-white">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-ink2 border border-gold/20 rounded-xl p-5">
            <p className="text-xs font-mono text-gold mb-2">CONCLUSION</p>
            <p className="text-white text-sm leading-relaxed">{report.conclusion}</p>
          </div>

          <button
            onClick={() => setPage("chat")}
            className="w-full flex items-center justify-center gap-2 border border-gold text-gold font-medium py-3 rounded-xl hover:bg-gold hover:text-ink transition-all"
          >
            Challenge the AI's Reasoning <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}