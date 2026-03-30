import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Header from "../components/Header";
import { PREVIEW_HOTELS_CATALOG } from "../data/previewHotelsCatalog";
import {
  BOOKING_STATUS,
  HOTEL_BOOKINGS_MOCK,
} from "../data/hotelBookingsMock";
import "../styles/HotelBookingsPage.css";

const FILTERS = [
  { id: BOOKING_STATUS.PROCESSING, label: "в обработке" },
  { id: BOOKING_STATUS.COMPLETED, label: "завершённые" },
  { id: BOOKING_STATUS.CANCELLED, label: "отмененные" },
];

function HotelBookingsPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const numericHotelId = Number(hotelId);
  const hotelNameFromState = location.state?.hotelName;
  const isManagerBookingsView = location.state?.bookingsViewer === "manager";

  const hotelDisplayName = useMemo(() => {
    if (typeof hotelNameFromState === "string" && hotelNameFromState.trim())
      return hotelNameFromState.trim();
    const fromCatalog = PREVIEW_HOTELS_CATALOG.find(
      (h) => h.id === numericHotelId
    );
    return fromCatalog?.name ?? "отель";
  }, [hotelNameFromState, numericHotelId]);

  const [activeFilter, setActiveFilter] = useState(BOOKING_STATUS.PROCESSING);
  const [search, setSearch] = useState("");
  const [allBookings, setAllBookings] = useState(() =>
    HOTEL_BOOKINGS_MOCK.map((b) => ({
      ...b,
      clientPhone: b.clientPhone ?? "",
      meetingPlace: b.meetingPlace ?? "",
      meetingNotes: b.meetingNotes ?? "",
      greeterName: b.greeterName ?? "",
      greeterPhone: b.greeterPhone ?? "",
    }))
  );

  const bookings = useMemo(() => {
    return allBookings.filter((b) => b.hotelId === numericHotelId);
  }, [allBookings, numericHotelId]);

  const confirmBooking = (bookingId) => {
    setAllBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: BOOKING_STATUS.COMPLETED } : b
      )
    );
  };

  const cancelBooking = (bookingId) => {
    setAllBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: BOOKING_STATUS.CANCELLED } : b
      )
    );
  };

  const [meetingBookingId, setMeetingBookingId] = useState(null);
  const [meetingGreeterName, setMeetingGreeterName] = useState("");
  const [meetingGreeterPhone, setMeetingGreeterPhone] = useState("");

  const meetingBooking = useMemo(
    () => allBookings.find((b) => b.id === meetingBookingId) ?? null,
    [allBookings, meetingBookingId]
  );

  const openMeetingModal = (booking) => {
    setMeetingBookingId(booking.id);
    setMeetingGreeterName(booking.greeterName ?? "");
    setMeetingGreeterPhone(booking.greeterPhone ?? "");
  };

  const closeMeetingModal = () => {
    setMeetingBookingId(null);
    setMeetingGreeterName("");
    setMeetingGreeterPhone("");
  };

  const saveMeeting = () => {
    if (!meetingBookingId) return;
    setAllBookings((prev) =>
      prev.map((b) =>
        b.id === meetingBookingId
          ? {
              ...b,
              greeterName: meetingGreeterName.trim(),
              greeterPhone: meetingGreeterPhone.trim(),
            }
          : b
      )
    );
    closeMeetingModal();
  };

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (b.status !== activeFilter) return false;
      if (!q) return true;
      const hay = `${b.bookingNo} ${b.client} ${b.roomType}`.toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, activeFilter, search]);

  const goBack = () => {
    navigate("/");
  };

  return (
    <div className="hotel-bookings-page">
      <Header />

      <main className="hotel-bookings-page__content">
        <button
          type="button"
          className="hotel-bookings-page__back"
          onClick={goBack}
        >
          {isManagerBookingsView ? "← к отелям" : "← к управлению отелями"}
        </button>

        <h1 className="hotel-bookings-page__title">
          Бронирования «{hotelDisplayName}»
        </h1>

        <input
          type="search"
          className="hotel-bookings-page__search"
          placeholder="ПОИСК"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Поиск по бронированиям"
        />

        <div className="hotel-bookings-page__filters" role="tablist" aria-label="Статус брони">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={activeFilter === f.id}
              className={
                activeFilter === f.id
                  ? "hotel-bookings-page__filter hotel-bookings-page__filter--active"
                  : "hotel-bookings-page__filter"
              }
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <section className="hotel-bookings-page__list" aria-live="polite">
          {filteredBookings.length === 0 ? (
            <p className="hotel-bookings-page__empty">Нет бронирований в этой категории.</p>
          ) : (
            filteredBookings.map((b) => (
              <article key={b.id} className="hotel-bookings-card">
                <div className="hotel-bookings-card__main">
                  <div className="hotel-bookings-card__info">
                    <p className="hotel-bookings-card__line">
                      бронь №{b.bookingNo}
                    </p>
                    <p className="hotel-bookings-card__line">
                      клиент: {b.client}
                    </p>
                    <p className="hotel-bookings-card__line">{b.roomType}</p>
                    <p className="hotel-bookings-card__line">
                      заезд {b.checkIn}
                    </p>
                    <p className="hotel-bookings-card__line">
                      выезд {b.checkOut}
                    </p>
                  </div>
                  {!isManagerBookingsView && (
                    <button
                      type="button"
                      className="hotel-bookings-card__details-btn"
                      onClick={() => openMeetingModal(b)}
                    >
                      детали встречи
                    </button>
                  )}
                </div>
                {!isManagerBookingsView && b.status === BOOKING_STATUS.PROCESSING && (
                  <div className="hotel-bookings-card__actions">
                    <button
                      type="button"
                      className="hotel-bookings-card__confirm"
                      onClick={() => confirmBooking(b.id)}
                    >
                      подтвердить
                    </button>
                    <button
                      type="button"
                      className="hotel-bookings-card__reject"
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
      </main>

      {meetingBooking && (
        <div
          className="hotel-meeting-modal__backdrop"
          role="presentation"
          onClick={closeMeetingModal}
        >
          <section
            className="hotel-meeting-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Информация о встрече"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="hotel-meeting-modal__close-btn"
              onClick={closeMeetingModal}
              aria-label="Закрыть"
            >
              <X className="hotel-meeting-modal__close-icon" />
            </button>

            <h2 className="hotel-meeting-modal__title">
              <span className="hotel-meeting-modal__title-line">
                Информация о встрече
              </span>
              <span className="hotel-meeting-modal__title-line">
                по бронированию №{meetingBooking.bookingNo}
              </span>
            </h2>

            <div className="hotel-meeting-modal__read">
              <p className="hotel-meeting-modal__line">
                <span className="hotel-meeting-modal__key">Клиент:</span>{" "}
                {meetingBooking.client}
              </p>
              <p className="hotel-meeting-modal__line">
                <span className="hotel-meeting-modal__key">
                  Номер телефона клиента:
                </span>{" "}
                {meetingBooking.clientPhone ?? "—"}
              </p>
              <p className="hotel-meeting-modal__line">
                <span className="hotel-meeting-modal__key">Место встречи:</span>{" "}
                {meetingBooking.meetingPlace ?? "—"}
              </p>
              <p className="hotel-meeting-modal__line">
                <span className="hotel-meeting-modal__key">Дополнительно:</span>{" "}
                {meetingBooking.meetingNotes ?? "—"}
              </p>
            </div>

            <label className="hotel-meeting-modal__field">
              <span className="hotel-meeting-modal__label">Встречающий:</span>
              <input
                type="text"
                className="hotel-meeting-modal__input"
                value={meetingGreeterName}
                onChange={(e) => setMeetingGreeterName(e.target.value)}
              />
            </label>

            <label className="hotel-meeting-modal__field">
              <span className="hotel-meeting-modal__label">
                Номер телефона встречающего:
              </span>
              <input
                type="text"
                className="hotel-meeting-modal__input"
                value={meetingGreeterPhone}
                onChange={(e) => setMeetingGreeterPhone(e.target.value)}
                inputMode="tel"
              />
            </label>

            <button
              type="button"
              className="hotel-meeting-modal__save-btn"
              onClick={saveMeeting}
            >
              Сохранить встречу
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default HotelBookingsPage;
