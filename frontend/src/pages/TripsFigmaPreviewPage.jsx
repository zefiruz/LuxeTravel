import Header from "../components/Header";
import "../styles/TripsFigmaPreviewPage.css";

const mockTrips = [
  {
    id: 1,
    title: "Маршрут по Европе",
    dates: "12.05.2026 — 25.05.2026",
    people: "2 человека",
  },
  {
    id: 2,
    title: "Выходные в Сочи",
    dates: "08.06.2026 — 12.06.2026",
    people: "4 человека",
  },
  {
    id: 3,
    title: "Норвежские фьорды",
    dates: "01.09.2026 — 10.09.2026",
    people: "3 человека",
  },
];

function TripsFigmaPreviewPage() {
  return (
    <div className="trips-preview-page">
      <Header />

      <main className="trips-preview-page__content">
        <h1 className="trips-preview-page__title">Поездки</h1>

        <section className="trips-preview-list" aria-label="Список поездок">
          {mockTrips.map((trip) => (
            <article key={trip.id} className="trips-preview-card">
              <div className="trips-preview-card__left">
                <div className="trips-preview-card__marker" aria-hidden="true" />

                <div className="trips-preview-card__meta">
                  <h2 className="trips-preview-card__name">{trip.title}</h2>
                  <p className="trips-preview-card__info">{trip.dates}</p>
                  <p className="trips-preview-card__info trips-preview-card__info--muted">
                    {trip.people}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="trips-preview-card__btn"
              >
                открыть
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default TripsFigmaPreviewPage;

