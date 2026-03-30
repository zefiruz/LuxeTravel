import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/MyRoutesPage.css";

function MyRoutesPage() {
  const navigate = useNavigate();

  return (
    <div className="my-routes-page">
      <Header />

      <main className="my-routes-page__content">
        <section className="my-routes-page__title-block">
          <span className="my-routes-page__title-line" />
          <h1 className="my-routes-page__title">Ваши маршруты</h1>
          <span className="my-routes-page__title-line" />
        </section>

        <section className="routes-table-card">
          <div className="routes-table-card__header">
            <span>Номер</span>
            <span>Маршрут №1</span>
            <span>Даты</span>
            <span>Количество людей</span>
          </div>

          <div className="routes-table-card__row">
            <span className="routes-table-card__cell">№1232</span>
            <span className="routes-table-card__cell">Москва → Саратов</span>
            <span className="routes-table-card__cell">12.02.2026-12.03.2026</span>
            <span className="routes-table-card__cell">5</span>

            <button
              type="button"
              className="routes-table-card__details-btn"
              onClick={() => navigate("/my-routes/1232")}
            >
              Подробнее
            </button>
          </div>

          <div className="routes-table-card__footer">
            <span className="routes-table-card__status-badge">Забронировано</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MyRoutesPage;