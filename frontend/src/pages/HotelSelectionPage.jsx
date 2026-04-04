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

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeHotelIndex, setActiveHotelIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Определяем cityId
  const cityData = useMemo(() => {
    return routePoints.find(
      (p) => p.name === cityName || p.title === cityName || p.id === cityName
    );
  }, [cityName, routePoints]);

  const cityId = cityData?.id;

  // Загрузка отелей
  useEffect(() => {
    if (!cityId) {
      setLoading(false);
      return;
    }

    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/cities/${cityId}/hotels`);

        const hotelsList = Array.isArray(response)
          ? response
          : (response?.hotels || response?.data || []);

        setHotels(hotelsList);
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

  // Восстановление сохранённых данных
  useEffect(() => {
    if (!cityId || hotels.length === 0) return;

    const savedData = selectedHotelsByCity[cityId];
    if (!savedData) return;

    if (savedData.hotelId) {
      const hotelIndex = hotels.findIndex((h) => h.id === savedData.hotelId);
      if (hotelIndex >= 0) {
        setActiveHotelIndex(hotelIndex);
      }
    }

    if (savedData.roomId) {
      setSelectedRoom({
        value: savedData.roomId,
        label: savedData.roomTitle || "",
        price_per_night: savedData.pricePerNight,
      });
    }
    if (savedData.startDate) setStartDate(savedData.startDate);
    if (savedData.endDate) setEndDate(savedData.endDate);
  }, [cityId, hotels, selectedHotelsByCity]);

  // Комнаты выбранного отеля
  const roomOptions = useMemo(() => {
    const hotel = hotels[activeHotelIndex];
    const rooms = hotel?.rooms;
    if (!Array.isArray(rooms) || rooms.length === 0) return [];

    return rooms.map((room) => ({
      value: room.id,
      label: `${room.title || "Стандарт"} (до ${room.max_guests || 2} гостей) — ${room.price_per_night || 0}₽/ночь`,
      ...room,
    }));
  }, [hotels, activeHotelIndex]);

  // Можно ли сохранить
  const canSave = selectedRoom && startDate && endDate && new Date(startDate) < new Date(endDate);

  const activeHotel = hotels[activeHotelIndex];
  const secondaryHotelIndex = hotels.length > 1 ? (activeHotelIndex + 1) % hotels.length : -1;
  const secondaryHotel = secondaryHotelIndex >= 0 ? hotels[secondaryHotelIndex] : null;

  const handleCycleToNextHotel = () => {
    if (hotels.length <= 1) return;
    setActiveHotelIndex((prev) => (prev + 1) % hotels.length);
    setSelectedRoom(null);
  };

  const handleSaveSelection = () => {
    if (!activeHotel || !cityId || !canSave) return;

    const previousData = selectedHotelsByCity[cityId];

    const roomId = selectedRoom?.value || previousData?.roomId || null;
    const roomFromHotel = roomId && Array.isArray(activeHotel.rooms)
      ? activeHotel.rooms.find((r) => r.id === roomId)
      : null;

    const hotelData = {
      hotelId: activeHotel.id,
      hotelName: activeHotel.title,
      roomId,
      roomTitle:
        selectedRoom?.label ||
        previousData?.roomTitle ||
        roomFromHotel?.title ||
        null,
      pricePerNight:
        roomFromHotel?.price_per_night ||
        selectedRoom?.price_per_night ||
        previousData?.pricePerNight ||
        null,
      startDate: startDate || previousData?.startDate || null,
      endDate: endDate || previousData?.endDate || null,
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
            aria-label="Закрыть"
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
          aria-label="Закрыть"
        >
          <X className="hotel-selection-page__close-icon" />
        </button>

        <section className="hotel-selection-page__header">
          <div className="hotel-selection-page__title-wrap">
            <span className="hotel-selection-page__title-line" />
            <h1 className="hotel-selection-page__city-title">{cityData?.title || cityName}</h1>
            <span className="hotel-selection-page__title-line" />
          </div>
        </section>

        <section className="hotel-selection-layout">
          <div className="hotel-selection-left">
            <div className="hotel-card hotel-card--main">
              {activeHotel?.img_link ? (
                <img
                  className="hotel-card__image hotel-card__image--main"
                  src={activeHotel.img_link}
                  alt={activeHotel.title}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="hotel-card__image hotel-card__image--main" />
              )}
              <h2 className="hotel-card__title">{activeHotel?.title}</h2>
            </div>

            {secondaryHotel && (
              <button
                type="button"
                className="hotel-card hotel-card--secondary"
                onClick={handleCycleToNextHotel}
                aria-label={`Следующий отель: ${secondaryHotel.title}`}
              >
                {secondaryHotel.img_link ? (
                  <img
                    className="hotel-card__image hotel-card__image--secondary"
                    src={secondaryHotel.img_link}
                    alt={secondaryHotel.title}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="hotel-card__image hotel-card__image--secondary" />
                )}
                <span className="hotel-card__subtitle">{secondaryHotel.title}</span>
              </button>
            )}
          </div>

          <div className="hotel-selection-right">
            <p className="hotel-selection-description hotel-selection-description--main">
              {activeHotel?.description || "Описание отсутствует"}
            </p>

            {/* Селектор комнаты */}
            {roomOptions.length > 0 ? (
              <div className="hotel-selection__room-selector">
                <label className="hotel-selection__label">Тип номера</label>
                <Select
                  options={roomOptions}
                  value={selectedRoom}
                  onChange={setSelectedRoom}
                  placeholder="Выберите тип номера..."
                  isSearchable
                  isClearable
                  noOptionsMessage={() => "Нет доступных номеров"}
                  className="hotel-selection__select"
                  classNamePrefix="react-select"
                />
              </div>
            ) : (
              <div className="hotel-selection__no-rooms">
                <p>Нет доступных номеров для этого отеля</p>
              </div>
            )}

            {/* Даты */}
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
              {startDate && endDate && new Date(startDate) >= new Date(endDate) && (
                <p className="hotel-selection__error">
                  Дата выезда должна быть позже даты заезда
                </p>
              )}
            </div>

            {/* Кнопка сохранения */}
            <button
              type="button"
              className="hotel-selection__save-btn"
              onClick={handleSaveSelection}
              disabled={!canSave}
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
