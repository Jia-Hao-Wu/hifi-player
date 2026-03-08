export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  uri: string;
}

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Chill Vibes',
    artist: 'Lo-Fi Beats',
    album: 'Study Session',
    artwork: 'https://picsum.photos/seed/track1/300',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Synthwave Dreams',
    album: 'Neon City',
    artwork: 'https://picsum.photos/seed/track2/300',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Morning Coffee',
    artist: 'Acoustic Collective',
    album: 'Sunrise Sessions',
    artwork: 'https://picsum.photos/seed/track3/300',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];
