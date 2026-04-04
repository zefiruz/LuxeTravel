import { useEffect, useState, useMemo } from "react";
import AdminHeader from "../components/AdminHeader";
import adminService from "../services/admin";
import "../styles/AdminCitiesPage.css";

function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCities();
      setCities(data);
    } catch (err) {
      setError("Не удалось загрузить города");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const q = search.toLowerCase();
      return (
        !q ||
        (city.title || "").toLowerCase().includes(q) ||
        (city.description || "").toLowerCase().includes(q)
      );
    });
  }, [cities, search]);

  const handleOpenForm = (city = null) => {
    if (city) {
      setEditingCity(city);
      setForm({ title: city.title || "", description: city.description || "", image_url: city.image_url || "" });
    } else {
      setEditingCity(null);
      setForm({ title: "", description: "", image_url: "" });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCity(null);
    setForm({ title: "", description: "", image_url: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCity) {
        await adminService.updateCity(editingCity.id, form);
      } else {
        await adminService.createCity(form);
      }
      handleCloseForm();
      fetchCities();
    } catch (err) {
      alert("Ошибка при сохранении");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить этот город?")) return;
    try {
      await adminService.deleteCity(id);
      setCities((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Ошибка при удалении");
      console.error(err);
    }
  };

  return (
    <div className="admin-cities-page">
      <AdminHeader />
      <main className="admin-cities-page__content">
        <div className="admin-cities-page__header">
          <h1 className="admin-cities-page__title">Города</h1>
          <button className="admin-cities-page__add-btn" onClick={() => handleOpenForm()}>
            + Добавить
          </button>
        </div>

        {/* Поиск */}
        <section className="admin-cities-page__toolbar">
          <div className="admin-cities-page__search">
            <input
              type="text"
              className="admin-cities-page__search-input"
              placeholder="Поиск по названию или описанию…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="admin-cities-page__count">
            {filteredCities.length} / {cities.length}
          </span>
        </section>

        {loading && <p className="admin-cities-page__loading">Загрузка...</p>}
        {error && <p className="admin-cities-page__error">{error}</p>}

        {!loading && !error && (
          <div className="admin-cities-page__grid">
            {filteredCities.length === 0 ? (
              <p className="admin-cities-page__empty">
                {cities.length === 0 ? "Городов пока нет" : "Ничего не найдено"}
              </p>
            ) : (
              filteredCities.map((city) => (
                <div key={city.id} className="admin-city-card">
                  {city.image_url && (
                    <img className="admin-city-card__image" src={city.image_url} alt={city.title} />
                  )}
                  <div className="admin-city-card__body">
                    <h3 className="admin-city-card__title">{city.title}</h3>
                    <p className="admin-city-card__desc">{city.description || "—"}</p>
                    <div className="admin-city-card__actions">
                      <button className="admin-city-card__btn" onClick={() => handleOpenForm(city)}>
                        Редактировать
                      </button>
                      <button className="admin-city-card__btn admin-city-card__btn--danger" onClick={() => handleDelete(city.id)}>
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showForm && (
          <div className="admin-city-form-overlay" onClick={handleCloseForm}>
            <div className="admin-city-form" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCity ? "Редактировать город" : "Новый город"}</h2>
              <form onSubmit={handleSubmit}>
                <label className="admin-city-form__field">
                  <span>Название *</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-city-form__field">
                  <span>Описание</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </label>
                <label className="admin-city-form__field">
                  <span>URL изображения</span>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </label>
                <div className="admin-city-form__actions">
                  <button type="submit" className="admin-city-form__btn">
                    {editingCity ? "Сохранить" : "Создать"}
                  </button>
                  <button type="button" className="admin-city-form__btn admin-city-form__btn--cancel" onClick={handleCloseForm}>
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminCitiesPage;
