import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Header from "../components/Header";
import "../styles/RouteDetailsPage.css";

function RouteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const routeStops = [
    {
      id: 1,
      city: "Москва",
      dates: "12.02.2026-15.02.2026",
      hotel: "Отель Люкс",
    },
    {
      id: 2,
      city: "Дубай",
      dates: "15.02.2026-18.02.2026",
      hotel: "Отель Премиум",
    },
    {
      id: 3,
      city: "Париж",
      dates: "18.02.2026-21.02.2026",
      hotel: "Отель Люкс Премиум",
    },
  ];

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
          <h1 className="route-details-card__title">Маршрут №{id}</h1>

          <div className="route-details-card__list">
            {routeStops.map((stop) => (
              <div className="route-details-stop" key={stop.id}>
                <div className="route-details-stop__image" />

                <div className="route-details-stop__info">
                  <p className="route-details-stop__city">{stop.city}</p>
                  <p className="route-details-stop__dates">{stop.dates}</p>
                  <p className="route-details-stop__hotel">{stop.hotel}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RouteDetailsPage;