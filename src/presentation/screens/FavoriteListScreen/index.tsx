import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavorites } from '../../../infrastructure/contexts/Favorites';
import { RootStackParamList } from '../../navigation/RootNavigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CARD_SIZE = 108;

export default function FavoriteScreen() {
  const { favorites } = useFavorites();
  const navigation = useNavigation<Nav>();

  const data = useMemo(() => favorites, [favorites]);
  const numColumns = 2;

  const renderItem = useCallback(
    ({ item }: { item: { id: number; name: string; imageUrl: string } }) => (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => navigation.navigate('Details', { id: item.id })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.sprite} />
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const keyExtractor = useCallback((it: { id: number }) => String(it.id), []);

  if (!data.length) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Favoritos</Text>
          <Text style={styles.subtitle}>
            Você ainda não favoritou nenhum pokemon!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        ListHeaderComponent={<View style={styles.header} />}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: { height: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 4, color: '#666' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    minWidth: CARD_SIZE,
  },
  sprite: { width: CARD_SIZE, height: CARD_SIZE, resizeMode: 'contain' },
  name: {
    textTransform: 'capitalize',
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
});
