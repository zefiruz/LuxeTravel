import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import ManagerHeader from "../components/ManagerHeader";
import managerService from "../services/manager";
import "../styles/ManagerBookingsPage.css";

const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};

const FILTERS = [
  { id: BOOKING_STATUS.PENDING, label: "в обработке" },
  { id: BOOKING_STATUS.CONFIRMED, label: "подтверждённые" },
  { id: BOOKING_STATUS.CANCELLED, label: "отменённые" },
];

function ManagerBookingsPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const hotelNameFromState = location.state?.hotelName;

  const [activeFilter, setActiveFilter] = useState(BOOKING_STATUS.PENDING);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await managerService.getBookings();

      // Фильтруем по отелю если нужно
      let filtered = data;
      if (hotelId) {
        filtered = data.filter(b => b.room_type?.hotel?.id === hotelId);
      }

      setBookings(filtered);
    } catch (err) {
      setError("Не удалось загрузить бронирования");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await managerService.updateBookingStatus(bookingId, status);
      // Обновляем локально
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: { id: b.status.id, title: status } }
            : b
        )
      );
    } catch (err) {
      alert("Ошибка при обновлении статуса");
      console.error(err);
    }
  };

  const confirmBooking = (bookingId) => {
    updateStatus(bookingId, BOOKING_STATUS.CONFIRMED);
  };

  const cancelBooking = (bookingId) => {
    updateStatus(bookingId, BOOKING_STATUS.CANCELLED);
  };

  // Модалка встречи
  const [meetingBookingId, setMeetingBookingId] = useState(null);

  const meetingBooking = useMemo(
    () => bookings.find(b => b.id === meetingBookingId) ?? null,
    [bookings, meetingBookingId]
  );

  const openMeetingModal = (booking) => {
    setMeetingBookingId(booking.id);
  };

  const closeMeetingModal = () => {
    setMeetingBookingId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter(b => {
      if (b.status?.title !== activeFilter) return false;
      if (!q) return true;
      const hay = `${b.id} ${b.room_type?.title} ${b.room_type?.hotel?.title || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, activeFilter, search]);

  const goBack = () => {
    navigate("/manager/hotels");
  };

  const hotelDisplayName = hotelNameFromState || "Отель";

  return (
    <div className="manager-bookings-page">
      <ManagerHeader />

      <main className="manager-bookings-page__content">
        <button
          type="button"
          className="manager-bookings-page__back"
          onClick={goBack}
        >
          ← к отелям
        </button>

        <h1 className="manager-bookings-page__title">
          Бронирования «{hotelDisplayName}»
        </h1>

        {loading && <p className="manager-bookings-page__loading">Загрузка...</p>}
        {error && <p className="manager-bookings-page__error">{error}</p>}

        {!loading && !error && (
          <>
            <input
              type="search"
              className="manager-bookings-page__search"
              placeholder="ПОИСК"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Поиск по бронированиям"
            />

            <div className="manager-bookings-page__filters" role="tablist" aria-label="Статус брони">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === f.id}
                  className={
                    activeFilter === f.id
                      ? "manager-bookings-page__filter manager-bookings-page__filter--active"
                      : "manager-bookings-page__filter"
                  }
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <section className="manager-bookings-page__list" aria-live="polite">
              {filteredBookings.length === 0 ? (
                <p className="manager-bookings-page__empty">Нет бронирований в этой категории.</p>
              ) : (
                filteredBookings.map(b => (
                  <article key={b.id} className="manager-bookings-card">
                    <div className="manager-bookings-card__main">
                      <div className="manager-bookings-card__info">
                        <p className="manager-bookings-card__line">
                          бронь №{b.id.slice(0, 8)}
                        </p>
                        <p className="manager-bookings-card__line">
                          номер: {b.room_type?.title || "—"}
                        </p>
                        <p className="manager-bookings-card__line">
                          отель: {b.room_type?.hotel?.title || hotelDisplayName}
                        </p>
                        <p className="manager-bookings-card__line">
                          заезд {formatDate(b.start_date)}
                        </p>
                        <p className="manager-bookings-card__line">
                          выезд {formatDate(b.end_date)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="manager-bookings-card__details-btn"
                        onClick={() => openMeetingModal(b)}
                      >
                        детали
                      </button>
                    </div>
                    {b.status?.title === BOOKING_STATUS.PENDING && (
                      <div className="manager-bookings-card__actions">
                        <button
                          type="button"
                          className="manager-bookings-card__confirm"
                          onClick={() => confirmBooking(b.id)}
                        >
                          подтвердить
                        </button>
                        <button
                          type="button"
                          className="manager-bookings-card__reject"
                          onClick={() => cancelBooking(b.id)}
                        >
                          отменить
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>

      {meetingBooking && (
        <div
          className="manager-meeting-modal__backdrop"
          role="presentation"
          onClick={closeMeetingModal}
        >
          <section
            className="manager-meeting-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Информация о бронировании"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="manager-meeting-modal__close-btn"
              onClick={closeMeetingModal}
              aria-label="Закрыть"
            >
              <X className="manager-meeting-modal__close-icon" />
            </button>

            <h2 className="manager-meeting-modal__title">
              <span className="manager-meeting-modal__title-line">
                Бронирование №{meetingBooking.id.slice(0, 8)}
              </span>
            </h2>

            <div className="manager-meeting-modal__read">
              <p className="manager-meeting-modal__line">
                <span className="manager-meeting-modal__key">Номер:</span>{" "}
                {meetingBooking.room_type?.title || "—"}
              </p>
              <p className="manager-meeting-modal__line">
                <span className="manager-meeting-modal__key">Отель:</span>{" "}
                {meetingBooking.room_type?.hotel?.title || "—"}
              </p>
              <p className="manager-meeting-modal__line">
                <span className="manager-meeting-modal__key">Заезд:</span>{" "}
                {formatDate(meetingBooking.start_date)}
              </p>
              <p className="manager-meeting-modal__line">
                <span className="manager-meeting-modal__key">Выезд:</span>{" "}
                {formatDate(meetingBooking.end_date)}
              </p>
              <p className="manager-meeting-modal__line">
                <span className="manager-meeting-modal__key">Статус:</span>{" "}
                {meetingBooking.status?.title || "—"}
              </p>
            </div>

            <button
              type="button"
              className="manager-meeting-modal__close-full-btn"
              onClick={closeMeetingModal}
            >
              Закрыть
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default ManagerBookingsPage;
