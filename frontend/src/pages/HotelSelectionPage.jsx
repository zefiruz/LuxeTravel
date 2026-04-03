import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Select from "react-select";
import Header from "../components/Header";
import { useRoute } from "../context/RouteContext";
import { useCities } from "../context/CitiesContext";
import api from "../services/api";
import "../styles/HotelSelectionPage.css";

function HotelSelectionPage() {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const { routePoints, selectedHotelsByCity, setSelectedHotelForCity } = useRoute();
  const { cities } = useCities();

  // Состояние для отелей и комнат
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояние для выбранного отеля и комнаты
  const [activeHotelIndex, setActiveHotelIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Состояние для дат
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Получаем cityId из routePoints
  const cityData = useMemo(() => {
    return routePoints.find((p) => p.name === cityName || p.title === cityName);
  }, [cityName, routePoints]);

  const cityId = cityData?.id;

  // Загрузка отелей для города
  useEffect(() => {
    if (!cityId) return;

    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/cities/${cityId}/hotels`);
        setHotels(response || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [cityId]);

  // Загрузка сохранённых данных отеля
  useEffect(() => {
    if (cityId && selectedHotelsByCity[cityId]) {
      const savedData = selectedHotelsByCity[cityId];
      if (savedData.hotelId) {
        const hotelIndex = hotels.findIndex((h) => h.id === savedData.hotelId);
        if (hotelIndex >= 0) {
          setActiveHotelIndex(hotelIndex);
        }
      }
      if (savedData.roomId) {
        setSelectedRoom({ value: savedData.roomId, label: savedData.roomTitle });
      }
      if (savedData.startDate) {
        setStartDate(savedData.startDate);
      }
      if (savedData.endDate) {
        setEndDate(savedData.endDate);
      }
    }
  }, [cityId, selectedHotelsByCity, hotels]);

  // Доступные комнаты для выбранного отеля
  const roomOptions = useMemo(() => {
    const activeHotel = hotels[activeHotelIndex];
    if (!activeHotel || !activeHotel.rooms) return [];

    return activeHotel.rooms.map((room) => ({
      value: room.id,
      label: `${room.title} (до ${room.max_guests} гостей) - ${room.price_per_night}₽/ночь`,
      ...room,
    }));
  }, [hotels, activeHotelIndex]);

  const activeHotel = hotels[activeHotelIndex];
  const secondaryHotel = hotels.find((_, index) => index !== activeHotelIndex);

  const handleSelectHotel = (hotel) => {
    const hotelIndex = hotels.findIndex((h) => h.id === hotel.id);
    setActiveHotelIndex(hotelIndex >= 0 ? hotelIndex : 0);
  };

  const handleSelectSecondaryHotel = () => {
    if (!secondaryHotel) return;
    handleSelectHotel(secondaryHotel);
  };

  const handleSaveSelection = () => {
    if (!activeHotel || !cityId) return;

    const hotelData = {
      hotelId: activeHotel.id,
      hotelName: activeHotel.title,
      roomId: selectedRoom?.value || null,
      roomTitle: selectedRoom?.label || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    setSelectedHotelForCity(cityId, hotelData);
    navigate("/route-builder");
  };

  if (loading) {
    return (
      <div className="hotel-selection-page">
        <Header />
        <main className="hotel-selection-page__content">
          <div className="loading-container">Загрузка отелей...</div>
        </main>
      </div>
    );
  }

  if (error || hotels.length === 0) {
    return (
      <div className="hotel-selection-page">
        <Header />
        <main className="hotel-selection-page__content">
          <button
            type="button"
            className="hotel-selection-page__close-btn"
            onClick={() => navigate("/route-builder")}
            aria-label="Закрыть выбор отеля"
          >
            <X className="hotel-selection-page__close-icon" />
          </button>

          <h1 className="hotel-selection-page__city-title">{cityName}</h1>
          <p className="hotel-selection-page__empty">
            {error ? `Ошибка: ${error}` : "Для этого города пока нет отелей."}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="hotel-selection-page">
      <Header />

      <main className="hotel-selection-page__content">
        <button
          type="button"
          className="hotel-selection-page__close-btn"
          onClick={() => navigate("/route-builder")}
          aria-label="Закрыть выбор отеля"
        >
          <X className="hotel-selection-page__close-icon" />
        </button>

        <section className="hotel-selection-page__header">
          <div className="hotel-selection-page__title-wrap">
            <span className="hotel-selection-page__title-line" />
            <h1 className="hotel-selection-page__city-title">{cityName}</h1>
            <span className="hotel-selection-page__title-line" />
          </div>
        </section>

        <section className="hotel-selection-layout">
          <div className="hotel-selection-left">
            <div className="hotel-card hotel-card--main">
              <div className="hotel-card__image hotel-card__image--main" />
              <h2 className="hotel-card__title">{activeHotel.title}</h2>
              <button
                type="button"
                className="hotel-card__select-btn"
                onClick={() => handleSelectHotel(activeHotel)}
              >
                Выбрать
              </button>
            </div>

            {secondaryHotel && (
              <button
                type="button"
                className="hotel-card hotel-card--secondary"
                onClick={handleSelectSecondaryHotel}
                aria-label={`Выбрать отель ${secondaryHotel.title}`}
              >
                <div className="hotel-card__image hotel-card__image--secondary" />
                <span className="hotel-card__subtitle">
                  {secondaryHotel.title}
                </span>
              </button>
            )}
          </div>

          <div className="hotel-selection-right">
            <p className="hotel-selection-description hotel-selection-description--main">
              {activeHotel.description}
            </p>

            {secondaryHotel && (
              <p className="hotel-selection-description hotel-selection-description--secondary">
                {secondaryHotel.description}
              </p>
            )}

            {/* Селектор комнаты */}
            {roomOptions.length > 0 && (
              <div className="hotel-selection__room-selector">
                <label className="hotel-selection__label">Тип номера</label>
                <Select
                  options={roomOptions}
                  value={selectedRoom}
                  onChange={setSelectedRoom}
                  placeholder="Выберите тип номера..."
                  isSearchable={true}
                  isClearable={true}
                  noOptionsMessage={() => "Нет доступных номеров"}
                  className="hotel-selection__select"
                  classNamePrefix="react-select"
                />
              </div>
            )}

            {/* Календарь для выбора дат */}
            <div className="hotel-selection__dates">
              <label className="hotel-selection__label">Даты проживания</label>
              <div className="hotel-selection__date-row">
                <input
                  className="hotel-selection__date-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <input
                  className="hotel-selection__date-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
              {startDate && endDate && new Date(startDate) > new Date(endDate) && (
                <p className="hotel-selection__error">
                  Дата заезда не может быть позже даты выезда
                </p>
              )}
            </div>

            {/* Кнопка сохранения */}
            <button
              type="button"
              className="hotel-selection__save-btn"
              onClick={handleSaveSelection}
              disabled={!selectedRoom || !startDate || !endDate}
            >
              Сохранить выбор
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HotelSelectionPage;
