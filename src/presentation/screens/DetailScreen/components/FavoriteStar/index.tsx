import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import {
  Favorite,
  useFavorites,
} from '../../../../../infrastructure/contexts/Favorites';

type Props = {
  pokemon: Favorite;
  size?: number;
  style?: ViewStyle;
};

export default function FavoriteStar({ pokemon, size = 28, style }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(pokemon.id);

  const icon = active ? '★' : '☆';
  const color = active ? '#F5C518' : '#999';

  const hitSlop = useMemo(() => ({ top: 8, bottom: 8, left: 8, right: 8 }), []);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={
        active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
      }
      onPress={() => toggleFavorite(pokemon)}
      hitSlop={hitSlop}
      style={[styles.touch, style]}
    >
      <Text style={[styles.icon, { fontSize: size, color }]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    padding: 4,
    borderRadius: 999,
  },
  icon: {
    fontWeight: '900',
  },
});
