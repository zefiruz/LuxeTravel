import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { AppProviders } from "./context";
import HotelsFigmaPreviewPage from "./pages/HotelsFigmaPreviewPage";
import TripsFigmaPreviewPage from "./pages/TripsFigmaPreviewPage";
import HotelManagementFigmaPreviewPage from "./pages/HotelManagementFigmaPreviewPage";
import HotelBookingsPage from "./pages/HotelBookingsPage";
import UserManagementFigmaPreviewPage from "./pages/UserManagementFigmaPreviewPage";
import "./styles/index.css";

const hash = window.location.hash;
const isDev = import.meta.env.DEV;

const previewHotelsManagement =
  isDev && hash === "#preview-hotels-management" ? (
    <Routes>
      <Route path="/" element={<HotelManagementFigmaPreviewPage />} />
      <Route path="/hotels/:hotelId/bookings" element={<HotelBookingsPage />} />
    </Routes>
  ) : null;

const previewHotelsManager =
  isDev && hash === "#preview-hotels" ? (
    <Routes>
      <Route path="/" element={<HotelsFigmaPreviewPage />} />
      <Route path="/hotels/:hotelId/bookings" element={<HotelBookingsPage />} />
    </Routes>
  ) : null;

const previewComponent = (() => {
  if (!isDev) return null;
  if (hash === "#preview-hotels-management") return null;
  if (hash === "#preview-hotels") return null;
  if (hash === "#preview-users-management") return <UserManagementFigmaPreviewPage />;
  if (hash === "#preview-trips") return <TripsFigmaPreviewPage />;
  return null;
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        {previewHotelsManagement ??
          previewHotelsManager ??
          previewComponent ??
          <App />}
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
