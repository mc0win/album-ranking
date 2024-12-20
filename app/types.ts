interface Song {
  id: number;
  name: string;
}

interface AlbumQuery {
  result: SearchResult | null;
}

interface SearchResult {
  albumName: string;
  songs: Song[];
}
