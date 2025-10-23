import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  extractIdFromUrl,
  toSpriteUrl,
} from '../../../infrastructure/utils/pokemonUtil';
import { getPokemonList } from '../../../data/services/pokemonService';
import { RootStackParamList } from '../../navigation/RootNavigation';

type PokemonItem = {
  id: number;
  name: string;
  imageUrl: string;
};

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [data, setData] = useState<PokemonItem[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>();
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const loadPage = useCallback(async (url?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoadingInitial(true);

      const res = await getPokemonList(url);

      const mapped = res.results.map(p => {
        const id = extractIdFromUrl(p.url);
        return {
          id,
          name: p.name,
          imageUrl: toSpriteUrl(id),
        } as PokemonItem;
      });

      setData(prev => (isLoadMore ? [...prev, ...mapped] : mapped));
      setNextUrl(res.next);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Erro inesperado');
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(undefined, false);
  }, [loadPage]);

  const handleLoadMore = useCallback(() => {
    if (nextUrl && !loadingMore) {
      loadPage(nextUrl, true);
    }
  }, [nextUrl, loadingMore, loadPage]);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchError('Digite um nome ou um número!');
      return;
    }
    try {
      setSearchLoading(true);
      setSearchError(null);
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`,
      );
      if (res.status === 404) {
        setSearchError('Pokemon não encontrado.');
        return;
      }
      if (!res.ok) {
        throw new Error('Erro ao buscar Pokemon.');
      }

      const json = await res.json();

      navigation.navigate('Details', { id: json.id });
    } catch (e: any) {
      setSearchError(e?.message ?? 'Erro na busca.');
    } finally {
      setSearchLoading(false);
    }
  }, [navigation, searchQuery]);

  const numColumns = 2;

  const renderItem = useCallback(
    ({ item }: { item: PokemonItem }) => {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => navigation.navigate('Details', { id: item.id })}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.sprite} />
          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: PokemonItem) => String(item.id), []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Pokemons</Text>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="Busque aqui!"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <View style={styles.searchBtn}>
            <Button
              title={searchLoading ? 'Buscando...' : 'Buscar'}
              onPress={handleSearch}
              disabled={searchLoading}
              color={'#D32F2F'}
            />
          </View>
        </View>
        {searchError ? (
          <Text style={styles.searchError}>{searchError}</Text>
        ) : null}
      </View>
    ),
    [handleSearch, searchError, searchLoading, searchQuery],
  );

  const ListFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator />
          <Text style={styles.footerText}>Carregando mais...</Text>
        </View>
      );
    }
    return (
      <View style={styles.footer}>
        <Button
          title={nextUrl ? 'Carregar Mais' : 'Não há mais resultados'}
          onPress={handleLoadMore}
          disabled={!nextUrl}
          color={'#D32F2F'}
        />
      </View>
    );
  }, [loadingMore, nextUrl, handleLoadMore]);

  return (
    <View style={styles.container}>
      {loadingInitial ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando Pokemons...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Erro: {error}</Text>
          <View style={{ marginTop: 12 }}>
            <Button
              title="Tentar novamente"
              onPress={() => loadPage(undefined, false)}
              color={'#D32F2F'}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const CARD_SIZE = 108;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: { marginTop: 8, color: '#333' },
  errorText: { color: '#C62828', textAlign: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchBtn: {
    width: 110,
  },
  searchError: {
    marginTop: 8,
    color: '#C62828',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
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
  sprite: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    resizeMode: 'contain',
  },
  name: {
    textTransform: 'capitalize',
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { marginTop: 8, color: '#666' },
});
