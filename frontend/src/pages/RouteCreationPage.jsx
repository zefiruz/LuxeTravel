import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import Header from "../components/Header";
import "../styles/RouteCreationPage.css";
import { useCities } from "../context";

function RouteCreationPage() {
  const navigate = useNavigate();
  const { cities, loading, error } = useCities();

  const [mode, setMode] = useState("known");
  const [selectedCities, setSelectedCities] = useState([null]);
  const [citiesToSelect, setCitiesToSelect] = useState([]);
  const [travelersCount, setTravelersCount] = useState("");
  const [startDate, setStartDate] = useState("2026-03-18");
  const [endDate, setEndDate] = useState("2026-04-25");
  const [tripIdea, setTripIdea] = useState("");

  const handleCityChange = (index, selectedOption) => {
    const newSelectedCities = [...selectedCities];
    newSelectedCities[index] = selectedOption;
    setSelectedCities(newSelectedCities);
  };

  const handleAddCity = () => {
    setSelectedCities((prev) => [...prev, null]);
  };

  const handleRemoveCity = (index) => {
    const newSelectedCities = [...selectedCities];
    newSelectedCities.splice(index, 1);
    setSelectedCities(newSelectedCities);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const routeData = {
      startDate,
      endDate,
      travelersCount: parseInt(travelersCount),
      mode,
      cities: mode === "known"
        ? selectedCities
          .filter(city => city !== null)
          .map(city => city.value)
        : [],
      tripIdea: mode === "unknown" ? tripIdea : "",
    };

    navigate("/route-builder");
  };

  useEffect(() => {
    if (cities && cities.length > 0) {
      const selectedIds = new Set(
        selectedCities
          .filter(city => city !== null)
          .map(city => city.value)
      );

      const formattedCities = cities
        .filter(city => !selectedIds.has(city.id))
        .map(city => ({
          value: city.id,
          label: city.title,
          ...city
        }));
      setCitiesToSelect(formattedCities);
    }
  }, [cities, selectedCities]);

  if (loading) {
    return (
      <div className="route-creation-page">
        <Header />
        <div className="loading-container">Загрузка городов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="route-creation-page">
        <Header />
        <div className="error-container">Ошибка: {error}</div>
      </div>
    );
  }

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
              type="number"
              min="1"
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
                className={`route-form-card__toggle-btn ${mode === "known" ? "route-form-card__toggle-btn--active" : ""
                  }`}
                onClick={() => setMode("known")}
              >
                я знаю куда хочу
              </button>

              <button
                type="button"
                className={`route-form-card__toggle-btn ${mode === "unknown" ? "route-form-card__toggle-btn--active" : ""
                  }`}
                onClick={() => setMode("unknown")}
              >
                я не знаю куда хочу
              </button>
            </div>
          </div>

          {mode === "known" ? (
            <div className="route-form-card__known">
              {selectedCities.map((selectedCity, index) => (
                <Select
                  key={index}
                  options={citiesToSelect}
                  value={selectedCity}
                  onChange={(option) => handleCityChange(index, option)}
                  placeholder="Выберите город..."
                  isSearchable={true}
                  isClearable={true}
                  isValidNewOption={() => false}
                  noOptionsMessage={() => "Ничего не найдено"}
                  className="route-form-card__select"
                  classNamePrefix="react-select"
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
                rows={4}
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