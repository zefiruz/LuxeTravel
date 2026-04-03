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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  };

  if (loading) return <div className="admin-route-details-page"><AdminHeader /><main className="admin-route-details-page__content"><p>Загрузка...</p></main></div>;
  if (error) return <div className="admin-route-details-page"><AdminHeader /><main className="admin-route-details-page__content"><p className="admin-route-details-page__error">{error}</p></main></div>;
  if (!route) return <div className="admin-route-details-page"><AdminHeader /><main className="admin-route-details-page__content"><p>Маршрут не найден</p></main></div>;

  return (
    <div className="admin-route-details-page">
      <AdminHeader />

      <main className="admin-route-details-page__content">
        <section className="admin-route-details-page__title-block">
          <span className="admin-route-details-page__title-line" />
          <h1 className="admin-route-details-page__title">Маршрут {route.id?.slice(0, 8)}</h1>
          <span className="admin-route-details-page__title-line" />
        </section>

        <section className="admin-route-card">
          <div className="admin-route-card__top">
            <div className="admin-route-card__client">
              <h2 className="admin-route-card__client-title">Клиент</h2>

              <div className="admin-route-card__client-info">
                <div className="admin-route-card__avatar">
                  <div className="admin-route-card__avatar-head" />
                  <div className="admin-route-card__avatar-body" />
                </div>

                <div className="admin-route-card__client-text">
                  <p>ФИО: {route.user?.info?.last_name || ""} {route.user?.info?.first_name || ""} {route.user?.info?.middle_name || ""}</p>
                  <p>Телефон: {route.user?.info?.phone || "—"}</p>
                  <p>Email: {route.user?.email || "—"}</p>
                </div>
              </div>
            </div>

            <div className="admin-route-card__actions">
              {route.status?.title === "confirmed" ? (
                <div className="admin-route-card__status-pill admin-route-card__status-pill--approved">
                  Подтверждено
                </div>
              ) : route.status?.title === "completed" ? (
                <div className="admin-route-card__status-pill admin-route-card__status-pill--rejected">
                  Отклонено
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="admin-route-card__action-btn"
                    onClick={() => handleDecision("confirmed")}
                    disabled={decisionLoading}
                  >
                    {decisionLoading ? "..." : "Подтвердить"}
                  </button>

                  <button
                    type="button"
                    className="admin-route-card__action-btn"
                    onClick={() => handleDecision("completed")}
                    disabled={decisionLoading}
                  >
                    {decisionLoading ? "..." : "Отклонить"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="admin-route-card__table">
            <div className="admin-route-card__table-head">
              <span>ID брони</span>
              <span>Город</span>
              <span>Отель</span>
              <span>Даты пребывания</span>
              <span>Email отеля</span>
            </div>

            <div className="admin-route-card__table-body">
              {route.bookings?.length === 0 ? (
                <p className="admin-route-card__empty">Нет бронирований</p>
              ) : (
                route.bookings?.map((booking) => (
                  <div className="admin-route-card__table-row" key={booking.id}>
                    <span>{booking.id?.slice(0, 8)}</span>
                    <span>{booking.room_type?.hotel?.city?.title || "—"}</span>
                    <span>{booking.room_type?.hotel?.title || "—"}</span>
                    <span>{formatDate(booking.start_date)} — {formatDate(booking.end_date)}</span>
                    <span>{booking.room_type?.hotel?.email || "—"}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <button
          type="button"
          className="admin-route-details-page__back-btn"
          onClick={() => navigate("/admin/routes")}
        >
          ← Назад к списку
        </button>
      </main>
    </div>
  );
}

export default AdminRouteDetailsPage;