import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, X } from "lucide-react";
import Header from "../components/Header";
import { useRoute } from "../context/RouteContext";
import "../styles/GeneratedRoutePage.css";

function GeneratedRoutePage() {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { routePoints, removeRoutePoint, addRoutePointAtIndex } = useRoute();

  const rows = [];
  for (let i = 0; i < routePoints.length; i += 3) {
    rows.push(routePoints.slice(i, i + 3));
  }

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleDeleteCard = (id) => {
    removeRoutePoint(id);
  };

  const handleOpenRoutePoint = (id) => {
    if (!isEditing) {
      navigate(`/route-point/${id}`);
    }
  };

  const handleAddPoint = (insertIndex) => {
    addRoutePointAtIndex(insertIndex);
  };

  const renderCard = (city) => {
    return (
      <div className="route-card-wrapper" key={city.id}>
        <button
          type="button"
          className="route-card route-card--clickable"
          onClick={() => handleOpenRoutePoint(city.id)}
          aria-label={`Открыть точку маршрута ${city.name}`}
        >
          {isEditing && (
            <span
              className="route-card__delete-btn"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteCard(city.id);
              }}
              role="button"
              tabIndex={0}
              aria-label="Удалить точку маршрута"
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleDeleteCard(city.id);
                }
              }}
            >
              <X className="route-card__delete-icon" />
            </span>
          )}
        </button>

        <div className="city-label">
          <span className="city-label__line"></span>
          <span className="city-label__text">{city.name}</span>
          <span className="city-label__line"></span>
        </div>
      </div>
    );
  };

  const renderConnector = (
    insertIndex,
    lineClassName = "",
    blockClassName = ""
  ) => {
    return (
      <div className={`route-connector-block ${blockClassName}`.trim()}>
        {isEditing && (
          <button
            className="add-point-btn"
            type="button"
            onClick={() => handleAddPoint(insertIndex)}
          >
            + добавить точку
          </button>
        )}
        <span className={`route-connector ${lineClassName}`.trim()}></span>
      </div>
    );
  };

  const renderRow = (row, rowIndex) => {
    const isBottomRow = rowIndex % 2 === 1;
    const rowStartIndex = rowIndex * 3;

    return (
      <div
        key={`row-${rowIndex}`}
        className={`route-row ${isBottomRow ? "route-row--bottom" : ""}`}
      >
        {isBottomRow && (
          <div className="route-row__item">
            {renderConnector(
              rowStartIndex,
              "",
              "route-connector-block--edge"
            )}
          </div>
        )}

        {row.map((city, index) => (
          <div className="route-row__item" key={city.id}>
            {renderCard(city)}

            {index < row.length - 1 &&
              renderConnector(
                rowStartIndex + index + 1,
                index === row.length - 2 ? "route-connector--accent" : ""
              )}
          </div>
        ))}

        {!isBottomRow && (
          <div className="route-row__item">
            {renderConnector(rowStartIndex + row.length)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="route-page">
      <Header />

      <main className="route-page__content">
        <section className="route-title-block">
          <h1 className="route-title">
            Маршрут для Вас
            <MapPin className="route-title__icon" />
          </h1>
        </section>

        <section className="route-scheme">
          {rows.map((row, rowIndex) => renderRow(row, rowIndex))}
        </section>

        <section className="route-bottom">
          <p className="route-price">Стоимость маршрута: 800 000</p>

          <div className="route-bottom__actions">
            <button
              className="edit-route-btn"
              type="button"
              onClick={handleEditToggle}
            >
              {isEditing ? "Сохранить изменения" : "Редактировать"}
            </button>

            <button className="book-route-btn" type="button">
              Забронировать
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default GeneratedRoutePage;