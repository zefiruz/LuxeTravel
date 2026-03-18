import { useState } from "react";
import Header from "../components/Header";
import "../styles/AdminRouteDetailsPage.css";

function AdminRouteDetailsPage() {
  const [decision, setDecision] = useState("");

  return (
    <div className="admin-route-details-page">
      <Header />

      <main className="admin-route-details-page__content">
        <section className="admin-route-details-page__title-block">
          <span className="admin-route-details-page__title-line" />
          <h1 className="admin-route-details-page__title">Маршрут №1</h1>
          <span className="admin-route-details-page__title-line" />
        </section>

        <section className="admin-route-card">
          <div className="admin-route-card__top">
            <div className="admin-route-card__client">
              <h2 className="admin-route-card__client-title">Клиент №1</h2>

              <div className="admin-route-card__client-info">
                <div className="admin-route-card__avatar">
                  <div className="admin-route-card__avatar-head" />
                  <div className="admin-route-card__avatar-body" />
                </div>

                <div className="admin-route-card__client-text">
                  <p>ФИО: Иван Иванов</p>
                  <p>Телефон: 8-999-999-99-99</p>
                  <p>Email: dreamTeamProdaction@mail.ru</p>
                </div>
              </div>
            </div>

            <div className="admin-route-card__actions">
              {!decision ? (
                <>
                  <button
                    type="button"
                    className="admin-route-card__action-btn"
                    onClick={() => setDecision("approved")}
                  >
                    Подтвердить
                  </button>

                  <button
                    type="button"
                    className="admin-route-card__action-btn"
                    onClick={() => setDecision("rejected")}
                  >
                    Отклонить
                  </button>
                </>
              ) : (
                <div
                  className={`admin-route-card__status-pill ${
                    decision === "approved"
                      ? "admin-route-card__status-pill--approved"
                      : "admin-route-card__status-pill--rejected"
                  }`}
                >
                  {decision === "approved" ? "Подтверждено" : "Отклонено"}
                </div>
              )}
            </div>
          </div>

          <div className="admin-route-card__table">
            <div className="admin-route-card__table-head">
              <span>ID брони</span>
              <span>Город</span>
              <span>ID отеля</span>
              <span>Даты пребывания</span>
              <span>Email отеля</span>
            </div>

            <div className="admin-route-card__table-body">
              <div className="admin-route-card__table-row">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminRouteDetailsPage;