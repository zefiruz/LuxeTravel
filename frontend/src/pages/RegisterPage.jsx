import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPages.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    register(form);
    navigate("/profile");
  };

  return (
    <div className="auth-page">
      <Header />

      <main className="auth-page__content">
        <section className="auth-card">
          <h1 className="auth-card__title">Регистрация</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__field">
              <span className="auth-form__label">Фамилия</span>
              <input
                className="auth-form__input"
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Имя</span>
              <input
                className="auth-form__input"
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Отчество</span>
              <input
                className="auth-form__input"
                type="text"
                value={form.middleName}
                onChange={(e) => handleChange("middleName", e.target.value)}
              />
            </label>

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
              <span className="auth-form__label">Телефон</span>
              <input
                className="auth-form__input"
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
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

            <div className="auth-card__actions">
              <button type="submit" className="auth-btn">
                Зарегистрироваться
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

export default RegisterPage;