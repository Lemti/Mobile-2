// --- Configuration de base ---
const API: string = 'https://api.themoviedb.org/3';
const KEY: string | undefined = process.env.EXPO_PUBLIC_TMDB_API_KEY;

// --- Base URL pour les images (plusieurs tailles possibles) ---
export const TMDB_IMG_W92  = 'https://image.tmdb.org/t/p/w92';
export const TMDB_IMG_W185 = 'https://image.tmdb.org/t/p/w185';
export const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';

// --- Types ---
export type TMDBMovie = {
  id: number;
  title: string;
  poster_path?: string;   // undefined si pas d'affiche
  release_date?: string;
};

export type TMDBMovieDetails = {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  runtime?: number;
};

// --- Fonction de recherche ---
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  if (!KEY || !query.trim()) return [];
  const url = `${API}/search/movie?api_key=${KEY}&language=fr-FR&query=${encodeURIComponent(
    query.trim()
  )}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []).slice(0, 12).map((m: any) => ({
      id: m.id,
      title: m.title,
      poster_path: m.poster_path ?? undefined,
      release_date: m.release_date,
    }));
  } catch {
    return [];
  }
}

// --- Détail d’un film (pour le synopsis, etc.) ---
export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails | null> {
  if (!KEY || !movieId) return null;
  const url = `${API}/movie/${movieId}?api_key=${KEY}&language=fr-FR`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const m = await res.json();
    return {
      id: m.id,
      title: m.title,
      overview: m.overview ?? undefined,
      poster_path: m.poster_path ?? null,
      backdrop_path: m.backdrop_path ?? null,
      release_date: m.release_date ?? undefined,
      runtime: m.runtime ?? undefined,
    };
  } catch {
    return null;
  }
}
