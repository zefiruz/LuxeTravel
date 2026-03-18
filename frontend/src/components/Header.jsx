import { Link } from "react-router-dom";
import { MapPinned, CircleUserRound } from "lucide-react";
import "../styles/Header.css";

function Header() {
  return (
    <header className="header">
      <Link to="/route-builder" className="header__logo">
        Luxe.Travel
      </Link>

      <nav className="header__nav">
        <Link to="/my-routes" className="header__nav-btn">
          <MapPinned className="header__icon" />
          <span>Поездки</span>
        </Link>

        <Link to="/auth" className="header__nav-btn">
          <CircleUserRound className="header__icon" />
          <span>Профиль</span>
        </Link>
      </nav>
    </header>
  );
}

export default Header;