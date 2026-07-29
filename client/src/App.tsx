import { Navigate, Route, Routes } from "react-router-dom";
import { SubmitPage } from "@/pages/SubmitPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { WallPage } from "@/pages/WallPage";
import { WidgetPage } from "@/pages/WidgetPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/submit" replace />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/wall" element={<WallPage />} />
      {/* No app chrome on this route by design — see WidgetPage.tsx */}
      <Route path="/embed" element={<WidgetPage />} />
      <Route path="*" element={<Navigate to="/submit" replace />} />
    </Routes>
  );
}
