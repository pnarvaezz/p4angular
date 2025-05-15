import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Button, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { storage } from '../../_helpers/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

const { width } = Dimensions.get('window');
const HEIGHT = width * 9 / 16;

export default function MediaPlayer() {
  const { mediaPath } = useLocalSearchParams<{ mediaPath: string }>();
  const [url, setUrl] = useState<string>();
  const [isYouTube, setIsYouTube] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!mediaPath) return;
      let raw = String(mediaPath).trim();

      // YouTube
      if (/(youtube\.com|youtu\.be)/i.test(raw)) {
        if (raw.includes('watch?v=')) {
          const id = raw.split('watch?v=')[1].split('&')[0];
          raw = `https://www.youtube.com/embed/${id}`;
        } else if (raw.includes('youtu.be/')) {
          const id = raw.split('youtu.be/')[1].split('?')[0];
          raw = `https://www.youtube.com/embed/${id}`;
        }
        if (active) {
          setIsYouTube(true);
          setUrl(raw);
        }
        return;
      }

      // MP4 directo o Firebase Storage
      try {
        const final = raw.startsWith('http')
          ? raw
          : await getDownloadURL(ref(storage, raw));

        if (active) {
          setIsYouTube(false);
          setUrl(final);
        }
      } catch (err) {
        console.warn('⚠️  Error cargando video', err);
      }
    };

    load();
    return () => { active = false; };
  }, [mediaPath]);

  if (!url) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      {isYouTube ? (
        <WebView
          source={{ uri: url }}
          style={{ width: '100%', height: HEIGHT }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      ) : (
        <Video
          source={{ uri: url }}
          style={{ width: '100%', height: HEIGHT }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />
      )}
      <Button title="Cerrar" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
});
