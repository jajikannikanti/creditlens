import { LayoutDashboard, FileSearch, Globe, BarChart3, FileText, MessageSquare, Zap } from "lucide-react";

const navItems = [
  { id: "home",      label: "Home",           icon: LayoutDashboard },
  { id: "ingestor",  label: "Data Ingestor",  icon: FileSearch },
  { id: "research",  label: "Research Agent", icon: Globe },
  { id: "dashboard", label: "Risk Dashboard", icon: BarChart3 },
  { id: "cam",       label: "CAM Report",     icon: FileText },
  { id: "chat",      label: "AI Co-pilot",    icon: MessageSquare },
];

export default function Sidebar({ currentPage, setPage }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-ink2 border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-ink" />
          </div>
          <div>
            <h1 className="font-serif text-lg text-white leading-none">CreditLens</h1>
            <p className="text-xs text-muted font-mono mt-0.5">AI Credit Engine</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                  ? "bg-gold text-ink"
                  : "text-muted hover:text-white hover:bg-ink3"
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted text-center font-mono">v1.0 · IIT-H Hackathon</p>
      </div>
    </aside>
  );
}