import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PencilLine, X } from "lucide-react";
import Header from "../components/Header";
import { PREVIEW_HOTELS_CATALOG } from "../data/previewHotelsCatalog";
import "../styles/HotelManagementFigmaPreviewPage.css";

const initialHotels = PREVIEW_HOTELS_CATALOG.map((h) => ({ ...h }));

const emptyForm = {
  name: "",
  description: "",
  email: "",
  address: "",
};

function stripAddressPrefix(addr) {
  if (!addr) return "";
  return addr.replace(/^адрес:\s*/i, "").trim();
}

function withAddressPrefix(line) {
  const t = (line || "").trim();
  if (!t) return "адрес не указан";
  if (/^адрес:/i.test(t)) return t;
  return `адрес: ${t}`;
}

function HotelManagementFigmaPreviewPage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState(initialHotels);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [infoHotelId, setInfoHotelId] = useState(null);
  const [infoEditing, setInfoEditing] = useState(false);
  const [infoDraft, setInfoDraft] = useState(emptyForm);

  const infoHotel = useMemo(
    () => hotels.find((h) => h.id === infoHotelId) || null,
    [hotels, infoHotelId]
  );

  const openAddModal = () => {
    setForm(emptyForm);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openInfoModal = (hotel) => {
    setInfoHotelId(hotel.id);
    setInfoEditing(false);
    setInfoDraft({
      name: hotel.name,
      description: hotel.description || "",
      email: hotel.email || "",
      address: stripAddressPrefix(hotel.address),
    });
  };

  const closeInfoModal = () => {
    setInfoHotelId(null);
    setInfoEditing(false);
    setInfoDraft(emptyForm);
  };

  const startInfoEdit = () => {
    if (!infoHotel) return;
    setInfoDraft({
      name: infoHotel.name,
      description: infoHotel.description || "",
      email: infoHotel.email || "",
      address: stripAddressPrefix(infoHotel.address),
    });
    setInfoEditing(true);
  };

  const cancelInfoEdit = () => {
    if (!infoHotel) return;
    setInfoDraft({
      name: infoHotel.name,
      description: infoHotel.description || "",
      email: infoHotel.email || "",
      address: stripAddressPrefix(infoHotel.address),
    });
    setInfoEditing(false);
  };

  const saveInfoEdit = () => {
    if (infoHotelId == null) return;
    const name = infoDraft.name.trim() || "без названия";
    const description = infoDraft.description.trim() || "описание не указано";
    const email = infoDraft.email.trim() || "email не указан";
    const address = withAddressPrefix(infoDraft.address);

    setHotels((prev) =>
      prev.map((h) =>
        h.id === infoHotelId
          ? { ...h, name, description, email, address }
          : h
      )
    );
    setInfoEditing(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleInfoDraftChange = (event) => {
    const { name, value } = event.target;
    setInfoDraft((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveNewHotel = () => {
    const preparedName = form.name.trim() || "новый отель";
    const preparedAddress = form.address.trim() || "адрес не указан";
    const preparedEmail = form.email.trim() || "email не указан";
    const preparedDescription =
      form.description.trim() || "описание не указано";

    setHotels((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: preparedName,
        description: preparedDescription,
        address: `адрес: ${preparedAddress}`,
        email: preparedEmail,
      },
    ]);

    setForm(emptyForm);
    setIsAddModalOpen(false);
  };

  return (
    <div className="hotel-management-preview">
      <Header />

      <main className="hotel-management-preview__content">
        <h1 className="hotel-management-preview__title">Управление отелями</h1>

        <section className="hotel-management-preview__list" aria-label="Список отелей">
          {hotels.map((hotel) => (
            <article key={hotel.id} className="hotel-management-card">
              <div className="hotel-management-card__left">
                <div className="hotel-management-card__image" aria-hidden="true" />

                <div className="hotel-management-card__meta">
                  <h2 className="hotel-management-card__name">{hotel.name}</h2>
                  <p className="hotel-management-card__address">{hotel.address}</p>
                  {hotel.email && (
                    <p className="hotel-management-card__email">email: {hotel.email}</p>
                  )}
                </div>
              </div>

              <div className="hotel-management-card__actions">
                <button
                  type="button"
                  className="hotel-management-card__btn"
                  onClick={() =>
                    navigate(`/hotels/${hotel.id}/bookings`, {
                      state: { hotelName: hotel.name, bookingsViewer: "admin" },
                    })
                  }
                >
                  брони
                </button>
                <button
                  type="button"
                  className="hotel-management-card__btn"
                  onClick={() => openInfoModal(hotel)}
                >
                  информация
                </button>
              </div>
            </article>
          ))}
        </section>

        <button
          type="button"
          className="hotel-management-preview__add-btn"
          onClick={openAddModal}
        >
          + добавить отель
        </button>
      </main>

      {isAddModalOpen && (
        <div
          className="hotel-management-modal__backdrop"
          role="presentation"
          onClick={closeAddModal}
        >
          <section
            className="hotel-management-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Добавление отеля"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="hotel-management-modal__header">
              <h2 className="hotel-management-modal__title">Новый отель</h2>
              <button
                type="button"
                className="hotel-management-modal__close-btn"
                onClick={closeAddModal}
                aria-label="Закрыть"
              >
                <X className="hotel-management-modal__close-icon" />
              </button>
            </header>

            <div className="hotel-management-modal__body">
              <label className="hotel-management-modal__field">
                <span className="hotel-management-modal__label">Название</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="hotel-management-modal__input"
                />
              </label>

              <label className="hotel-management-modal__field">
                <span className="hotel-management-modal__label">Описание</span>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="hotel-management-modal__input"
                />
              </label>

              <label className="hotel-management-modal__field">
                <span className="hotel-management-modal__label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="hotel-management-modal__input"
                />
              </label>

              <label className="hotel-management-modal__field">
                <span className="hotel-management-modal__label">Адрес</span>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  className="hotel-management-modal__input"
                />
              </label>
            </div>

            <button
              type="button"
              className="hotel-management-modal__save-btn"
              onClick={handleSaveNewHotel}
            >
              сохранить
            </button>
          </section>
        </div>
      )}

      {infoHotel && (
        <div
          className="hotel-info-modal__backdrop"
          role="presentation"
          onClick={closeInfoModal}
        >
          <section
            className="hotel-info-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Информация об отеле"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="hotel-info-modal__close-btn"
              onClick={closeInfoModal}
              aria-label="Закрыть"
            >
              <X className="hotel-info-modal__close-icon" />
            </button>

            <h2 className="hotel-info-modal__title">{infoHotel.name}</h2>

            {infoEditing ? (
              <>
                <div className="hotel-info-modal__body">
                  <label className="hotel-info-modal__field">
                    <span className="hotel-info-modal__label">Название</span>
                    <input
                      type="text"
                      name="name"
                      value={infoDraft.name}
                      onChange={handleInfoDraftChange}
                      className="hotel-info-modal__input"
                    />
                  </label>
                  <label className="hotel-info-modal__field">
                    <span className="hotel-info-modal__label">Описание</span>
                    <input
                      type="text"
                      name="description"
                      value={infoDraft.description}
                      onChange={handleInfoDraftChange}
                      className="hotel-info-modal__input"
                    />
                  </label>
                  <label className="hotel-info-modal__field">
                    <span className="hotel-info-modal__label">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={infoDraft.email}
                      onChange={handleInfoDraftChange}
                      className="hotel-info-modal__input"
                    />
                  </label>
                  <label className="hotel-info-modal__field">
                    <span className="hotel-info-modal__label">Адрес</span>
                    <input
                      type="text"
                      name="address"
                      value={infoDraft.address}
                      onChange={handleInfoDraftChange}
                      className="hotel-info-modal__input"
                      placeholder="без префикса «адрес:», он добавится при сохранении"
                    />
                  </label>
                </div>
                <div className="hotel-info-modal__footer">
                  <button
                    type="button"
                    className="hotel-info-modal__btn hotel-info-modal__btn--secondary"
                    onClick={cancelInfoEdit}
                  >
                    отмена
                  </button>
                  <button
                    type="button"
                    className="hotel-info-modal__btn hotel-info-modal__btn--primary"
                    onClick={saveInfoEdit}
                  >
                    сохранить
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="hotel-info-modal__read">
                  <p className="hotel-info-modal__line">
                    <span className="hotel-info-modal__key">Название:</span>{" "}
                    {infoHotel.name}
                  </p>
                  <p className="hotel-info-modal__line">
                    <span className="hotel-info-modal__key">Описание:</span>{" "}
                    {infoHotel.description || "—"}
                  </p>
                  <p className="hotel-info-modal__line">
                    <span className="hotel-info-modal__key">Email:</span>{" "}
                    {infoHotel.email}
                  </p>
                  <p className="hotel-info-modal__line">
                    <span className="hotel-info-modal__key">Адрес:</span>{" "}
                    {stripAddressPrefix(infoHotel.address) || infoHotel.address}
                  </p>
                </div>
                <div className="hotel-info-modal__toolbar">
                  <button
                    type="button"
                    className="hotel-info-modal__edit-toggle"
                    onClick={startInfoEdit}
                  >
                    <PencilLine className="hotel-info-modal__edit-toggle-icon" />
                    редактировать
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default HotelManagementFigmaPreviewPage;
