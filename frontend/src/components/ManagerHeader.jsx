import { NavLink, Link } from "react-router-dom";
import { Building2, CalendarDays, ArrowLeft } from "lucide-react";
import "../styles/ManagerHeader.css";

const managerNavItems = [
  { to: "/manager/hotels", icon: Building2, label: "Отели" },
  { to: "/manager/bookings", icon: CalendarDays, label: "Бронирования" },
];

function ManagerHeader() {
  return (
    <header className="manager-header">
      <Link to="/" className="manager-header__back">
        <ArrowLeft className="manager-header__back-icon" />
        <span className="manager-header__logo">Luxe.Travel</span>
      </Link>

      <nav className="manager-header__nav">
        {managerNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `manager-header__link ${isActive ? "manager-header__link--active" : ""}`
            }
          >
            <item.icon className="manager-header__link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default ManagerHeader;
