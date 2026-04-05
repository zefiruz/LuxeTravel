import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPages.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Сообщение об успешной регистрации
  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMsg("Регистрация успешна! Войдите в систему.");
      // Очищаем состояние чтобы сообщение не показывалось повторно
      navigate("/login", { replace: true, state: {} });
    }
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMsg("");

    if (!form.email || !form.password) {
      setLocalError("Пожалуйста, заполните все поля");
      return;
    }

    const success = await login(form.email, form.password);

    if (success) {
      const cities = localStorage.getItem("citiesToTravel");
      const hotels = localStorage.getItem("selectedHotelsByCity");

      if (cities && hotels) {
        navigate("/route-builder");
      } else {
        const from = location.state?.from || "/profile";
        navigate(from);
      }
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
              <span className="auth-form__label">Email *</span>
              <input
                className="auth-form__input"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Пароль *</span>
              <input
                className="auth-form__input"
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            </label>

            {successMsg && (
              <p className="auth-form__success">{successMsg}</p>
            )}

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
            </div>

            <p className="auth-card__footer">
              Нет аккаунта? <Link to="/register" className="auth-card__link">Зарегистрироваться</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
