import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import adminService from "../services/admin";
import "../styles/AdminHotelsPage.css";

function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", city_id: "", email: "", address: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsData, citiesData] = await Promise.all([
        adminService.getHotels(),
        adminService.getCities(),
      ]);
      setHotels(hotelsData);
      setCities(citiesData);
    } catch (err) {
      setError("Не удалось загрузить данные");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (hotel = null) => {
    if (hotel) {
      setEditingHotel(hotel);
      setForm({
        title: hotel.title || "",
        description: hotel.description || "",
        city_id: hotel.city_id || "",
        email: hotel.email || "",
        address: hotel.address || "",
      });
    } else {
      setEditingHotel(null);
      setForm({ title: "", description: "", city_id: cities[0]?.id || "", email: "", address: "" });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHotel(null);
    setForm({ title: "", description: "", city_id: "", email: "", address: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        await adminService.updateHotel(editingHotel.id, form);
      } else {
        await adminService.createHotel(form);
      }
      handleCloseForm();
      fetchData();
    } catch (err) {
      alert("Ошибка при сохранении");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить этот отель?")) return;
    try {
      await adminService.deleteHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      alert("Ошибка при удалении");
      console.error(err);
    }
  };

  const getCityName = (cityId) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.title : "—";
  };

  return (
    <div className="admin-hotels-page">
      <AdminHeader />
      <main className="admin-hotels-page__content">
        <div className="admin-hotels-page__header">
          <h1 className="admin-hotels-page__title">Отели</h1>
          <button className="admin-hotels-page__add-btn" onClick={() => handleOpenForm()}>
            + Добавить
          </button>
        </div>

        {loading && <p className="admin-hotels-page__loading">Загрузка...</p>}
        {error && <p className="admin-hotels-page__error">{error}</p>}

        {!loading && !error && (
          <table className="admin-hotels-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Город</th>
                <th>Адрес</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-hotels-table__empty">Отелей пока нет</td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>{hotel.title}</td>
                    <td>{getCityName(hotel.city_id)}</td>
                    <td>{hotel.address || "—"}</td>
                    <td>{hotel.email || "—"}</td>
                    <td className="admin-hotels-table__actions">
                      <button className="admin-hotels-table__btn" onClick={() => handleOpenForm(hotel)}>
                        Редактировать
                      </button>
                      <button className="admin-hotels-table__btn admin-hotels-table__btn--danger" onClick={() => handleDelete(hotel.id)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {showForm && (
          <div className="admin-hotel-form-overlay" onClick={handleCloseForm}>
            <div className="admin-hotel-form" onClick={(e) => e.stopPropagation()}>
              <h2>{editingHotel ? "Редактировать отель" : "Новый отель"}</h2>
              <form onSubmit={handleSubmit}>
                <label className="admin-hotel-form__field">
                  <span>Название *</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-hotel-form__field">
                  <span>Город *</span>
                  <select
                    value={form.city_id}
                    onChange={(e) => setForm({ ...form, city_id: e.target.value })}
                    required
                  >
                    <option value="">Выберите город</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.title}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-hotel-form__field">
                  <span>Адрес</span>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </label>
                <label className="admin-hotel-form__field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label className="admin-hotel-form__field">
                  <span>Описание</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </label>
                <div className="admin-hotel-form__actions">
                  <button type="submit" className="admin-hotel-form__btn">
                    {editingHotel ? "Сохранить" : "Создать"}
                  </button>
                  <button type="button" className="admin-hotel-form__btn admin-hotel-form__btn--cancel" onClick={handleCloseForm}>
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

export default AdminHotelsPage;
