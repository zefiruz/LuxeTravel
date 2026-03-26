import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import { MapPinned, CircleUserRound } from "lucide-react";
import { useAuth, AuthContext } from '../context/AuthContext';
import "../styles/Header.css";

function Header() {
  const { user } = useContext(AuthContext);
  //const { user, logout } = useAuth();
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        Luxe.Travel
      </Link>

      <nav className="header__nav">
        {user && (
                  <Link to="/my-routes" className="header__nav-btn">
          <MapPinned className="header__icon" />
          <span>Поездки</span>
        </Link>
        )}


        {user ?
        (<Link to="/profile" className="header__nav-btn">
            <CircleUserRound className="header__icon" />
            <span>{user.email}</span>
          </Link>)
          :
          (<Link to="/auth" className="header__nav-btn">
            <CircleUserRound className="header__icon" />
            <span>Профиль</span>
          </Link>)

          }

      </nav>
    </header>
  );
}

export default Header;