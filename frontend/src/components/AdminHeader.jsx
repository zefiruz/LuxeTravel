import { NavLink, Link } from "react-router-dom";
import {
  Users,
  MapPinned,
  Building2,
  Map,
  ArrowLeft,
} from "lucide-react";
import "../styles/AdminHeader.css";

const adminNavItems = [
  { to: "/admin/routes", icon: MapPinned, label: "Маршруты" },
  { to: "/admin/users", icon: Users, label: "Пользователи" },
  { to: "/admin/cities", icon: Map, label: "Города" },
  { to: "/admin/hotels", icon: Building2, label: "Отели" },
];

function AdminHeader() {
  return (
    <header className="admin-header">
      <Link to="/" className="admin-header__back">
        <ArrowLeft className="admin-header__back-icon" />
        <span className="admin-header__logo">Luxe.Travel</span>
      </Link>

      <nav className="admin-header__nav">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-header__link ${isActive ? "admin-header__link--active" : ""}`
            }
          >
            <item.icon className="admin-header__link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default AdminHeader;
