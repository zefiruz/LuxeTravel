import { createContext, useContext, useState } from "react";

const initialRoutePoints = [
  {
    id: 1,
    name: "Москва",
    description:
      "Москва — это город, в котором можно провести сразу несколько разных видов отдыха: культурный, гастрономический, активный или просто прогулочный. Это один из крупнейших и самых динамичных городов Европы, где историческая архитектура соседствует с современными пространствами, музеями, парками и ресторанами.",
  },
  {
    id: 2,
    name: "Дубай",
    description:
      "Дубай — это город, где современная архитектура, роскошь и пустынные пейзажи соединяются в одном месте. Это один из самых необычных городов мира, который буквально вырос посреди пустыни и стал символом современных технологий, масштабных проектов и высокого уровня сервиса.",
  },
  {
    id: 3,
    name: "Норвегия",
    description:
      "Норвегия — это страна впечатляющей природы, фьордов, горных маршрутов и спокойного северного ритма жизни. Здесь можно совместить созерцательный отдых, активные прогулки и знакомство с необычной культурой.",
  },
  {
    id: 4,
    name: "Париж",
    description:
      "Париж — это город искусства, архитектуры и длинных прогулок. Здесь сочетаются знаковые достопримечательности, уютные улицы, гастрономия и атмосфера классического европейского путешествия.",
  },
  {
    id: 5,
    name: "Токио",
    description:
      "Токио — это город, где высокие технологии, плотный ритм жизни и традиционная японская культура существуют одновременно. Это точка для ярких впечатлений, гастрономии и необычной городской атмосферы.",
  },
  {
    id: 6,
    name: "Лондон",
    description:
      "Лондон — это классический европейский мегаполис с историей, музеями, парками и узнаваемой городской эстетикой. Здесь удобно сочетать культурный отдых, прогулки и насыщенную городскую программу.",
  },
];

const RouteContext = createContext(null);

export function RouteProvider({ children }) {
  const [routePoints, setRoutePoints] = useState(initialRoutePoints);
  const [selectedHotelsByCity, setSelectedHotelsByCity] = useState({});

  const removeRoutePoint = (id) => {
    setRoutePoints((prev) => prev.filter((point) => point.id !== id));

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

  const addRoutePointAtIndex = (insertIndex) => {
    const newPoint = {
      id: Date.now(),
      name: "Новая точка",
      description: "Описание для новой точки маршрута пока не заполнено.",
    };

    setRoutePoints((prev) => {
      const updated = [...prev];
      updated.splice(insertIndex, 0, newPoint);
      return updated;
    });
  };

  return (
    <RouteContext.Provider
      value={{
        routePoints,
        setRoutePoints,
        removeRoutePoint,
        selectedHotelsByCity,
        setSelectedHotelForCity,
        addRoutePointAtIndex,
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