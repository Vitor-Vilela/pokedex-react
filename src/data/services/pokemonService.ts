export type PokeApiListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
};

export type PokeDetails = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      ['official-artwork']?: { front_default: string | null };
    };
  };
  types: Array<{ slot: number; type: { name: string } }>;
  moves: Array<{ move: { name: string } }>;
};

export async function getPokemonList(
  nextUrl?: string,
): Promise<PokeApiListResponse> {
  const res = await fetch(
    nextUrl ?? 'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
  );
  if (!res.ok) throw new Error('Erro ao buscar lista de pokemons');
  const json: PokeApiListResponse = await res.json();

  return json;
}

export async function getPokemonDetails(id: number): Promise<PokeDetails> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar detalhes de pokemon');
  const json: PokeDetails = await res.json();

  return json;
}
