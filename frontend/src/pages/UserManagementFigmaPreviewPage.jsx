import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import Header from "../components/Header";
import { PREVIEW_HOTELS_CATALOG } from "../data/previewHotelsCatalog";
import "../styles/UserManagementFigmaPreviewPage.css";

const ROLES = {
  USER: "пользователь",
  MANAGER: "Менеджер",
};

const initialUsers = [
  {
    id: 1,
    email: "ivanov@mail.ru",
    fio: "Иванов Иван Иванович",
    role: ROLES.USER,
  },
  {
    id: 2,
    email: "petrov@mail.ru",
    fio: "Петров Петр Петрович",
    role: ROLES.MANAGER,
  },
];

const modalSampleHotel =
  PREVIEW_HOTELS_CATALOG.find((h) => h.name === "Отель Люкс") || PREVIEW_HOTELS_CATALOG[0];

function UserManagementFigmaPreviewPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(() => initialUsers.map((u) => ({ ...u })));
  const [hotelsModalUser, setHotelsModalUser] = useState(null);
  const [managerHotelsByUserId, setManagerHotelsByUserId] = useState({});
  const [isAddHotelModalOpen, setIsAddHotelModalOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelEmail, setNewHotelEmail] = useState("");
  const [roleDropdownUserId, setRoleDropdownUserId] = useState(null);
  const roleMenuRef = useRef(null);

  useEffect(() => {
    if (roleDropdownUserId == null) return;
    const handlePointerDown = (event) => {
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(event.target)
      ) {
        setRoleDropdownUserId(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [roleDropdownUserId]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.fio.toLowerCase().includes(q)
    );
  }, [query, users]);

  const handleRoleChange = (userId, nextRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
    );
    setRoleDropdownUserId(null);
  };

  const handleDeleteManagerHotel = (userId, hotelId) => {
    setManagerHotelsByUserId((prev) => {
      const list = prev[userId];
      if (!list) return prev;
      return {
        ...prev,
        [userId]: list.filter((h) => h.id !== hotelId),
      };
    });
  };

  const openHotelsModal = (user) => {
    setHotelsModalUser(user);
    setIsAddHotelModalOpen(false);
    setNewHotelName("");
    setNewHotelEmail("");
    setManagerHotelsByUserId((prev) => {
      if (prev[user.id]?.length) return prev;
      return {
        ...prev,
        [user.id]: [{ ...modalSampleHotel, id: `${user.id}-seed-${modalSampleHotel.id}` }],
      };
    });
  };

  const closeHotelsModal = () => {
    setHotelsModalUser(null);
    setIsAddHotelModalOpen(false);
    setNewHotelName("");
    setNewHotelEmail("");
  };

  const openAddHotelModal = () => {
    setIsAddHotelModalOpen(true);
    setNewHotelName("");
    setNewHotelEmail("");
  };

  const closeAddHotelModal = () => {
    setIsAddHotelModalOpen(false);
    setNewHotelName("");
    setNewHotelEmail("");
  };

  const pickSuggestion = (hotel) => {
    setNewHotelName(hotel.name);
    setNewHotelEmail(hotel.email);
  };

  const handleSaveAddedHotel = () => {
    const nameTrim = newHotelName.trim();
    if (!nameTrim || !hotelsModalUser) return;

    const fromCatalog = PREVIEW_HOTELS_CATALOG.find(
      (h) => h.name.toLowerCase() === nameTrim.toLowerCase()
    );
    const email =
      newHotelEmail.trim() || fromCatalog?.email || "email не указан";
    const address = fromCatalog?.address || "адрес не указан";
    const displayName = fromCatalog?.name || nameTrim;

    setManagerHotelsByUserId((prev) => {
      const current = prev[hotelsModalUser.id] || [];
      return {
        ...prev,
        [hotelsModalUser.id]: [
          ...current,
          {
            id: `added-${Date.now()}`,
            name: displayName,
            address,
            email,
          },
        ],
      };
    });

    closeAddHotelModal();
  };

  const modalUser = hotelsModalUser
    ? users.find((u) => u.id === hotelsModalUser.id) || hotelsModalUser
    : null;

  return (
    <div className="user-management-preview">
      <Header />

      <main className="user-management-preview__content">
        <h1 className="user-management-preview__title">Управление пользователями</h1>

        <input
          className="user-management-preview__search"
          placeholder="поиск аккаунта по email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <section className="user-management-preview__list" aria-label="Список пользователей">
          {filteredUsers.map((user) => (
            <article key={user.id} className="user-management-card">
              <div className="user-management-card__info">
                <p className="user-management-card__text">email: {user.email}</p>
                <p className="user-management-card__text">ФИО: {user.fio}</p>
              </div>

              <div className="user-management-card__actions">
                {user.role === ROLES.MANAGER && (
                  <button
                    type="button"
                    className="user-management-card__btn"
                    onClick={() => openHotelsModal(user)}
                  >
                    отели
                  </button>
                )}

                <div
                  className="user-management-card__role-dd"
                  ref={roleDropdownUserId === user.id ? roleMenuRef : undefined}
                >
                  <button
                    type="button"
                    className="user-management-card__role-trigger"
                    aria-expanded={roleDropdownUserId === user.id}
                    aria-haspopup="listbox"
                    aria-label="Роль пользователя"
                    onClick={() =>
                      setRoleDropdownUserId((id) =>
                        id === user.id ? null : user.id
                      )
                    }
                  >
                    <span>{user.role}</span>
                    <span className="user-management-card__role-chevron" aria-hidden="true">
                      ▼
                    </span>
                  </button>
                  {roleDropdownUserId === user.id && (
                    <ul
                      className="user-management-card__role-menu"
                      role="listbox"
                      aria-label="Выбор роли"
                    >
                      <li role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={user.role === ROLES.USER}
                          className={`user-management-card__role-option${user.role === ROLES.USER
                              ? " user-management-card__role-option--active"
                              : ""
                            }`}
                          onClick={() => handleRoleChange(user.id, ROLES.USER)}
                        >
                          {ROLES.USER}
                        </button>
                      </li>
                      <li role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={user.role === ROLES.MANAGER}
                          className={`user-management-card__role-option${user.role === ROLES.MANAGER
                              ? " user-management-card__role-option--active"
                              : ""
                            }`}
                          onClick={() =>
                            handleRoleChange(user.id, ROLES.MANAGER)
                          }
                        >
                          {ROLES.MANAGER}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      {modalUser && (
        <div
          className="user-hotels-modal__backdrop"
          role="presentation"
          onClick={closeHotelsModal}
        >
          <section
            className="user-hotels-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Отели менеджера"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="user-hotels-modal__close-btn"
              onClick={closeHotelsModal}
              aria-label="Закрыть"
            >
              <X className="user-hotels-modal__close-icon" />
            </button>
            <h2 className="user-hotels-modal__title">
              Отели менеджера {modalUser.email}
            </h2>

            <div className="user-hotels-modal__hotel-list">
              {(managerHotelsByUserId[modalUser.id] || []).map((hotel) => (
                <article key={hotel.id} className="user-hotels-modal__hotel-card">
                  <div className="user-hotels-modal__hotel-info">
                    <p className="user-hotels-modal__hotel-name">{hotel.name}</p>
                    <p className="user-hotels-modal__hotel-meta">{hotel.address}</p>
                    <p className="user-hotels-modal__hotel-meta">email: {hotel.email}</p>
                  </div>

                  <button
                    type="button"
                    className="user-hotels-modal__delete-btn"
                    onClick={() =>
                      handleDeleteManagerHotel(modalUser.id, hotel.id)
                    }
                  >
                    удалить
                  </button>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="user-hotels-modal__add-btn"
              onClick={openAddHotelModal}
            >
              добавить отель
            </button>
          </section>

          {isAddHotelModalOpen && (
            <div
              className="user-add-hotel-modal__backdrop"
              role="presentation"
              onClick={closeAddHotelModal}
            >
              <section
                className="user-add-hotel-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Добавить отель"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="user-add-hotel-modal__close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAddHotelModal();
                  }}
                  aria-label="Закрыть"
                >
                  <X className="user-add-hotel-modal__close-icon" />
                </button>
                <label className="user-add-hotel-modal__field">
                  <span className="user-add-hotel-modal__label">Название отеля</span>
                  <input
                    className="user-add-hotel-modal__input"
                    placeholder="название отеля"
                    value={newHotelName}
                    onChange={(e) => setNewHotelName(e.target.value)}
                  />
                </label>

                {(newHotelEmail || newHotelName) && (
                  <p className="user-add-hotel-modal__email-line">
                    {newHotelEmail ? `email: ${newHotelEmail}` : "Выберите отель из списка ниже"}
                  </p>
                )}

                <ul className="user-add-hotel-modal__suggestions" role="listbox">
                  {PREVIEW_HOTELS_CATALOG.map((hotel) => (
                    <li key={hotel.id} className="user-add-hotel-modal__suggestion" role="none">
                      <button
                        type="button"
                        role="option"
                        className="user-add-hotel-modal__suggestion-btn"
                        onClick={() => pickSuggestion(hotel)}
                      >
                        <span className="user-add-hotel-modal__suggestion-name">{hotel.name}</span>
                        <span className="user-add-hotel-modal__suggestion-email">{hotel.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="user-add-hotel-modal__save-btn"
                  disabled={!newHotelName.trim()}
                  onClick={handleSaveAddedHotel}
                >
                  сохранить
                </button>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserManagementFigmaPreviewPage;
