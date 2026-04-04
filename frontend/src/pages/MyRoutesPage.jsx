import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import "../styles/MyRoutesPage.css";

function MyRoutesPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/routes');
        console.log('Fetched user routes:', response);
        const routesList = Array.isArray(response) ? response : [];
        setRoutes(routesList);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch routes:', err);
        setError(err.message);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  const getCitiesRoute = (route) => {
    if (!route.bookings || route.bookings.length === 0) {
      return route.trip_idea || "Маршрут без городов";
    }

    const cities = route.bookings
      .map((booking) => {
        const city = booking.room_type?.hotel?.city;
        return city?.title || city?.name || "";
      })
      .filter(Boolean);

    return cities.length > 0 ? cities.join(" → ") : route.trip_idea || "Маршрут без городов";
  };

  const getStatusTitle = (route) => {
    return route.status?.title || "Неизвестно";
  };

  if (loading) {
    return (
      <div className="my-routes-page">
        <Header />
        <main className="my-routes-page__content">
          <div className="loading-container">Загрузка маршрутов...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-routes-page">
        <Header />
        <main className="my-routes-page__content">
          <section className="my-routes-page__title-block">
            <span className="my-routes-page__title-line" />
            <h1 className="my-routes-page__title">Ваши маршруты</h1>
            <span className="my-routes-page__title-line" />
          </section>
          <p className="my-routes-page__error">Ошибка: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="my-routes-page">
      <Header />

      <main className="my-routes-page__content">
        <section className="my-routes-page__title-block">
          <span className="my-routes-page__title-line" />
          <h1 className="my-routes-page__title">Ваши маршруты</h1>
          <span className="my-routes-page__title-line" />
        </section>

        {routes.length === 0 ? (
          <section className="my-routes-page__empty">
            <p>У вас пока нет маршрутов.</p>
            <button
              type="button"
              className="my-routes-page__create-btn"
              onClick={() => navigate("/route-form")}
            >
              Создать маршрут
            </button>
          </section>
        ) : (
          <section className="routes-table-card">
            <div className="routes-table-card__header">
              <span>Номер</span>
              <span>Маршрут</span>
              <span>Даты</span>
              <span>Количество людей</span>
            </div>
            {routes.map((route, index) => (
              <div className="routes-table-card__row" key={route.id}>
                <span className="routes-table-card__cell">№{index + 1}</span>
                <span className="routes-table-card__cell">{getCitiesRoute(route)}</span>
                <span className="routes-table-card__cell">
                  {formatDate(route.start_date)} — {formatDate(route.end_date)}
                </span>
                <span className="routes-table-card__cell">{route.travelers_count || 1}</span>

                <button
                  type="button"
                  className="routes-table-card__details-btn"
                  onClick={() => navigate(`/my-routes/${route.id}`)}
                >
                  Подробнее
                </button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyRoutesPage;