import { createContext, useContext, useState, useEffect } from "react";

const RouteContext = createContext(null);

export function RouteProvider({ children }) {
  const [routePoints, setRoutePoints] = useState(() => {
    const saved = localStorage.getItem("citiesToTravel");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return parsed;
    } catch (error) {
      console.error("Ошибка парсинга localStorage:", error);
      return [];
    }
  });

  // selectedHotelsByCity: { [cityId]: { hotelId, roomId, startDate, endDate } }
  const [selectedHotelsByCity, setSelectedHotelsByCity] = useState(() => {
    const saved = localStorage.getItem("selectedHotelsByCity");
    if (!saved) return {};

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Ошибка парсинга selectedHotelsByCity:", error);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("citiesToTravel", JSON.stringify(routePoints));
  }, [routePoints]);

  useEffect(() => {
    localStorage.setItem("selectedHotelsByCity", JSON.stringify(selectedHotelsByCity));
  }, [selectedHotelsByCity]);

  const loadRoutePointsFromStorage = () => {
    try {
      const saved = localStorage.getItem("citiesToTravel");
      if (!saved) {
        setRoutePoints([]);
        return;
      }

      const parsed = JSON.parse(saved);
      setRoutePoints(parsed);
    } catch (error) {
      console.error("Ошибка загрузки из localStorage:", error);
      setRoutePoints([]);
    }
  };

  const removeRoutePoint = (cityId) => {
    setRoutePoints((prev) => prev.filter((city) => city.id !== cityId));

    setSelectedHotelsByCity((prev) => {
      const updated = { ...prev };
      delete updated[cityId];
      return updated;
    });
  };

  const removeRoutePointByName = (cityName) => {
    const cityToRemove = routePoints.find(c => c.name === cityName);

    setRoutePoints((prev) => prev.filter((city) => city.name !== cityName));

    // Удаляем отель по id города
    if (cityToRemove && cityToRemove.id) {
      setSelectedHotelsByCity((prev) => {
        const updated = { ...prev };
        delete updated[cityToRemove.id];
        return updated;
      });
    }
  };

  const setSelectedHotelForCity = (cityId, hotelData) => {
    setSelectedHotelsByCity((prev) => ({
      ...prev,
      [cityId]: hotelData,
    }));
  };

  // Добавление новой точки маршрута
  const addRoutePointAtIndex = (insertIndex, cityData = null) => {
    setRoutePoints((prev) => {
      const updated = [...prev];

      // Если переданы данные города, используем их
      if (cityData) {
        updated.splice(insertIndex, 0, {
          id: cityData.id,
          name: cityData.name || cityData.cityName || "Новый город",
          ...cityData
        });
      } else {
        updated.splice(insertIndex, 0, {
          id: Date.now(),
          name: "Новый город",
        });
      }

      return updated;
    });
  };

  const updateRoutePoint = (cityId, updatedData) => {
    console.log(routePoints);
    setRoutePoints((prev) =>
      prev.map((city) =>
        city.id === cityId ? { ...city, ...updatedData } : city
      )
    );
    console.log(routePoints);
  };

  const getRoutePointById = (cityId) => {
    return routePoints.find(city => city.id === cityId);
  };

  const getRoutePointByIndex = (index) => {
    return routePoints[index];
  };

  const moveRoutePoint = (fromIndex, toIndex) => {
    setRoutePoints((prev) => {
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };

  const clearRoutePoints = () => {
    setRoutePoints([]);
    setSelectedHotelsByCity({});
  };

  return (
    <RouteContext.Provider
      value={{
        routePoints,
        setRoutePoints,
        removeRoutePoint,
        removeRoutePointByName,
        setSelectedHotelForCity,
        addRoutePointAtIndex,
        updateRoutePoint,
        getRoutePointById,
        getRoutePointByIndex,
        moveRoutePoint,
        clearRoutePoints,
        loadRoutePointsFromStorage,
        selectedHotelsByCity,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);

  if (!context) {
    throw new Error("useRoute must be used inside RouteProvider");
  }

  return context;
}