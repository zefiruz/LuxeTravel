import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { PREVIEW_HOTELS_CATALOG } from "../data/previewHotelsCatalog";
import "../styles/HotelsFigmaPreviewPage.css";

function HotelsFigmaPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="hotels-preview-page">
      <Header />
      <main className="hotels-preview-page__content">
        <h1 className="hotels-preview-page__title">Отели</h1>

        <section className="hotels-preview-list" aria-label="Список отелей">
          {PREVIEW_HOTELS_CATALOG.map((hotel) => (
            <article key={hotel.id} className="hotels-preview-card">
              <div className="hotels-preview-card__left">
                <div
                  className="hotels-preview-card__image"
                  aria-hidden="true"
                />
                <div className="hotels-preview-card__meta">
                  <h2 className="hotels-preview-card__name">{hotel.name}</h2>
                  <p className="hotels-preview-card__address">{hotel.address}</p>
                  {hotel.email && (
                    <p className="hotels-preview-card__email">email: {hotel.email}</p>
                  )}
                </div>
              </div>

              <div className="hotels-preview-card__actions">
                <button
                  type="button"
                  className="hotels-preview-card__btn hotels-preview-card__btn--primary"
                  onClick={() =>
                    navigate(`/hotels/${hotel.id}/bookings`, {
                      state: {
                        hotelName: hotel.name,
                        bookingsViewer: "manager",
                      },
                    })
                  }
                >
                  брони
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default HotelsFigmaPreviewPage;
