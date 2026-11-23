import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AthleteDashboard from "./pages/AthleteDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/athlete" element={<AthleteDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/coach" element={<CoachDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}