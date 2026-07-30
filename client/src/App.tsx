import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SubmitPage } from "@/pages/SubmitPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { WallPage } from "@/pages/WallPage";
import { WidgetPage } from "@/pages/WidgetPage";
import { Nav } from "@/components/Nav";

export default function App() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/embed";

  return (
    <>
      {showNav && <Nav />}
      <Routes>
        <Route path="/" element={<Navigate to="/submit" replace />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wall" element={<WallPage />} />
        {/* No app chrome on this route by design — see WidgetPage.tsx */}
        <Route path="/embed" element={<WidgetPage />} />
        <Route path="*" element={<Navigate to="/submit" replace />} />
      </Routes>
    </>
  );
}