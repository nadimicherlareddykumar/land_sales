import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "real-estate-favorites";

const readInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite: (propertyId) => favorites.some((item) => item._id === propertyId),
      toggleFavorite: (property) => {
        setFavorites((prev) => {
          const exists = prev.some((item) => item._id === property._id);
          if (exists) {
            return prev.filter((item) => item._id !== property._id);
          }
          return [property, ...prev];
        });
      },
      clearFavorites: () => setFavorites([])
    }),
    [favorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
};
