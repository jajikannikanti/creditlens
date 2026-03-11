import { useState } from "react";
import { Globe, AlertTriangle, CheckCircle, Loader, ArrowRight, Newspaper, Scale, Building2, TrendingDown } from "lucide-react";
import { callGemini } from "../api";

export default function Research({ projectData, setProjectData, setPage }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(projectData.researchData || null);
  const [notes, setNotes] = useState(projectData.qualitativeNotes || "");
  const company = projectData.companyName || "";

  const runResearch = async () => {
    if (!company) return alert("Please complete the Data Ingestor step first.");
    setLoading(true);
    setResult(null);

    try {
      const prompt = `You are an Indian corporate credit research analyst. Based on your knowledge, research the company "${company}".

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "company": "${company}",
  "news_summary": "2-3 sentence summary of what is publicly known about this company",
  "news_sentiment": "Positive or Negative or Neutral or Mixed",
  "litigation_found": false,
  "litigation_details": "details of any known court cases or NCLT proceedings or None found",
  "sector_risks": ["risk1", "risk2", "risk3"],
  "regulatory_flags": [],
  "mca_status": "Active or Struck off or Under investigation or Unknown",
  "promoter_background": "brief promoter assessment",
  "overall_external_risk": "High or Medium or Low",
  "risk_timeline": [
    { "year": "2022", "event": "brief event", "severity": "low" },
    { "year": "2023", "event": "brief event", "severity": "medium" },
    { "year": "2024", "event": "brief event", "severity": "high" }
  ],
  "recommendation_note": "one sentence on what this research implies for lending"
}`;

      const text = await callGemini(prompt);
      const parsed = JSON.parse(text);

      setResult(parsed);
      setProjectData((prev) => ({
        ...prev,
        researchData: parsed,
        qualitativeNotes: notes,
      }));
    } catch (err) {
      console.error(err);
      alert("Research failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = () => {
    setProjectData((prev) => ({ ...prev, qualitativeNotes: notes }));
    alert("Notes saved! These will adjust the risk score.");
  };

  const severityColor = (s) =>
    s === "high" ? "text-danger" : s === "medium" ? "text-amber" : "text-teal";
  const severityDot = (s) =>
    s === "high" ? "bg-danger" : s === "medium" ? "bg-amber" : "bg-teal";

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-white mb-2">Research Agent</h1>
        <p className="text-muted">
          AI researches news, MCA filings, court records for{" "}
          <span className="text-gold">{company || "your company"}</span>.
        </p>
      </div>

      <button
        onClick={runResearch}
        disabled={loading || !company}
        className="w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-4 rounded-xl hover:bg-gold2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {loading ? (
          <><Loader size={18} className="animate-spin" /> Researching {company}...</>
        ) : (
          <><Globe size={18} /> Run Research</>
        )}
      </button>

      <div className="bg-ink2 border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} className="text-gold" />
          <p className="text-sm font-mono text-gold">CREDIT OFFICER NOTES</p>
        </div>
        <p className="text-xs text-muted mb-3">
          Add qualitative observations from site visits or management interviews. AI will factor these into the risk score.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`e.g. "Factory found operating at 40% capacity. Management was evasive about Q3 numbers."`}
          rows={4}
          className="w-full bg-ink3 border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-gold transition-colors resize-none text-sm"
        />
        <button
          onClick={saveNotes}
          className="mt-3 px-4 py-2 border border-gold text-gold text-sm rounded-lg hover:bg-gold hover:text-ink transition-all"
        >
          Save Notes
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-up">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-1">NEWS SENTIMENT</p>
              <p className={`text-lg font-medium ${
                result.news_sentiment === "Positive" ? "text-teal" :
                result.news_sentiment === "Negative" ? "text-danger" : "text-amber"
              }`}>{result.news_sentiment}</p>
            </div>
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-1">MCA STATUS</p>
              <p className={`text-lg font-medium ${result.mca_status === "Active" ? "text-teal" : "text-danger"}`}>
                {result.mca_status}
              </p>
            </div>
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-1">EXTERNAL RISK</p>
              <p className={`text-lg font-medium ${
                result.overall_external_risk === "High" ? "text-danger" :
                result.overall_external_risk === "Medium" ? "text-amber" : "text-teal"
              }`}>{result.overall_external_risk}</p>
            </div>
          </div>

          <div className="bg-ink2 border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper size={15} className="text-blue" />
              <p className="text-xs font-mono text-muted">NEWS SUMMARY</p>
            </div>
            <p className="text-white text-sm leading-relaxed">{result.news_summary}</p>
          </div>

          <div className={`bg-ink2 border rounded-xl p-5 ${result.litigation_found ? "border-danger/40" : "border-border"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Scale size={15} className={result.litigation_found ? "text-danger" : "text-teal"} />
              <p className="text-xs font-mono text-muted">LITIGATION STATUS</p>
              {result.litigation_found && (
                <span className="ml-auto text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">FLAGGED</span>
              )}
            </div>
            <p className="text-white text-sm">{result.litigation_details}</p>
          </div>

          {result.risk_timeline?.length > 0 && (
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={15} className="text-amber" />
                <p className="text-xs font-mono text-muted">RISK SIGNAL TIMELINE</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                {result.risk_timeline.map((item, i) => (
                  <div key={i} className="relative mb-4 last:mb-0">
                    <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full ${severityDot(item.severity)}`} />
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono text-muted w-10 flex-shrink-0 pt-0.5">{item.year}</span>
                      <span className={`text-sm ${severityColor(item.severity)}`}>{item.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-3">SECTOR RISKS</p>
              <ul className="space-y-2">
                {result.sector_risks?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={13} className="text-amber mt-0.5 flex-shrink-0" />
                    <span className="text-white">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-3">REGULATORY FLAGS</p>
              {result.regulatory_flags?.length > 0 ? (
                <ul className="space-y-2">
                  {result.regulatory_flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle size={13} className="text-danger mt-0.5 flex-shrink-0" />
                      <span className="text-white">{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-sm text-teal">
                  <CheckCircle size={13} /> No regulatory flags found
                </div>
              )}
            </div>
          </div>

          <div className="bg-ink2 border border-gold/20 rounded-xl p-5">
            <p className="text-xs font-mono text-gold mb-2">RESEARCH IMPLICATION</p>
            <p className="text-white text-sm leading-relaxed">{result.recommendation_note}</p>
          </div>

          <button
            onClick={() => setPage("dashboard")}
            className="w-full flex items-center justify-center gap-2 border border-gold text-gold font-medium py-3 rounded-xl hover:bg-gold hover:text-ink transition-all"
          >
            Continue to Risk Dashboard <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}