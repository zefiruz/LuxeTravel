import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPages.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = login(form.email, form.password);

    if (!success) {
      setError("Неверный email или аккаунт еще не зарегистрирован");
      return;
    }

    navigate("/profile");
  };

  return (
    <div className="auth-page">
      <Header />

      <main className="auth-page__content">
        <section className="auth-card">
          <h1 className="auth-card__title">Вход</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__field">
              <span className="auth-form__label">Email</span>
              <input
                className="auth-form__input"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Пароль</span>
              <input
                className="auth-form__input"
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            </label>

            {error && <p className="auth-form__error">{error}</p>}

            <div className="auth-card__actions">
              <button type="submit" className="auth-btn">
                Войти
              </button>

              <button
                type="button"
                className="auth-btn auth-btn--secondary"
                onClick={() => navigate("/auth")}
              >
                Назад
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;