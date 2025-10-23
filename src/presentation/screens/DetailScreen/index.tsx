import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  View,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigation';
import { capitalize } from '../../../infrastructure/utils/pokemonUtil';
import {
  getPokemonDetails,
  PokeDetails,
} from '../../../data/services/pokemonService';
import FavoriteStar from './components/FavoriteStar';

type DetailsRouteProp = RouteProp<RootStackParamList, 'Details'>;
type DetailsNavProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

type Props = {
  route: DetailsRouteProp;
  navigation: DetailsNavProp;
};

export default function DetailScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const [data, setData] = useState<PokeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getPokemonDetails(id);
        setData(res);
        setError(null);
        navigation.setOptions({ title: capitalize(res.name) });
      } catch (e: any) {
        setError(e?.message ?? 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  const artwork = useMemo(() => {
    if (!data) return null;
    const official =
      data.sprites?.other?.['official-artwork']?.front_default ?? null;
    return official ?? data.sprites.front_default;
  }, [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erro: {error ?? 'Dados indisponíveis'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {artwork ? (
          <Image source={{ uri: artwork }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]} />
        )}

        <Text style={styles.name}>
          {capitalize(data.name)} <Text style={styles.number}>#{data.id}</Text>
        </Text>

        <FavoriteStar
          pokemon={{
            id: data.id,
            name: data.name,
            imageUrl:
              data.sprites?.other?.['official-artwork']?.front_default ??
              data.sprites.front_default ??
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
          }}
          style={{ position: 'absolute', right: 16, top: 16 }}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos</Text>
          <View style={styles.chipsRow}>
            {data.types
              .sort((a, b) => a.slot - b.slot)
              .map(t => (
                <View style={styles.chip} key={t.type.name}>
                  <Text style={styles.chipText}>{capitalize(t.type.name)}</Text>
                </View>
              ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades</Text>
          <View style={styles.listBox}>
            {data.moves.splice(0, 10).map(move => (
              <Text style={styles.listItem} key={move.move.name}>
                • {capitalize(move.move.name)}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const IMAGE_SIZE = 200;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  muted: { marginTop: 8, color: '#666' },
  error: { color: '#C62828', textAlign: 'center' },
  content: { padding: 16, alignItems: 'center' },
  artwork: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  artworkPlaceholder: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
  },
  name: { fontSize: 24, fontWeight: '800', color: '#222' },
  number: { fontSize: 18, fontWeight: '600', color: '#888' },
  section: { alignSelf: 'stretch', marginTop: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#FFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  chipText: { color: '#333', fontWeight: '600' },
  listBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  listItem: { color: '#333', marginBottom: 6 },
});
