import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Header from "../components/Header";
import { useRoute } from "../context/RouteContext";
import "../styles/HotelSelectionPage.css";

const hotelsByCity = {
  1: [
    {
      id: 101,
      name: "Hotel National Moscow",
      description:
        "Один из самых известных отелей Москвы с исторической атмосферой, видом на центр города и классическим уровнем сервиса.",
    },
    {
      id: 102,
      name: "Metropol Moscow",
      description:
        "Легендарный отель в центре Москвы, сочетающий историческую архитектуру, престижное расположение и высокий уровень комфорта.",
    },
  ],
  2: [
    {
      id: 201,
      name: "Hotel Atlantis The Royal",
      description:
        "Atlantis The Royal — один из самых впечатляющих люксовых отелей в мире, расположенный на острове Palm Jumeirah в Дубае. Этот отель стал символом современной роскоши и архитектурного масштаба: его необычная каскадная форма с террасами и панорамными бассейнами уже стала новой визитной карточкой города.",
    },
    {
      id: 202,
      name: "Hotel Burj Al Arab",
      description:
        "Burj Al Arab — один из самых известных и роскошных отелей в мире, расположенный на искусственном острове у побережья Дубая. Здание выполнено в форме паруса и уже много лет считается символом города и уровня роскоши. Отель предлагает исключительные сьюты, что делает пребывание здесь особенно приватным и комфортным.",
    },
  ],
  3: [
    {
      id: 301,
      name: "The Thief",
      description:
        "Современный бутик-отель в Норвегии с акцентом на дизайн, приватность и комфортный отдых у воды.",
    },
    {
      id: 302,
      name: "Hotel Continental Oslo",
      description:
        "Один из самых известных отелей Осло с классическим сервисом, удобным расположением и спокойной атмосферой.",
    },
  ],
  4: [
    {
      id: 401,
      name: "Ritz Paris",
      description:
        "Иконический парижский отель с богатой историей, классическим интерьером и атмосферой европейской роскоши.",
    },
    {
      id: 402,
      name: "Le Meurice",
      description:
        "Элегантный отель в центре Парижа, сочетающий французскую эстетику, комфорт и близость к главным достопримечательностям.",
    },
  ],
  5: [
    {
      id: 501,
      name: "Park Hyatt Tokyo",
      description:
        "Знаменитый токийский отель с панорамными видами на город, высоким уровнем сервиса и спокойной премиальной атмосферой.",
    },
    {
      id: 502,
      name: "Aman Tokyo",
      description:
        "Современный премиальный отель в Токио, сочетающий японскую минималистичность, тишину и высокий уровень приватности.",
    },
  ],
  6: [
    {
      id: 601,
      name: "The Savoy",
      description:
        "Классический лондонский отель с узнаваемым стилем, историей и премиальным расположением в центре города.",
    },
    {
      id: 602,
      name: "The Langham London",
      description:
        "Элегантный и статусный отель в Лондоне с высоким уровнем сервиса и классической британской атмосферой.",
    },
  ],
};

function HotelSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { routePoints, selectedHotelsByCity, setSelectedHotelForCity } = useRoute();

  const cityId = Number(id);

  const city = useMemo(
    () => routePoints.find((point) => point.id === cityId),
    [cityId, routePoints]
  );

  const hotels = useMemo(() => hotelsByCity[cityId] || [], [cityId]);

  const activeHotelIndex = useMemo(() => {
    if (hotels.length === 0) return 0;

    const savedHotelId = selectedHotelsByCity[cityId];
    if (!savedHotelId) return 0;

    const index = hotels.findIndex((hotel) => hotel.id === savedHotelId);
    return index >= 0 ? index : 0;
  }, [hotels, selectedHotelsByCity, cityId]);

  if (!city) {
    return (
      <div className="hotel-selection-page">
        <Header />
        <main className="hotel-selection-page__content">
          <p className="hotel-selection-page__empty">Город не найден.</p>
        </main>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="hotel-selection-page">
        <Header />
        <main className="hotel-selection-page__content">
          <button
            type="button"
            className="hotel-selection-page__close-btn"
            onClick={() => navigate(`/route-point/${cityId}`)}
            aria-label="Закрыть выбор отеля"
          >
            <X className="hotel-selection-page__close-icon" />
          </button>

          <h1 className="hotel-selection-page__city-title">{city.name}</h1>
          <p className="hotel-selection-page__empty">
            Для этого города пока нет отелей.
          </p>
        </main>
      </div>
    );
  }

  const activeHotel = hotels[activeHotelIndex];
  const secondaryHotel = hotels.find((_, index) => index !== activeHotelIndex);

  const handleSelectSecondaryHotel = () => {
    if (!secondaryHotel) return;
    setSelectedHotelForCity(cityId, secondaryHotel.id);
  };

  return (
    <div className="hotel-selection-page">
      <Header />

      <main className="hotel-selection-page__content">
        <button
          type="button"
          className="hotel-selection-page__close-btn"
          onClick={() => navigate(`/route-point/${cityId}`)}
          aria-label="Закрыть выбор отеля"
        >
          <X className="hotel-selection-page__close-icon" />
        </button>

        <section className="hotel-selection-page__header">
          <div className="hotel-selection-page__title-wrap">
            <span className="hotel-selection-page__title-line" />
            <h1 className="hotel-selection-page__city-title">{city.name}</h1>
            <span className="hotel-selection-page__title-line" />
          </div>
        </section>

        <section className="hotel-selection-layout">
          <div className="hotel-selection-left">
            <div className="hotel-card hotel-card--main">
              <div className="hotel-card__image hotel-card__image--main" />
              <h2 className="hotel-card__title">{activeHotel.name}</h2>
            </div>

            {secondaryHotel && (
              <button
                type="button"
                className="hotel-card hotel-card--secondary"
                onClick={handleSelectSecondaryHotel}
                aria-label={`Выбрать отель ${secondaryHotel.name}`}
              >
                <div className="hotel-card__image hotel-card__image--secondary" />
                <span className="hotel-card__subtitle">
                  {secondaryHotel.name}
                </span>
              </button>
            )}
          </div>

          <div className="hotel-selection-right">
            <p className="hotel-selection-description hotel-selection-description--main">
              {activeHotel.description}
            </p>

            {secondaryHotel && (
              <p className="hotel-selection-description hotel-selection-description--secondary">
                {secondaryHotel.description}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HotelSelectionPage;