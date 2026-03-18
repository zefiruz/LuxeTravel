import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/RouteCreationPage.css";

function RouteCreationPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("known");
  const [cities, setCities] = useState(["Воркута", "Биробиджан", ""]);
  const [travelersCount, setTravelersCount] = useState("");
  const [startDate, setStartDate] = useState("2026-03-18");
  const [endDate, setEndDate] = useState("2026-04-25");
  const [tripIdea, setTripIdea] = useState("");

  const handleCityChange = (index, value) => {
    setCities((prev) => prev.map((city, i) => (i === index ? value : city)));
  };

  const handleAddCity = () => {
    setCities((prev) => [...prev, ""]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/route-builder");
  };

  return (
    <div className="route-creation-page">
      <Header />

      <main className="route-creation-page__content">
        <form className="route-form-card" onSubmit={handleSubmit}>
          <h1 className="route-form-card__title">Создание маршрута</h1>

          <div className="route-form-card__divider" />

          <div className="route-form-card__section">
            <label className="route-form-card__label">Даты поездки</label>

            <div className="route-form-card__date-row">
              <input
                className="route-form-card__date-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                className="route-form-card__date-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="route-form-card__section">
            <label className="route-form-card__label">Количество путников</label>
            <input
              className="route-form-card__input"
              type="text"
              value={travelersCount}
              onChange={(e) => setTravelersCount(e.target.value)}
            />
          </div>

          <div className="route-form-card__section">
            <p className="route-form-card__label route-form-card__label--question">
              Знаете ли вы какие города вы хотите посетить?
            </p>

            <div className="route-form-card__toggle">
              <button
                type="button"
                className={`route-form-card__toggle-btn ${
                  mode === "known" ? "route-form-card__toggle-btn--active" : ""
                }`}
                onClick={() => setMode("known")}
              >
                я знаю куда хочу
              </button>

              <button
                type="button"
                className={`route-form-card__toggle-btn ${
                  mode === "unknown" ? "route-form-card__toggle-btn--active" : ""
                }`}
                onClick={() => setMode("unknown")}
              >
                я не знаю куда хочу
              </button>
            </div>
          </div>

          {mode === "known" ? (
            <div className="route-form-card__known">
              {cities.map((city, index) => (
                <input
                  key={index}
                  className="route-form-card__city-input"
                  type="text"
                  value={city}
                  placeholder="Введите город"
                  onChange={(e) => handleCityChange(index, e.target.value)}
                />
              ))}

              <button
                type="button"
                className="route-form-card__add-city-btn"
                onClick={handleAddCity}
              >
                + добавить город
              </button>
            </div>
          ) : (
            <div className="route-form-card__unknown">
              <textarea
                className="route-form-card__textarea"
                value={tripIdea}
                placeholder="Напишите цель, вашей поездки, какие места хотите посетить, какие эмоции хотите испытать"
                onChange={(e) => setTripIdea(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="route-form-card__submit-btn">
            Сгенерировать
          </button>
        </form>
      </main>
    </div>
  );
}

export default RouteCreationPage;