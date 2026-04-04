import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import adminService from "../services/admin";
import "../styles/AdminRouteDetailsPage.css";

function AdminRouteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("client"); // client | bookings | route

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const data = await adminService.getRoute(id);
        setRoute(data);
      } catch (err) {
        setError("Не удалось загрузить маршрут");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  const handleDecision = async (status) => {
    try {
      setDecisionLoading(true);
      await adminService.updateRouteStatus(id, status);
      setRoute((prev) => ({ ...prev, status: { title: status } }));
    } catch (err) {
      alert("Ошибка при обновлении статуса");
      console.error(err);
    } finally {
      setDecisionLoading(false);
    }
  };

  const shortId = (id) => (id ? String(id).slice(0, 8) : "");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  };

  const statusLabel = (s) => {
    if (!s) return "—";
    const map = { draft: "Черновик", confirmed: "Подтверждён", completed: "Завершён" };
    return map[s] || s;
  };

  const statusClass = (s) => {
    const map = { draft: "status--draft", confirmed: "status--confirmed", completed: "status--completed" };
    return map[s] || "";
  };

  if (loading) return <div className="admin-route-details-page"><AdminHeader /><main className="admin-route-details-page__content"><p className="admin-route-details-page__loading">Загрузка...</p></main></div>;
  if (error) return <div className="admin-route-details-page"><AdminHeader /><main className="admin-route-details-page__content"><p className="admin-route-details-page__error">{error}</p></main></div>;
  if (!route) return <div className="admin-route-details-page"><AdminHeader /><main className="admin-route-details-page__content"><p className="admin-route-details-page__empty">Маршрут не найден</p></main></div>;

  const userInfo = route.user?.info || {};
  const bookings = route.bookings || [];

  return (
    <div className="admin-route-details-page">
      <AdminHeader />

      <main className="admin-route-details-page__content">
        {/* Шапка маршрута */}
        <section className="route-header">
          <div className="route-header__left">
            <button
              type="button"
              className="route-header__back"
              onClick={() => navigate("/admin/routes")}
            >
              ←
            </button>
            <div>
              <h1 className="route-header__title">
                Маршрут {shortId(route.id)}
              </h1>
              <p className="route-header__meta">
                Создан: {formatDate(route.created_at)} &nbsp;|&nbsp; Статус:{" "}
                <span className={`status-badge ${statusClass(route.status?.title)}`}>
                  {statusLabel(route.status?.title)}
                </span>
              </p>
            </div>
          </div>

          <div className="route-header__actions">
            {route.status?.title !== "confirmed" && (
              <button
                type="button"
                className="action-btn action-btn--confirm"
                onClick={() => handleDecision("confirmed")}
                disabled={decisionLoading}
              >
                {decisionLoading ? "..." : "Подтвердить"}
              </button>
            )}
            {route.status?.title !== "completed" && (
              <button
                type="button"
                className="action-btn action-btn--complete"
                onClick={() => handleDecision("completed")}
                disabled={decisionLoading}
              >
                {decisionLoading ? "..." : "Завершить"}
              </button>
            )}
            {route.status?.title === "confirmed" && (
              <span className="status-badge status--confirmed">Подтверждён</span>
            )}
            {route.status?.title === "completed" && (
              <span className="status-badge status--completed">Завершён</span>
            )}
          </div>
        </section>

        {/* Табы */}
        <section className="route-tabs">
          <button
            type="button"
            className={`route-tabs__tab ${activeTab === "client" ? "active" : ""}`}
            onClick={() => setActiveTab("client")}
          >
            Клиент
          </button>
          <button
            type="button"
            className={`route-tabs__tab ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            Бронирования ({bookings.length})
          </button>
          <button
            type="button"
            className={`route-tabs__tab ${activeTab === "route" ? "active" : ""}`}
            onClick={() => setActiveTab("route")}
          >
            Информация о маршруте
          </button>
        </section>

        {/* Содержимое табов */}
        <section className="route-tab-content">
          {/* === КЛИЕНТ === */}
          {activeTab === "client" && (
            <div className="client-card">
              <div className="client-card__avatar">
                <div className="client-card__avatar-head" />
                <div className="client-card__avatar-body" />
              </div>

              <div className="client-card__info">
                <h2 className="client-card__name">
                  {userInfo.last_name || ""} {userInfo.first_name || ""} {userInfo.middle_name || ""}
                </h2>

                <div className="client-card__details">
                  <div className="client-card__detail">
                    <span className="client-card__detail-label">Email</span>
                    <span className="client-card__detail-value">{route.user?.email || "—"}</span>
                  </div>
                  <div className="client-card__detail">
                    <span className="client-card__detail-label">Телефон</span>
                    <span className="client-card__detail-value">{userInfo.phone || "—"}</span>
                  </div>
                  <div className="client-card__detail">
                    <span className="client-card__detail-label">Роль</span>
                    <span className="client-card__detail-value">{route.user?.role?.title || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === БРОНИРОВАНИЯ === */}
          {activeTab === "bookings" && (
            <div className="bookings-section">
              {bookings.length === 0 ? (
                <p className="bookings-section__empty">Нет бронирований</p>
              ) : (
                <div className="bookings-table">
                  <div className="bookings-table__head">
                    <span>ID брони</span>
                    <span>Статус</span>
                    <span>Город</span>
                    <span>Отель</span>
                    <span>Даты</span>
                    <span>Email отеля</span>
                  </div>

                  <div className="bookings-table__body">
                    {bookings.map((booking) => (
                      <div className="bookings-table__row" key={booking.id}>
                        <span>{shortId(booking.id)}</span>
                        <span>
                          <span className={`booking-status-badge booking-${booking.status?.title || "unknown"}`}>
                            {booking.status?.title || "—"}
                          </span>
                        </span>
                        <span>{booking.room_type?.hotel?.city?.title || "—"}</span>
                        <span>{booking.room_type?.hotel?.title || "—"}</span>
                        <span>{formatDate(booking.start_date)} — {formatDate(booking.end_date)}</span>
                        <span>{booking.room_type?.hotel?.email || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === ИНФОРМАЦИЯ О МАРШРУТЕ === */}
          {activeTab === "route" && (
            <div className="route-info-card">
              <div className="route-info-card__grid">
                <div className="route-info-card__item">
                  <span className="route-info-card__label">Дата начала</span>
                  <span className="route-info-card__value">{formatDate(route.start_date)}</span>
                </div>
                <div className="route-info-card__item">
                  <span className="route-info-card__label">Дата окончания</span>
                  <span className="route-info-card__value">{formatDate(route.end_date)}</span>
                </div>
                <div className="route-info-card__item">
                  <span className="route-info-card__label">Кол-во гостей</span>
                  <span className="route-info-card__value">{route.travelers_count ?? "—"}</span>
                </div>
                <div className="route-info-card__item">
                  <span className="route-info-card__label">ID пользователя</span>
                  <span className="route-info-card__value">{shortId(route.user_id)}</span>
                </div>
                <div className="route-info-card__item route-info-card__item--full">
                  <span className="route-info-card__label">Пожелания клиента</span>
                  <span className="route-info-card__value route-info-card__prompt">
                    {route.trip_idea || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminRouteDetailsPage;
