import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import adminService from "../services/admin";
import "../styles/AdminRoutesPage.css";

const STATUS_OPTIONS = [
  { value: "", label: "Все" },
  { value: "draft", label: "Черновик" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "completed", label: "Завершён" },
];

function AdminRoutesPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);

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
      if (selectedRoute?.id === id) setSelectedRoute(null);
    } catch (err) {
      alert("Ошибка при удалении");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateRouteStatus(id, newStatus);
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: { title: newStatus } } : r
        )
      );
      if (selectedRoute?.id === id) {
        setSelectedRoute((prev) => ({ ...prev, status: { title: newStatus } }));
      }
    } catch (err) {
      alert("Ошибка при обновлении статуса");
      console.error(err);
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchStatus = !statusFilter || route.status?.title === statusFilter;

      const q = search.toLowerCase();
      const userInfo = route.user?.info || {};
      const fullName = `${userInfo.first_name} ${userInfo.last_name} ${userInfo.middle_name}`.toLowerCase();
      const email = (route.user?.email || "").toLowerCase();
      const matchSearch =
        !q ||
        fullName.includes(q) ||
        email.includes(q) ||
        (route.id || "").toLowerCase().includes(q) ||
        (route.user_id || "").toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [routes, search, statusFilter]);

  const shortId = (id) => (id ? String(id).slice(0, 8) : "");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  };

  const statusLabel = (status) => {
    if (!status) return "—";
    const map = { draft: "Черновик", confirmed: "Подтверждён", completed: "Завершён" };
    return map[status] || status;
  };

  const statusClass = (status) => {
    if (!status) return "";
    const map = { draft: "status--draft", confirmed: "status--confirmed", completed: "status--completed" };
    return map[status] || "";
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

        {/* Панель управления */}
        <section className="admin-routes-page__toolbar">
          <div className="admin-routes-page__search">
            <input
              type="text"
              className="admin-routes-page__search-input"
              placeholder="Поиск по имени, email, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-routes-page__filters">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`admin-routes-page__filter-btn ${statusFilter === opt.value ? "active" : ""
                  }`}
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="admin-routes-page__count">
            {filteredRoutes.length} / {routes.length}
          </span>
        </section>

        {loading && <p className="admin-routes-page__loading">Загрузка...</p>}
        {error && <p className="admin-routes-page__error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Таблица */}
            <section className="admin-routes-table">
              <div className="admin-routes-table__head">
                <span>ID маршрута</span>
                <span>Клиент</span>
                <span>Email</span>
                <span>Даты маршрута</span>
                <span>Статус</span>
                <span></span>
                <span></span>
              </div>

              <div className="admin-routes-table__body">
                {filteredRoutes.length === 0 ? (
                  <p className="admin-routes-table__empty">
                    {routes.length === 0
                      ? "Маршрутов пока нет"
                      : "Ничего не найдено"}
                  </p>
                ) : (
                  filteredRoutes.map((route) => {
                    const userInfo = route.user?.info || {};
                    const fullName = `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() || "—";

                    return (
                      <div
                        className={`admin-routes-table__row ${selectedRoute?.id === route.id ? "selected" : ""
                          }`}
                        key={route.id}
                        onClick={() => setSelectedRoute(route)}
                      >
                        <span>{shortId(route.id)}</span>
                        <span>{fullName}</span>
                        <span className="admin-routes-table__email">{route.user?.email || "—"}</span>
                        <span>{formatDate(route.start_date)} — {formatDate(route.end_date)}</span>
                        <span>
                          <span className={`admin-routes-table__status-badge ${statusClass(route.status?.title)}`}>
                            {statusLabel(route.status?.title)}
                          </span>
                        </span>
                        <span>
                          <button
                            type="button"
                            className="admin-routes-table__details-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/routes/${route.id}`);
                            }}
                            title="Подробнее"
                          >
                            Подробнее
                          </button>
                        </span>
                        <span>
                          <button
                            type="button"
                            className="admin-routes-table__delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(route.id);
                            }}
                            title="Удалить"
                          >
                            Удалить
                          </button>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Быстрый просмотр — панель справа */}
            {selectedRoute && (
              <section className="admin-routes-page__preview">
                <div className="preview-card">
                  <div className="preview-card__header">
                    <h3 className="preview-card__title">
                      Маршрут {shortId(selectedRoute.id)}
                    </h3>
                    <button
                      type="button"
                      className="preview-card__close"
                      onClick={() => setSelectedRoute(null)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="preview-card__body">
                    <div className="preview-card__section">
                      <h4 className="preview-card__subtitle">Клиент</h4>
                      <p>
                        {selectedRoute.user?.info?.last_name || ""}{" "}
                        {selectedRoute.user?.info?.first_name || ""}{" "}
                        {selectedRoute.user?.info?.middle_name || ""}
                      </p>
                      <p>{selectedRoute.user?.email || "—"}</p>
                      <p>{selectedRoute.user?.info?.phone || "—"}</p>
                    </div>

                    <div className="preview-card__section">
                      <h4 className="preview-card__subtitle">Маршрут</h4>
                      <p>
                        {formatDate(selectedRoute.start_date)} — {formatDate(selectedRoute.end_date)}
                      </p>
                      <p>Гостей: {selectedRoute.travelers_count ?? "—"}</p>
                      <p className="preview-card__prompt">
                        {selectedRoute.trip_idea || "—"}
                      </p>
                    </div>

                    <div className="preview-card__section">
                      <h4 className="preview-card__subtitle">Статус</h4>
                      <div className="preview-card__status-actions">
                        <span className={`admin-routes-table__status-badge ${statusClass(selectedRoute.status?.title)}`}>
                          {statusLabel(selectedRoute.status?.title)}
                        </span>
                        {selectedRoute.status?.title !== "confirmed" && (
                          <button
                            type="button"
                            className="preview-card__status-btn preview-card__status-btn--confirm"
                            onClick={() => handleStatusChange(selectedRoute.id, "confirmed")}
                          >
                            Подтвердить
                          </button>
                        )}
                        {selectedRoute.status?.title !== "completed" && (
                          <button
                            type="button"
                            className="preview-card__status-btn preview-card__status-btn--complete"
                            onClick={() => handleStatusChange(selectedRoute.id, "completed")}
                          >
                            Завершить
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="preview-card__full-btn"
                      onClick={() => navigate(`/admin/routes/${selectedRoute.id}`)}
                    >
                      Открыть полностью →
                    </button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminRoutesPage;
