import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPages.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!form.email || !form.password) {
      setLocalError("Пожалуйста, заполните все поля");
      return;
    }

    const success = await login(form.email, form.password);

    if (success) {
      navigate("/profile");
    } else {
      setLocalError(error || "Неверный email или пароль");
    }
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

            {(localError || error) && (
              <p className="auth-form__error">{localError || error}</p>
            )}

            <div className="auth-card__actions">
              <button
                type="submit"
                className="auth-btn"
                disabled={loading}
              >
                {loading ? "Вход..." : "Войти"}
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