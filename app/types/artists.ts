type ArtworkT = {
  name: string;
  id: string;
  image: string;
  _id: string;
}

export type ArtistT = {
  _id: string;
  name: string;
  instagram?: string;
  artworks: ArtworkT[];
  slug?: string;
}

export type ArtistsT = ArtistT[];
