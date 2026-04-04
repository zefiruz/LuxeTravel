import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ManagerHeader from "../components/ManagerHeader";
import managerService from "../services/manager";
import "../styles/ManagerHotelsPage.css";

function ManagerHotelsPage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [hotelBookings, setHotelBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Модалка редактирования отеля
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [editingHotelTitle, setEditingHotelTitle] = useState("");
  const [editingHotelEmail, setEditingHotelEmail] = useState("");
  const [editingHotelAddress, setEditingHotelAddress] = useState("");
  const [editingHotelDescription, setEditingHotelDescription] = useState("");
  const [editingHotelSaving, setEditingHotelSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsData = await managerService.getBookings();

      // Группируем бронирования по отелям
      const hotelsMap = {};
      const hotelBookingsMap = {};

      bookingsData.forEach(booking => {
        const hotel = booking.room_type?.hotel;
        if (!hotel) return;

        const hotelId = hotel.id;
        if (!hotelsMap[hotelId]) {
          hotelsMap[hotelId] = {
            id: hotelId,
            title: hotel.title,
            address: hotel.address || "—",
            email: hotel.email || "—",
            description: hotel.description || "—",
            city: hotel.city?.title || "—",
          };
          hotelBookingsMap[hotelId] = [];
        }
        hotelBookingsMap[hotelId].push(booking);
      });

      setHotels(Object.values(hotelsMap));
      setHotelBookings(hotelBookingsMap);
    } catch (err) {
      setError("Не удалось загрузить отели");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookings = (hotel) => {
    navigate(`/manager/hotels/${hotel.id}/bookings`, {
      state: { hotelName: hotel.title },
    });
  };

  const openEditHotelModal = (hotel) => {
    setEditingHotelId(hotel.id);
    setEditingHotelTitle(hotel.title || "");
    setEditingHotelEmail(hotel.email || "");
    setEditingHotelAddress(hotel.address || "");
    setEditingHotelDescription(hotel.description || "");
  };

  const closeEditHotelModal = () => {
    setEditingHotelId(null);
    setEditingHotelTitle("");
    setEditingHotelEmail("");
    setEditingHotelAddress("");
    setEditingHotelDescription("");
  };

  const saveEditHotel = async () => {
    if (!editingHotelId) return;
    try {
      setEditingHotelSaving(true);
      const payload = {
        title: editingHotelTitle.trim(),
        email: editingHotelEmail.trim(),
        address: editingHotelAddress.trim(),
        description: editingHotelDescription.trim(),
      };
      const result = await managerService.updateHotel(editingHotelId, payload);
      setHotels(prev =>
        prev.map(h =>
          h.id === editingHotelId
            ? {
              ...h,
              title: editingHotelTitle.trim(),
              email: editingHotelEmail.trim(),
              address: editingHotelAddress.trim(),
              description: editingHotelDescription.trim(),
            }
            : h
        )
      );
      closeEditHotelModal();
    } catch (err) {
      alert("Ошибка при сохранении данных отеля");
      console.error(err);
    } finally {
      setEditingHotelSaving(false);
    }
  };

  const editingHotel = hotels.find(h => h.id === editingHotelId);

  return (
    <div className="manager-hotels-page">
      <ManagerHeader />
      <main className="manager-hotels-page__content">
        <h1 className="manager-hotels-page__title">Мои отели</h1>

        {loading && <p className="manager-hotels-page__loading">Загрузка...</p>}
        {error && <p className="manager-hotels-page__error">{error}</p>}

        {!loading && !error && (
          <div className="manager-hotels-list">
            {hotels.length === 0 ? (
              <p className="manager-hotels-page__empty">У вас пока нет отелей</p>
            ) : (
              hotels.map((hotel) => (
                <article key={hotel.id} className="manager-hotel-card">
                  <div className="manager-hotel-card__info">
                    <h2 className="manager-hotel-card__name">{hotel.title}</h2>
                    <p className="manager-hotel-card__city">{hotel.city}</p>
                    <p className="manager-hotel-card__address">{hotel.address}</p>
                    {hotel.email && (
                      <p className="manager-hotel-card__email">email: {hotel.email}</p>
                    )}
                    <p className="manager-hotel-card__bookings-count">
                      бронирований: {hotelBookings[hotel.id]?.length || 0}
                    </p>
                  </div>
                  <div className="manager-hotel-card__buttons">
                    <button
                      type="button"
                      className="manager-hotel-card__edit-btn"
                      onClick={() => openEditHotelModal(hotel)}
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      className="manager-hotel-card__btn"
                      onClick={() => handleOpenBookings(hotel)}
                    >
                      Бронирования
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </main>

      {editingHotel && (
        <div
          className="manager-hotel-edit-modal__backdrop"
          role="presentation"
          onClick={closeEditHotelModal}
        >
          <section
            className="manager-hotel-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Редактировать отель"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="manager-hotel-edit-modal__close-btn"
              onClick={closeEditHotelModal}
              aria-label="Закрыть"
            >
              <X className="manager-hotel-edit-modal__close-icon" />
            </button>

            <h2 className="manager-hotel-edit-modal__title">
              <span className="manager-hotel-edit-modal__title-line">
                Редактировать «{editingHotel.title}»
              </span>
            </h2>

            <label className="manager-hotel-edit-modal__field">
              <span className="manager-hotel-edit-modal__label">Название:</span>
              <input
                type="text"
                className="manager-hotel-edit-modal__input"
                value={editingHotelTitle}
                onChange={e => setEditingHotelTitle(e.target.value)}
              />
            </label>

            <label className="manager-hotel-edit-modal__field">
              <span className="manager-hotel-edit-modal__label">Email:</span>
              <input
                type="email"
                className="manager-hotel-edit-modal__input"
                value={editingHotelEmail}
                onChange={e => setEditingHotelEmail(e.target.value)}
              />
            </label>

            <label className="manager-hotel-edit-modal__field">
              <span className="manager-hotel-edit-modal__label">Адрес:</span>
              <input
                type="text"
                className="manager-hotel-edit-modal__input"
                value={editingHotelAddress}
                onChange={e => setEditingHotelAddress(e.target.value)}
              />
            </label>

            <label className="manager-hotel-edit-modal__field">
              <span className="manager-hotel-edit-modal__label">Описание:</span>
              <textarea
                className="manager-hotel-edit-modal__textarea"
                value={editingHotelDescription}
                onChange={e => setEditingHotelDescription(e.target.value)}
                rows={4}
              />
            </label>

            <button
              type="button"
              className="manager-hotel-edit-modal__save-btn"
              onClick={saveEditHotel}
              disabled={editingHotelSaving}
            >
              {editingHotelSaving ? "Сохранение..." : "Сохранить"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default ManagerHotelsPage;
