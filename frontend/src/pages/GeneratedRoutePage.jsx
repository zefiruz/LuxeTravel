import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, X } from "lucide-react";
import Header from "../components/Header";
import { useRoute } from "../context/RouteContext";
import api from "../services/api";
import "../styles/GeneratedRoutePage.css";

function GeneratedRoutePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const navigate = useNavigate();
  const { routePoints, selectedHotelsByCity, travelersCount, removeRoutePoint, addRoutePointAtIndex, loadRoutePointsFromStorage } = useRoute();

  useEffect(() => {
    loadRoutePointsFromStorage();
  }, []);

  const rows = [];
  for (let i = 0; i < routePoints.length; i += 3) {
    rows.push(routePoints.slice(i, i + 3));
  }

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleDeleteCard = (cityId) => {
    removeRoutePoint(cityId);
  };

  const handleOpenRoutePoint = (cityId) => {
    if (!isEditing) {
      navigate(`/route-point/${cityId}`);
    }
  };

  const handleAddPoint = (insertIndex) => {
    addRoutePointAtIndex(insertIndex);
  };

  const handleBookRoute = async () => {
    setBookingError(null);
    setIsBooking(true);

    try {
      // Собираем даты из маршрута (берём из первого и последнего города)
      const allBookings = [];
      let globalStartDate = null;
      let globalEndDate = null;

      // Формируем bookings из selectedHotelsByCity
      for (const cityId of Object.keys(selectedHotelsByCity)) {
        const hotelData = selectedHotelsByCity[cityId];

        if (hotelData.roomId && hotelData.startDate && hotelData.endDate) {
          allBookings.push({
            room_id: hotelData.roomId,
            start_date: hotelData.startDate,
            end_date: hotelData.endDate,
          });

          // Определяем глобальные даты маршрута
          if (!globalStartDate || hotelData.startDate < globalStartDate) {
            globalStartDate = hotelData.startDate;
          }
          if (!globalEndDate || hotelData.endDate > globalEndDate) {
            globalEndDate = hotelData.endDate;
          }
        }
      }

      // Если нет бронирований отелей, используем текущие даты
      if (!globalStartDate || !globalEndDate) {
        globalStartDate = new Date().toISOString().split('T')[0];
        globalEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      // Собираем trip_idea из названий городов
      const tripIdea = routePoints
        .map((city) => city.name || city.title || city.cityName)
        .filter(Boolean)
        .join(' → ');

      const requestBody = {
        start_date: globalStartDate,
        end_date: globalEndDate,
        travelers_count: travelersCount || 1,
        trip_idea: tripIdea || "Маршрут по городам",
        bookings: allBookings,
      };

      console.log('Sending route creation request:', requestBody);

      const response = await api.post('/routes', requestBody);
      console.log('Route created successfully:', response);

      // Показываем успешное сообщение и перенаправляем
      alert('Маршрут успешно забронирован!');
      navigate('/my-routes');
    } catch (error) {
      console.error('Booking failed:', error);
      setBookingError(error.message || 'Не удалось забронировать маршрут');
    } finally {
      setIsBooking(false);
    }
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
          {rows.map((row, rowIndex) => {
            const isBottomRow = rowIndex % 2 === 1;
            const rowStartIndex = rowIndex * 3;

            return (
              <div
                key={`row-${rowIndex}`}
                className={`route-row ${isBottomRow ? "route-row--bottom" : ""}`}
              >
                {isBottomRow && (
                  <div className="route-row__item">
                    <div className="route-connector-block route-connector-block--edge">
                      {isEditing && (
                        <button
                          className="add-point-btn"
                          type="button"
                          onClick={() => handleAddPoint(rowStartIndex)}
                        >
                          + добавить точку
                        </button>
                      )}
                      <span className="route-connector"></span>
                    </div>
                  </div>
                )}

                {row.map((city, index) => {
                  const cityName = city.name || city.cityName || city.title;

                  return (
                    <div className="route-row__item" key={city.id}>
                      <div className="route-card-wrapper">
                        <button
                          type="button"
                          className="route-card route-card--clickable"
                          onClick={() => handleOpenRoutePoint(city.id)}
                          aria-label={`Открыть точку маршрута ${city.name}`}
                          style={{
                            backgroundImage: city.image_url ? `url(${city.image_url})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
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
                          <span className="city-label__text">{cityName}</span>
                          <span className="city-label__line"></span>
                        </div>
                      </div>

                      {index < row.length - 1 && (
                        <div className="route-connector-block">
                          {isEditing && (
                            <button
                              className="add-point-btn"
                              type="button"
                              onClick={() => handleAddPoint(rowStartIndex + index + 1)}
                            >
                              + добавить точку
                            </button>
                          )}
                          <span
                            className={`route-connector ${index === row.length - 2
                              ? "route-connector--accent"
                              : ""
                              }`}
                          ></span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!isBottomRow && (
                  <div className="route-row__item">
                    <div className="route-connector-block">
                      {isEditing && (
                        <button
                          className="add-point-btn"
                          type="button"
                          onClick={() => handleAddPoint(rowStartIndex + row.length)}
                        >
                          + добавить точку
                        </button>
                      )}
                      <span className="route-connector"></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

            <button
              className="book-route-btn"
              type="button"
              onClick={handleBookRoute}
              disabled={isBooking}
            >
              {isBooking ? "Бронирование..." : "Забронировать"}
            </button>
          </div>

          {bookingError && (
            <p className="route-booking-error">{bookingError}</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default GeneratedRoutePage;
