import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/AuthPages.css";

function AuthChoicePage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <Header />

      <main className="auth-page__content">
        <section className="auth-card auth-card--choice">
          <h1 className="auth-card__title">Добро пожаловать</h1>
          <p className="auth-card__subtitle">
            Чтобы открыть профиль, войдите в аккаунт или зарегистрируйтесь
          </p>

          <div className="auth-card__actions auth-card__actions--center">
            <button
              type="button"
              className="auth-btn"
              onClick={() => navigate("/login")}
            >
              Войти
            </button>

            <button
              type="button"
              className="auth-btn"
              onClick={() => navigate("/register")}
            >
              Зарегистрироваться
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthChoicePage;