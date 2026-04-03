import { useEffect, useState } from "react";
import Header from "../components/Header";
import adminService from "../services/admin";
import "../styles/AdminUsersPage.css";

const ROLES = [
  { id: "", title: "client" },
  { id: "", title: "manager" },
  { id: "", title: "admin" },
];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

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

  return (
    <div className="admin-users-page">
      <Header />

      <main className="admin-users-page__content">
        <section className="admin-users-page__title-block">
          <span className="admin-users-page__title-line" />
          <h1 className="admin-users-page__title">Пользователи</h1>
          <span className="admin-users-page__title-line" />
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
              {users.length === 0 ? (
                <p className="admin-users-table__empty">Пользователей пока нет</p>
              ) : (
                users.map((user) => (
                  <div className="admin-users-table__row" key={user.id}>
                    <span>{user.id?.slice(0, 8) || ""}</span>
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
