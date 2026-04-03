import { createContext, useContext, useState, useEffect } from "react";
import hotelService from "../services/hotels";

const CitiesContext = createContext(null);

export function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedHotelsByCity, setSelectedHotelsByCity] = useState({});

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const result = await hotelService.getCityList();
        if (result.success) {
          setCities(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const removeCity = (id) => {
    setCities((prev) => prev.filter((city) => city.id !== id));

    setSelectedHotelsByCity((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const setSelectedHotelForCity = (cityId, hotelId) => {
    setSelectedHotelsByCity((prev) => ({
      ...prev,
      [cityId]: hotelId,
    }));
  };

  const addCity = (city) => {
    setCities((prev) => [...prev, city]);
  };

  return (
    <CitiesContext.Provider
      value={{
        cities,
        selectedCities,
        setSelectedCities,
        loading,
        error,
        selectedHotelsByCity,
        setSelectedHotelForCity,
        removeCity,
        addCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

export function useCities() {
  const context = useContext(CitiesContext);

  if (!context) {
    throw new Error("useCities must be used inside CitiesProvider");
  }

  return context;
}