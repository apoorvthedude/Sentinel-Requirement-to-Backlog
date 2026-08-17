import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequirementInputPage from "./pages/RequirementInputPage";
import AnalyzePage from "./pages/AnalyzePage";
import DraftPage from "./pages/DraftPage";
import ApprovePage from "./pages/ApprovePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequirementInputPage />} />
        <Route path="/analyze/:threadId" element={<AnalyzePage />} />
        <Route path="/draft/:threadId" element={<DraftPage />} />
        <Route path="/approve/:threadId" element={<ApprovePage />} />
      </Routes>
    </BrowserRouter>
  );
}
