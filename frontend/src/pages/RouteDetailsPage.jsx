import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Header from "../components/Header";
import api from "../services/api";
import "../styles/RouteDetailsPage.css";

function RouteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/routes/${id}`);
        console.log('Fetched route details:', response);
        setRoute(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch route:', err);
        setError(err.message);
        setRoute(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  const formatStatus = (status) => {
    if (!status) return "—";
    const key = (status.title || status.id || "").toLowerCase();
    const map = {
      draft: "Черновик",
      pending: "В обработке",
      processing: "В обработке",
      confirmed: "Подтверждён",
      completed: "Завершён",
      cancelled: "Отменён",
    };
    return map[key] || status.title || key;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  const getCityName = (booking) => {
    return booking.room_type?.hotel?.city?.title
      || booking.room_type?.hotel?.city?.name
      || booking.room_type?.hotel?.title
      || booking.room_type?.title
      || "Неизвестный город";
  };

  const getHotelName = (booking) => {
    return booking.room_type?.hotel?.title
      || booking.room_type?.hotel?.name
      || "Отель не указан";
  };

  const getRoomTypeName = (booking) => {
    return booking.room_type?.title || "Тип номера не указан";
  };

  if (loading) {
    return (
      <div className="route-details-page">
        <Header />
        <main className="route-details-page__content">
          <div className="loading-container">Загрузка маршрута...</div>
        </main>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="route-details-page">
        <Header />
        <main className="route-details-page__content">
          <button
            type="button"
            className="route-details-page__close-btn"
            onClick={() => navigate("/my-routes")}
            aria-label="Вернуться к списку маршрутов"
          >
            <X className="route-details-page__close-icon" />
          </button>
          <section className="route-details-card">
            <h1 className="route-details-card__title">Ошибка загрузки маршрута</h1>
            <p className="route-details-page__error">{error || "Маршрут не найден"}</p>
          </section>
        </main>
      </div>
    );
  }

  const bookings = route.bookings || [];

  return (
    <div className="route-details-page">
      <Header />

      <main className="route-details-page__content">
        <button
          type="button"
          className="route-details-page__close-btn"
          onClick={() => navigate("/my-routes")}
          aria-label="Вернуться к списку маршрутов"
        >
          <X className="route-details-page__close-icon" />
        </button>

        <section className="route-details-card">
          <h1 className="route-details-card__title">
            {route.trip_idea || `Маршрут №${bookings.length}`}
          </h1>

          <div className="route-details-card__meta">
            <span className="route-details-card__dates">
              {formatDate(route.start_date)} — {formatDate(route.end_date)}
            </span>
            <span className="route-details-card__travelers">
              Путников: {route.travelers_count || 1}
            </span>
            {route.status && (
              <span className="route-details-card__status">
                {formatStatus(route.status)}
              </span>
            )}
          </div>

          <div className="route-details-card__list">
            {bookings.length === 0 ? (
              <p className="route-details-card__empty">
                В этом маршруте пока нет остановок.
              </p>
            ) : (
              bookings.map((booking, index) => (
                <div className="route-details-stop" key={booking.id}>
                  <div className="route-details-stop__image"
                    style={{
                      backgroundImage: booking.room_type?.hotel?.image_url
                        ? `url(${booking.room_type.hotel.image_url})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  <div className="route-details-stop__info">
                    <p className="route-details-stop__city">
                      {index + 1}. {getCityName(booking)}
                    </p>
                    <p className="route-details-stop__dates">
                      {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                    </p>
                    <p className="route-details-stop__hotel">
                      {getHotelName(booking)}
                    </p>
                    <p className="route-details-stop__room">
                      {getRoomTypeName(booking)}
                    </p>
                    {booking.status && (
                      <span className="route-details-stop__status">
                        {formatStatus(booking.status)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RouteDetailsPage;