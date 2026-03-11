import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Ingestor from "./pages/Ingestor";
import Research from "./pages/Research";
import Dashboard from "./pages/Dashboard";
import CAMReport from "./pages/CAMReport";
import Chat from "./pages/Chat";

export default function App() {
  const [page, setPage] = useState("home");
  const [projectData, setProjectData] = useState({
    companyName: "",
    documents: [],
    extractedData: null,
    researchData: null,
    riskScore: null,
    camReport: null,
  });

  const pages = { home: Home, ingestor: Ingestor, research: Research, dashboard: Dashboard, cam: CAMReport, chat: Chat };
  const CurrentPage = pages[page];

  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar currentPage={page} setPage={setPage} />
      <main className="flex-1 ml-64 p-8">
        <CurrentPage
          projectData={projectData}
          setProjectData={setProjectData}
          setPage={setPage}
        />
      </main>
    </div>
  );
}