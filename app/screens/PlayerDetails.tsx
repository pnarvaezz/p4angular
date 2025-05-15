import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { db, storage } from '../../_helpers/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

export default function PlayerDetails() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const [player, setPlayer] = useState<any>();
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isZoomed, setIsZoomed] = useState(false); 

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'players', String(playerId)));
        if (!snap.exists()) return;

        const data = snap.data();
        if (mounted) setPlayer(data);

        let rawPath = String(data.foto ?? '').trim();
        if (!rawPath) return;
        if (!rawPath.startsWith('http')) {
          rawPath = rawPath.replace(/^assets\//, '');
        }

        const url = rawPath.startsWith('http')
          ? rawPath
          : await getDownloadURL(ref(storage, rawPath));

        if (mounted) setPhotoUrl(url);
      } catch (err) {
        console.warn('⚠️  Error cargando detalle', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [playerId]);

  if (!player || !photoUrl) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const handleImagePress = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <TouchableWithoutFeedback onPress={handleImagePress}>
          <Image
            source={{ uri: photoUrl }}
            style={isZoomed ? styles.imageZoomed : styles.image} 
          />
        </TouchableWithoutFeedback>

        <Text style={styles.name}>{player.nombre} {player.apellidos}</Text>
        <Text style={styles.position}>{player.posicion}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.edad}</Text>
            <Text style={styles.statLabel}>Años</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.altura}</Text>
            <Text style={styles.statLabel}>Altura</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{player.equipo}</Text>
            <Text style={styles.statLabel}>Equipo</Text>
          </View>
        </View>

        <Pressable
          style={styles.button}
          android_ripple={{ color: '#fff', foreground: true }}
          onPress={() =>
            router.push({
              pathname: '/screens/MediaPlayer',
              params: { mediaPath: player.video },
            })
          }
        >
          <Text style={styles.buttonText}>Ver vídeo</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F2F7FF',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 110,
    marginBottom: 20,
  },
  imageZoomed: { 
    width: 400,
    height: 400,
    borderRadius: 200,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0c95f6',
    textAlign: 'center',
  },
  position: {
    fontSize: 18,
    color: '#777',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  button: {
    backgroundColor: '#0c95f6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
