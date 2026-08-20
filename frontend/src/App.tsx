import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequirementInputPage from "./pages/RequirementInputPage";
import AnalyzePage from "./pages/AnalyzePage";
import DraftPage from "./pages/DraftPage";
import ApprovePage from "./pages/ApprovePage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequirementInputPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyze/:threadId" element={<AnalyzePage />} />
        <Route path="/draft/:threadId" element={<DraftPage />} />
        <Route path="/approve/:threadId" element={<ApprovePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
