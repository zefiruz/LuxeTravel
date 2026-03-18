import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, X } from "lucide-react";
import Header from "../components/Header";
import { useRoute } from "../context/RouteContext";
import "../styles/RoutePointDetailsPage.css";

function RoutePointDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { routePoints } = useRoute();

  const activeIndex = useMemo(() => {
    const foundIndex = routePoints.findIndex((point) => point.id === Number(id));
    return foundIndex >= 0 ? foundIndex : 0;
  }, [id, routePoints]);

  if (routePoints.length === 0) {
    return (
      <div className="route-point-page">
        <Header />
        <main className="route-point-page__content">
          <button
            type="button"
            className="route-point-page__close-btn"
            onClick={() => navigate("/")}
            aria-label="Закрыть просмотр"
          >
            <X className="route-point-page__close-icon" />
          </button>

          <section className="route-point-title-block">
            <h1 className="route-point-title">
              Маршрут для Вас
              <MapPin className="route-point-title__icon" />
            </h1>
          </section>

          <p className="route-point-empty">Маршрут пуст.</p>
        </main>
      </div>
    );
  }

  const activePoint = routePoints[activeIndex];
  const leftPoint = activeIndex > 0 ? routePoints[activeIndex - 1] : null;
  const rightPoint =
    activeIndex < routePoints.length - 1 ? routePoints[activeIndex + 1] : null;

  return (
    <div className="route-point-page">
      <Header />

      <main className="route-point-page__content">
        <button
          type="button"
          className="route-point-page__close-btn"
          onClick={() => navigate("/")}
          aria-label="Закрыть просмотр"
        >
          <X className="route-point-page__close-icon" />
        </button>

        <section className="route-point-title-block">
          <h1 className="route-point-title">
            Маршрут для Вас
            <MapPin className="route-point-title__icon" />
          </h1>
        </section>

        <section className="route-point-slider">
          <div className="route-point-slider__side route-point-slider__side--left">
            {leftPoint && (
              <button
                type="button"
                className="route-side-card route-side-card--left"
                onClick={() => navigate(`/route-point/${leftPoint.id}`)}
                aria-label={`Открыть ${leftPoint.name}`}
              >
                <div className="route-side-card__image" />
              </button>
            )}
          </div>

          <div className="route-point-main">
            {leftPoint && (
              <span className="route-point-main__line route-point-main__line--left" />
            )}

            <div className="route-point-main__image" />

            {rightPoint && (
              <span className="route-point-main__line route-point-main__line--right" />
            )}

            <div className="route-point-label">
              <span className="route-point-label__line" />
              <span className="route-point-label__text">{activePoint.name}</span>
              <span className="route-point-label__line" />
            </div>

            <p className="route-point-description">{activePoint.description}</p>

            <div className="route-point-actions">
              <button type="button" className="route-point-btn">
                Изменить город
              </button>
              <button
                type="button"
                className="route-point-btn"
                onClick={() => navigate(`/route-point/${activePoint.id}/hotels`)}
              >
                Выбрать отель
              </button>
            </div>
          </div>

          <div className="route-point-slider__side route-point-slider__side--right">
            {rightPoint && (
              <button
                type="button"
                className="route-side-card route-side-card--right"
                onClick={() => navigate(`/route-point/${rightPoint.id}`)}
                aria-label={`Открыть ${rightPoint.name}`}
              >
                <div className="route-side-card__image" />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RoutePointDetailsPage;