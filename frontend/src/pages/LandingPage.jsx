import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <main className="landing-page__content">
        <h1 className="landing-page__title">
          Спланируй поездку
          <br />
          своей мечты
        </h1>

        <button
          type="button"
          className="landing-page__button"
          onClick={() => navigate("/route-form")}
        >
          Создать маршрут
        </button>
      </main>
    </div>
  );
}

export default LandingPage;