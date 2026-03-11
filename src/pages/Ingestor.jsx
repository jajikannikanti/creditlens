import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle, AlertTriangle, Loader, ArrowRight, File } from "lucide-react";
import { callGemini } from "../api";

const docTypes = [
  { id: "annual_report", label: "Annual Report" },
  { id: "bank_statement", label: "Bank Statement" },
  { id: "gst_filing", label: "GST Filing" },
  { id: "itr", label: "ITR Document" },
  { id: "legal_notice", label: "Legal Notice" },
  { id: "other", label: "Other" },
];

export default function Ingestor({ projectData, setProjectData, setPage }) {
  const [companyName, setCompanyName] = useState(projectData.companyName || "");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(projectData.extractedData || null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const addFiles = (incoming) => {
    const newFiles = Array.from(incoming).map((f) => ({
      file: f,
      name: f.name,
      type: "other",
      id: Math.random().toString(36).slice(2),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const updateType = (id, type) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, type } : f)));

  const readFileAsBase64 = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const analyze = async () => {
    if (!companyName.trim()) return alert("Please enter a company name.");
    if (files.length === 0) return alert("Please upload at least one document.");

    setLoading(true);
    setResult(null);

    try {
      let pdfBase64 = null;
      const pdfFile = files.find((f) => f.file.type === "application/pdf");
      if (pdfFile) pdfBase64 = await readFileAsBase64(pdfFile.file);

      const prompt = `You are an expert Indian corporate credit analyst. Analyze the uploaded document(s) for ${companyName} and extract the following. Respond ONLY with valid JSON, no markdown, no explanation:
{
  "company": "${companyName}",
  "revenue": "extracted revenue figure or Not found",
  "net_profit": "extracted net profit or Not found",
  "debt": "total debt figure or Not found",
  "gst_compliance": "Compliant or Non-compliant or Partial or Not found",
  "gst_discrepancy": "any GSTR-2A vs 3B mismatch or None detected",
  "circular_trading_risk": "High or Medium or Low or None detected",
  "key_risks": ["risk1", "risk2", "risk3"],
  "key_strengths": ["strength1", "strength2"],
  "promoter_details": "brief promoter background if found",
  "collateral_mentioned": "any collateral or assets mentioned",
  "summary": "2-3 sentence executive summary of financial health"
}`;

      const text = await callGemini(prompt, pdfBase64);
      const parsed = JSON.parse(text);

      setResult(parsed);
      setProjectData((prev) => ({
        ...prev,
        companyName,
        documents: files,
        extractedData: parsed,
      }));
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-white mb-2">Data Ingestor</h1>
        <p className="text-muted">Upload financial documents — AI extracts key signals automatically.</p>
      </div>

      <div className="bg-ink2 border border-border rounded-xl p-6 mb-6">
        <label className="block text-sm font-mono text-gold mb-2">COMPANY NAME</label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Minda Industries Ltd"
          className="w-full bg-ink3 border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-6 transition-all duration-200 cursor-pointer
          ${dragOver ? "border-gold bg-gold/5" : "border-border hover:border-muted"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current.click()}
      >
        <Upload size={32} className="text-muted mx-auto mb-3" />
        <p className="text-white font-medium mb-1">Drop documents here or click to browse</p>
        <p className="text-sm text-muted">Supports PDF · Annual reports, GST filings, bank statements</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="bg-ink2 border border-border rounded-xl p-5 mb-6 space-y-3">
          <p className="text-xs font-mono text-muted mb-3">UPLOADED DOCUMENTS ({files.length})</p>
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 bg-ink3 rounded-lg px-4 py-3">
              <File size={16} className="text-gold flex-shrink-0" />
              <span className="text-sm text-white flex-1 truncate">{f.name}</span>
              <select
                value={f.type}
                onChange={(e) => updateType(f.id, e.target.value)}
                className="bg-ink border border-border rounded px-2 py-1 text-xs text-muted focus:outline-none focus:border-gold"
              >
                {docTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <button onClick={() => removeFile(f.id)} className="text-muted hover:text-danger transition-colors">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gold text-ink font-semibold py-4 rounded-xl hover:bg-gold2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8"
      >
        {loading ? (
          <><Loader size={18} className="animate-spin" /> Analyzing documents...</>
        ) : (
          <><FileText size={18} /> Extract Financial Signals</>
        )}
      </button>

      {result && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-teal" />
            <h2 className="text-white font-semibold">Extraction Complete — {result.company}</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Revenue", value: result.revenue },
              { label: "Net Profit", value: result.net_profit },
              { label: "Total Debt", value: result.debt },
            ].map(({ label, value }) => (
              <div key={label} className="bg-ink2 border border-border rounded-xl p-5">
                <p className="text-xs font-mono text-muted mb-1">{label.toUpperCase()}</p>
                <p className="text-lg text-white font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-2">GST COMPLIANCE</p>
              <p className={`font-medium ${result.gst_compliance === "Compliant" ? "text-teal" : "text-amber"}`}>
                {result.gst_compliance}
              </p>
              <p className="text-xs text-muted mt-1">{result.gst_discrepancy}</p>
            </div>
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-2">CIRCULAR TRADING RISK</p>
              <p className={`font-medium ${
                result.circular_trading_risk === "High" ? "text-danger" :
                result.circular_trading_risk === "Medium" ? "text-amber" : "text-teal"
              }`}>
                {result.circular_trading_risk}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-3">KEY RISKS</p>
              <ul className="space-y-2">
                {result.key_risks?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={14} className="text-danger mt-0.5 flex-shrink-0" />
                    <span className="text-white">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink2 border border-border rounded-xl p-5">
              <p className="text-xs font-mono text-muted mb-3">KEY STRENGTHS</p>
              <ul className="space-y-2">
                {result.key_strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={14} className="text-teal mt-0.5 flex-shrink-0" />
                    <span className="text-white">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-ink2 border border-gold/20 rounded-xl p-5">
            <p className="text-xs font-mono text-gold mb-2">EXECUTIVE SUMMARY</p>
            <p className="text-white leading-relaxed">{result.summary}</p>
          </div>

          <button
            onClick={() => setPage("research")}
            className="w-full flex items-center justify-center gap-2 border border-gold text-gold font-medium py-3 rounded-xl hover:bg-gold hover:text-ink transition-all"
          >
            Continue to Research Agent <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}