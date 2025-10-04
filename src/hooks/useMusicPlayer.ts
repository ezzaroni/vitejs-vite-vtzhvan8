import { useState, useCallback, useEffect } from "react";
import { GeneratedMusic } from "@/types/music";
import { useAccount } from "wagmi";

export const useMusicPlayer = () => {
  const { address } = useAccount();
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Load last played song from localStorage when wallet is connected
  useEffect(() => {
    if (address) {
      const storageKey = `hibeats_last_song_${address}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          
          // Check if data is not too old (30 days max)
          const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
          if (parsedData.timestamp && (Date.now() - parsedData.timestamp) > maxAge) {
            localStorage.removeItem(storageKey);
            return;
          }
          
          // Handle both old format (full objects) and new format (essential data)
          const song = parsedData.song;
          const savedPlaylist = parsedData.playlist || [song];
          const index = parsedData.index || 0;
          
          if (song && song.title) { // Basic validation
            setCurrentSong(song);
            setPlaylist(savedPlaylist);
            setCurrentIndex(Math.min(index, savedPlaylist.length - 1));
            setIsPlayerVisible(true);
          }
        } catch (error) {
          console.error('Error loading last played song:', error);
          // Clear corrupted data
          localStorage.removeItem(storageKey);
        }
      }
    } else {
      // Clear player state when wallet is disconnected
      setCurrentSong(null);
      setPlaylist([]);
      setCurrentIndex(0);
      setIsPlayerVisible(false);
    }
  }, [address]);

  // Save current song to localStorage whenever it changes
  useEffect(() => {
    if (address && currentSong) {
      const storageKey = `hibeats_last_song_${address}`;
      
      // Only save essential song data to avoid storage bloat
      const essentialSongData = {
        id: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        imageUrl: currentSong.imageUrl,
        audioUrl: currentSong.audioUrl,
        duration: currentSong.duration,
        genre: currentSong.genre
      };
      
      const dataToSave = {
        song: essentialSongData,
        playlist: playlist.slice(0, 10).map(song => ({ // Limit playlist to 10 songs
          id: song.id,
          title: song.title,
          artist: song.artist,
          imageUrl: song.imageUrl,
          audioUrl: song.audioUrl,
          duration: song.duration,
          genre: song.genre
        })),
        index: Math.min(currentIndex, 9), // Ensure index is within saved playlist bounds
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving last played song:', error);
        // If storage is full, try to save minimal data
        try {
          const minimalData = {
            song: essentialSongData,
            timestamp: Date.now()
          };
          localStorage.setItem(storageKey, JSON.stringify(minimalData));
        } catch (minimalError) {
          console.error('Error saving minimal song data:', minimalError);
        }
      }
    }
  }, [address, currentSong, playlist, currentIndex]);
  useEffect(() => {
    if (currentSong && playlist.length > 0) {
      // Check if current song still exists in updated playlist
      const updatedIndex = playlist.findIndex(song => song.id === currentSong.id);
      if (updatedIndex === -1) {
        // Current song was removed, clear player
        setCurrentSong(null);
        setIsPlayerVisible(false);
        setCurrentIndex(0);
      } else {
        // Update index if song is still there
        setCurrentIndex(updatedIndex);
      }
    }
  }, [playlist, currentSong]);

  const playSong = useCallback((song: any, songPlaylist?: any[]) => {
    setCurrentSong(song);
    
    if (songPlaylist) {
      setPlaylist(songPlaylist);
      const index = songPlaylist.findIndex(s => s.id === song.id);
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      setPlaylist([song]);
      setCurrentIndex(0);
    }
    
    setIsPlayerVisible(true);
  }, []);

  const playNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(playlist[nextIndex]);
    } else if (playlist.length > 0) {
      // Loop back to first song
      setCurrentIndex(0);
      setCurrentSong(playlist[0]);
    }
  }, [currentIndex, playlist]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSong(playlist[prevIndex]);
    } else if (playlist.length > 0) {
      // Loop to last song
      const lastIndex = playlist.length - 1;
      setCurrentIndex(lastIndex);
      setCurrentSong(playlist[lastIndex]);
    }
  }, [currentIndex, playlist]);

  const changeSong = useCallback((song: any, index: number) => {
    setCurrentSong(song);
    setCurrentIndex(index);
  }, []);

  const closePlayer = useCallback(() => {
    setIsPlayerVisible(false);
    setCurrentSong(null);
  }, []);

  const stopAudio = useCallback(() => {
    // This will be handled by the MusicPlayer component
    // We just need to signal that audio should be stopped
    setCurrentSong(null);
    setPlaylist([]);
    setCurrentIndex(0);
    setIsPlayerVisible(false);
  }, []);

  const updatePlaylist = useCallback((newPlaylist: GeneratedMusic[]) => {
    setPlaylist(newPlaylist);
    
    // If current song is not in new playlist, reset
    if (currentSong && !newPlaylist.find(song => song.id === currentSong.id)) {
      setCurrentSong(null);
      setCurrentIndex(0);
      setIsPlayerVisible(false);
    } else if (currentSong) {
      // Update current index if song is still in playlist
      const newIndex = newPlaylist.findIndex(song => song.id === currentSong.id);
      if (newIndex >= 0) {
        setCurrentIndex(newIndex);
      }
    }
  }, [currentSong]);

  return {
    currentSong,
    playlist,
    currentIndex,
    isPlayerVisible,
    playSong,
    playNext,
    playPrevious,
    changeSong,
    closePlayer,
    stopAudio,
    updatePlaylist
  };
};
