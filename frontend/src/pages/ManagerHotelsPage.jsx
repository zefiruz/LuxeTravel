import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerHeader from "../components/ManagerHeader";
import managerService from "../services/manager";
import "../styles/ManagerHotelsPage.css";

function ManagerHotelsPage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [hotelBookings, setHotelBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsData = await managerService.getBookings();
      
      // Группируем бронирования по отелям
      const hotelsMap = {};
      const hotelBookingsMap = {};
      
      bookingsData.forEach(booking => {
        const hotel = booking.room_type?.hotel;
        if (!hotel) return;
        
        const hotelId = hotel.id;
        if (!hotelsMap[hotelId]) {
          hotelsMap[hotelId] = {
            id: hotelId,
            title: hotel.title,
            address: hotel.address || "—",
            email: hotel.email || "—",
            city: hotel.city?.title || "—",
          };
          hotelBookingsMap[hotelId] = [];
        }
        hotelBookingsMap[hotelId].push(booking);
      });
      
      setHotels(Object.values(hotelsMap));
      setHotelBookings(hotelBookingsMap);
    } catch (err) {
      setError("Не удалось загрузить отели");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookings = (hotel) => {
    navigate(`/manager/hotels/${hotel.id}/bookings`, {
      state: { hotelName: hotel.title },
    });
  };

  return (
    <div className="manager-hotels-page">
      <ManagerHeader />
      <main className="manager-hotels-page__content">
        <h1 className="manager-hotels-page__title">Мои отели</h1>

        {loading && <p className="manager-hotels-page__loading">Загрузка...</p>}
        {error && <p className="manager-hotels-page__error">{error}</p>}

        {!loading && !error && (
          <div className="manager-hotels-list">
            {hotels.length === 0 ? (
              <p className="manager-hotels-page__empty">У вас пока нет отелей</p>
            ) : (
              hotels.map((hotel) => (
                <article key={hotel.id} className="manager-hotel-card">
                  <div className="manager-hotel-card__info">
                    <h2 className="manager-hotel-card__name">{hotel.title}</h2>
                    <p className="manager-hotel-card__city">{hotel.city}</p>
                    <p className="manager-hotel-card__address">{hotel.address}</p>
                    {hotel.email && (
                      <p className="manager-hotel-card__email">email: {hotel.email}</p>
                    )}
                    <p className="manager-hotel-card__bookings-count">
                      бронирований: {hotelBookings[hotel.id]?.length || 0}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="manager-hotel-card__btn"
                    onClick={() => handleOpenBookings(hotel)}
                  >
                    Бронирования
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerHotelsPage;
