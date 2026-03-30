import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RouteCreationPage from "./pages/RouteCreationPage";
import GeneratedRoutePage from "./pages/GeneratedRoutePage";
import RoutePointDetailsPage from "./pages/RoutePointDetailsPage";
import HotelSelectionPage from "./pages/HotelSelectionPage";
import MyRoutesPage from "./pages/MyRoutesPage";
import RouteDetailsPage from "./pages/RouteDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthChoicePage from "./pages/AuthChoicePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HotelBookingsPage from "./pages/HotelBookingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/start" element={<Navigate to="/" replace />} />
      <Route path="/route-form" element={<RouteCreationPage />} />
      <Route path="/route-builder" element={<GeneratedRoutePage />} />
      <Route path="/route-point/:id" element={<RoutePointDetailsPage />} />
      <Route path="/route-point/:id/hotels" element={<HotelSelectionPage />} />
      <Route path="/my-routes" element={<MyRoutesPage />} />
      <Route path="/my-routes/:id" element={<RouteDetailsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/auth" element={<AuthChoicePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/hotels/:hotelId/bookings" element={<HotelBookingsPage />} />
    </Routes>
  );
}

export default App;