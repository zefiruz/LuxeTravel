import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import adminService from "../services/admin";
import "../styles/AdminRoutesPage.css";

function AdminRoutesPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllRoutes();
        setRoutes(data);
      } catch (err) {
        setError("Не удалось загрузить маршруты");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Удалить этот маршрут?")) return;
    try {
      await adminService.deleteRoute(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Ошибка при удалении");
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  };

  return (
    <div className="admin-routes-page">
      <AdminHeader />

      <main className="admin-routes-page__content">
        <section className="admin-routes-page__title-block">
          <span className="admin-routes-page__title-line" />
          <h1 className="admin-routes-page__title">Маршруты</h1>
          <span className="admin-routes-page__title-line" />
        </section>

        {loading && <p className="admin-routes-page__loading">Загрузка...</p>}
        {error && <p className="admin-routes-page__error">{error}</p>}

        {!loading && !error && (
          <section className="admin-routes-table">
            <div className="admin-routes-table__head">
              <span>id маршрута</span>
              <span>id клиента</span>
              <span>ФИО клиента</span>
              <span>номер телефона</span>
              <span>даты маршрута</span>
              <span></span>
            </div>

            <div className="admin-routes-table__body">
              {routes.length === 0 ? (
                <p className="admin-routes-table__empty">Маршрутов пока нет</p>
              ) : (
                routes.map((route) => (
                  <div className="admin-routes-table__row" key={route.id}>
                    <span>{route.id?.slice(0, 8) || ""}</span>
                    <span>{route.user_id?.slice(0, 8) || ""}</span>
                    <span>{route.user?.info?.first_name || ""} {route.user?.info?.last_name || ""}</span>
                    <span>{route.user?.info?.phone || ""}</span>
                    <span>{formatDate(route.start_date)} — {formatDate(route.end_date)}</span>
                    <button
                      type="button"
                      className="admin-routes-table__details-btn"
                      onClick={() => navigate(`/admin/routes/${route.id}`)}
                    >
                      подробнее...
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminRoutesPage;