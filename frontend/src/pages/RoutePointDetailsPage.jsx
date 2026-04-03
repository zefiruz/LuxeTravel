import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, X } from "lucide-react";
import Select from "react-select";
import Header from "../components/Header";
import { useRoute } from "../context/RouteContext";
import { useCities } from "../context/CitiesContext";
import "../styles/RoutePointDetailsPage.css";

function RoutePointDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { routePoints, updateRoutePoint } = useRoute();
  const { cities } = useCities();
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);

  const activePointData = useMemo(() => {
    const point = routePoints.find((p) => String(p.id) === id);
    return point || null;
  }, [id, routePoints]);

  const activeIndex = useMemo(() => {
    if (!activePointData) return 0;
    return routePoints.findIndex((p) => String(p.id) === id);
  }, [id, routePoints, activePointData]);

  const availableCities = useMemo(() => {
    const selectedIds = new Set(
      routePoints
        .filter((p) => String(p.id) !== id)
        .map((p) => String(p.id))
    );

    return cities
      .filter((city) => !selectedIds.has(String(city.id)))
      .map((city) => ({
        value: city.id,
        label: city.title,
        ...city,
      }));
  }, [cities, routePoints, id]);

  const handleCityChange = (selectedOption) => {
    if (selectedOption) {
      updateRoutePoint(activePointData.id, {
        id: selectedOption.value,
        name: selectedOption.name,
        title: selectedOption.label,
        description: selectedOption.description,
        image_url: selectedOption.image_url,
      });
      navigate(`/route-point/${selectedOption.value}`);
    }
    setIsCitySelectorOpen(false);
  };

  if (routePoints.length === 0 || !activePointData) {
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

  const activePoint = activePointData;
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
          onClick={() => navigate("/route-builder")}
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
                <div className="route-side-card__image" >
                  {leftPoint.image_url && (
                    <img
                      src={leftPoint.image_url}
                      alt={leftPoint.title || leftPoint.name}
                      className="route-side-card__img"
                    />
                  )}
                </div>
              </button>
            )}
          </div>

          <div className="route-point-main">
            {leftPoint && (
              <span className="route-point-main__line route-point-main__line--left" />
            )}

            <div className="route-point-main__image">
              {activePoint.image_url && (
                <img
                  src={activePoint.image_url}
                  alt={activePoint.title || activePoint.name}
                  className="route-point-main__img"
                />
              )}
            </div>

            {rightPoint && (
              <span className="route-point-main__line route-point-main__line--right" />
            )}

            <div className="route-point-label">
              <span className="route-point-label__line" />
              <span className="route-point-label__text">{activePoint.title}</span>
              <span className="route-point-label__line" />
            </div>

            {activePoint.description ? (
              <p className="route-point-description">{activePoint.description}</p>
            ) : (
              <p className="route-point-description">
                Описание для города {activePoint.name} пока не заполнено.
              </p>
            )}

            <div className="route-point-actions">
              <button
                type="button"
                className="route-point-btn"
                onClick={() => setIsCitySelectorOpen(true)}
              >
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

            {isCitySelectorOpen && (
              <div className="city-selector-overlay" onClick={() => setIsCitySelectorOpen(false)}>
                <div className="city-selector" onClick={(e) => e.stopPropagation()}>
                  <h3 className="city-selector__title">Выберите город</h3>
                  <button
                    type="button"
                    className="city-selector__close"
                    onClick={() => setIsCitySelectorOpen(false)}
                    aria-label="Закрыть"
                  >
                    <X className="city-selector__close-icon" />
                  </button>
                  <Select
                    options={availableCities}
                    onChange={handleCityChange}
                    placeholder="Выберите город..."
                    isSearchable={true}
                    noOptionsMessage={() => "Нет доступных городов"}
                    className="city-selector__select"
                    classNamePrefix="react-select"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          <div className="route-point-slider__side route-point-slider__side--right">
            {rightPoint && (
              <button
                type="button"
                className="route-side-card route-side-card--right"
                onClick={() => navigate(`/route-point/${rightPoint.id}`)}
                aria-label={`Открыть ${rightPoint.name}`}
              >
                <div className="route-side-card__image" >
                  {rightPoint.image_url && (
                    <img
                      src={rightPoint.image_url}
                      alt={rightPoint.title || rightPoint.name}
                      className="route-side-card__img"
                    />
                  )}
                </div>
              </button>
            )}
          </div>
        </section>
      </main>
    </div >
  );
}

export default RoutePointDetailsPage;
