import { useEffect, useState, useMemo } from "react";
import AdminHeader from "../components/AdminHeader";
import adminService from "../services/admin";
import "../styles/AdminUsersPage.css";

const ROLE_FILTERS = [
  { value: "", label: "Все" },
  { value: "client", label: "Клиенты" },
  { value: "manager", label: "Менеджеры" },
  { value: "admin", label: "Админы" },
];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, rolesData] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getRoles(),
        ]);
        setUsers(usersData);
        setRoles(rolesData);
      } catch (err) {
        setError("Не удалось загрузить данные");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setSelectedRoleId(user.role_id);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRoleId("");
  };

  const handleSaveRole = async (userId) => {
    try {
      await adminService.updateUserRole(userId, selectedRoleId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role_id: selectedRoleId } : u))
      );
      handleCancelEdit();
    } catch (err) {
      alert("Ошибка при обновлении роли");
      console.error(err);
    }
  };

  const getRoleTitle = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.title : "—";
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchRole = !roleFilter || user.role?.title === roleFilter;

      const q = search.toLowerCase();
      const fullName = `${user.info?.first_name || ""} ${user.info?.last_name || ""} ${user.info?.middle_name || ""}`.toLowerCase();
      const matchSearch =
        !q ||
        fullName.includes(q) ||
        (user.email || "").toLowerCase().includes(q) ||
        (user.info?.phone || "").toLowerCase().includes(q) ||
        (user.id || "").toLowerCase().includes(q);

      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter]);

  const shortId = (id) => (id ? String(id).slice(0, 8) : "");

  return (
    <div className="admin-users-page">
      <AdminHeader />

      <main className="admin-users-page__content">
        <section className="admin-users-page__title-block">
          <span className="admin-users-page__title-line" />
          <h1 className="admin-users-page__title">Пользователи</h1>
          <span className="admin-users-page__title-line" />
        </section>

        {/* Панель управления */}
        <section className="admin-users-page__toolbar">
          <div className="admin-users-page__search">
            <input
              type="text"
              className="admin-users-page__search-input"
              placeholder="Поиск по имени, email, телефону, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-users-page__filters">
            {ROLE_FILTERS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`admin-users-page__filter-btn ${roleFilter === opt.value ? "active" : ""
                  }`}
                onClick={() => setRoleFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="admin-users-page__count">
            {filteredUsers.length} / {users.length}
          </span>
        </section>

        {loading && <p className="admin-users-page__loading">Загрузка...</p>}
        {error && <p className="admin-users-page__error">{error}</p>}

        {!loading && !error && (
          <section className="admin-users-table">
            <div className="admin-users-table__head">
              <span>ID</span>
              <span>Email</span>
              <span>ФИО</span>
              <span>Телефон</span>
              <span>Роль</span>
              <span></span>
            </div>

            <div className="admin-users-table__body">
              {filteredUsers.length === 0 ? (
                <p className="admin-users-table__empty">
                  {users.length === 0 ? "Пользователей пока нет" : "Ничего не найдено"}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div className="admin-users-table__row" key={user.id}>
                    <span>{shortId(user.id)}</span>
                    <span>{user.email || ""}</span>
                    <span>
                      {user.info?.last_name || ""} {user.info?.first_name || ""} {user.info?.middle_name || ""}
                    </span>
                    <span>{user.info?.phone || "—"}</span>
                    <span>
                      {editingUserId === user.id ? (
                        <select
                          className="admin-users-table__role-select"
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getRoleTitle(user.role_id)
                      )}
                    </span>
                    <span className="admin-users-table__actions">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            type="button"
                            className="admin-users-table__btn admin-users-table__btn--save"
                            onClick={() => handleSaveRole(user.id)}
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            className="admin-users-table__btn admin-users-table__btn--cancel"
                            onClick={handleCancelEdit}
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="admin-users-table__btn admin-users-table__btn--edit"
                          onClick={() => handleStartEdit(user)}
                        >
                          Изменить роль
                        </button>
                      )}
                    </span>
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

export default AdminUsersPage;
