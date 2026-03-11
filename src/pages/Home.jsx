import { ArrowRight, FileSearch, Globe, BarChart3, FileText, MessageSquare, Shield, Zap, TrendingUp } from "lucide-react";

const features = [
  { icon: FileSearch, title: "Data Ingestor",   desc: "Upload PDFs, GST filings, bank statements. AI extracts key financial signals automatically.", color: "text-gold" },
  { icon: Globe,      title: "Research Agent",  desc: "Auto-crawls news, MCA filings, e-Courts for promoter background and litigation history.", color: "text-teal" },
  { icon: BarChart3,  title: "Risk Dashboard",  desc: "Live risk timeline, red flag panel, Five Cs scoring with all visuals and explanations.", color: "text-blue" },
  { icon: FileText,   title: "CAM Report",      desc: "Generates a professional Credit Appraisal Memo with loan amount and interest recommendation.", color: "text-amber" },
  { icon: MessageSquare, title: "AI Co-pilot",  desc: "Challenge the AI's reasoning in natural language. It recalculates and explains every change.", color: "text-gold2" },
];

const stats = [
  { value: "90s", label: "Avg. appraisal time" },
  { value: "5Cs", label: "Credit framework" },
  { value: "100%", label: "Explainable AI" },
];

export default function Home({ setPage }) {
  return (
    <div className="max-w-5xl mx-auto animate-fade-up">

      {/* Hero */}
      <div className="mb-16 pt-8">
        <div className="inline-flex items-center gap-2 bg-ink3 border border-border rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-xs font-mono text-muted">AI-Powered · Indian Context · Explainable</span>
        </div>

        <h1 className="font-serif text-6xl text-white leading-tight mb-4">
          Credit decisions<br />
          <span className="text-gold italic">in minutes,</span> not weeks.
        </h1>

        <p className="text-lg text-muted max-w-2xl leading-relaxed mb-8">
          CreditLens is an end-to-end AI credit appraisal engine built for Indian corporate lending.
          Upload documents, run research, get a full CAM with complete reasoning you can challenge.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setPage("ingestor")}
            className="flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:bg-gold2 transition-all duration-200"
          >
            Start Appraisal <ArrowRight size={16} />
          </button>
          <button
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2 border border-border text-white px-6 py-3 rounded-lg hover:bg-ink3 transition-all duration-200"
          >
            View Demo <TrendingUp size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-16">
        {stats.map(({ value, label }) => (
          <div key={label} className="bg-ink2 border border-border rounded-xl p-6 text-center">
            <div className="font-serif text-4xl text-gold mb-1">{value}</div>
            <div className="text-sm text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="font-serif text-2xl text-white mb-2">Everything a credit manager needs</h2>
        <p className="text-muted mb-8">Five intelligent modules, one unified workspace.</p>

        <div className="grid grid-cols-1 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-4 bg-ink2 border border-border rounded-xl p-5 hover:border-muted transition-all duration-200 group">
              <div className="w-10 h-10 bg-ink3 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-ink transition-all">
                <Icon size={18} className={color} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-ink2 border border-gold/20 rounded-2xl p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-gold" />
            <span className="text-gold text-sm font-mono">READY TO APPRAISE</span>
          </div>
          <h3 className="font-serif text-2xl text-white">Start with a company name + documents.</h3>
          <p className="text-muted mt-1 text-sm">The engine handles everything else.</p>
        </div>
        <button
          onClick={() => setPage("ingestor")}
          className="flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:bg-gold2 transition-all whitespace-nowrap"
        >
          Begin <Zap size={15} />
        </button>
      </div>

    </div>
  );
}