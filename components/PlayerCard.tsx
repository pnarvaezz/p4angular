import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../_helpers/firebase';   // <- ajusta si moviste la carpeta

interface Player {
  id: string;
  nombre: string;
  apellidos: string;
  posicion: string;
  edad: number;
  foto: string;   // puede ser URL completa o ruta en el bucket
}

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  const [url, setUrl] = useState<string>();


  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!player.foto) return;

        // Quita "assets/" y espacios accidentales
        const rawPath = player.foto.startsWith('http') ? player.foto : player.foto.replace(/^assets\//, '').trim();

        if (rawPath.startsWith('http')) {
          setUrl(rawPath);               // URL externa
        } else {
          const u = await getDownloadURL(ref(storage, rawPath));
          if (mounted) setUrl(u);
        }
      } catch (err) {
        console.warn(`⚠️  No se pudo cargar la foto "${player.foto}"`, err);
      }
    };



    load();
    return () => { mounted = false; };
  }, [player.foto]);

  return (
    <View style={styles.card}>
      {url ? (
        <Image source={{ uri: url }} style={styles.image} />
      ) : (
        <ActivityIndicator style={styles.image} />
      )}
      <Text style={styles.name}>{player.nombre} {player.apellidos}</Text>
      <Text style={styles.position}>{player.posicion}</Text>
      <Text style={styles.stats}>Edad: {player.edad}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6
  },
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  position: { fontSize: 14, color: '#555' },
  stats: { fontSize: 14, color: '#888' },
});

export default PlayerCard;
