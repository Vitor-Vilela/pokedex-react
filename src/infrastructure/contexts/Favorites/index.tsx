import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type Favorite = {
  id: number;
  name: string;
  imageUrl: string;
};

type FavoritesContextType = {
  favorites: Favorite[];
  isFavorite: (id: number) => boolean;
  addFavorite: (fav: Favorite) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (fav: Favorite) => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const isFavorite = useCallback(
    (id: number) => favorites.some(f => f.id === id),
    [favorites],
  );

  const addFavorite = useCallback((fav: Favorite) => {
    setFavorites(prev =>
      prev.some(f => f.id === fav.id) ? prev : [...prev, fav],
    );
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const toggleFavorite = useCallback((fav: Favorite) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === fav.id);
      return exists ? prev.filter(f => f.id !== fav.id) : [...prev, fav];
    });
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  return ctx;
}
