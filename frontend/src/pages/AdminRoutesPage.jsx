import Header from "../components/Header";
import "../styles/AdminRoutesPage.css";

function AdminRoutesPage() {
  const routes = [
    {
      routeId: "1",
      clientId: "",
      clientName: "",
      phone: "",
      routeDates: "",
    },
    {
      routeId: "",
      clientId: "",
      clientName: "",
      phone: "",
      routeDates: "",
    },
    {
      routeId: "",
      clientId: "",
      clientName: "",
      phone: "",
      routeDates: "",
    },
  ];

  return (
    <div className="admin-routes-page">
      <Header />

      <main className="admin-routes-page__content">
        <section className="admin-routes-page__title-block">
          <span className="admin-routes-page__title-line" />
          <h1 className="admin-routes-page__title">Маршруты</h1>
          <span className="admin-routes-page__title-line" />
        </section>

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
            {routes.map((route, index) => (
              <div className="admin-routes-table__row" key={index}>
                <span>{route.routeId}</span>
                <span>{route.clientId}</span>
                <span>{route.clientName}</span>
                <span>{route.phone}</span>
                <span>{route.routeDates}</span>
                <button
                  type="button"
                  className="admin-routes-table__details-btn"
                >
                  подробнее...
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminRoutesPage;