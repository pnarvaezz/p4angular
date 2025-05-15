import React, { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import PlayerCard from '../../components/PlayerCard';

import { db } from '../../_helpers/firebase';
import {
  collection,
  orderBy,
  limit,
  startAfter,
  query,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

interface Player extends DocumentData {
  id: string;
}

const PAGE = 10;

export default function HomeScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async (first = false) => {
    const q = first
      ? query(collection(db, 'players'), orderBy('nombre'), limit(PAGE))
      : query(collection(db, 'players'), orderBy('nombre'), startAfter(lastDoc), limit(PAGE));

    const snap = await getDocs(q);
    if (snap.empty) return;

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPlayers((prev) => (first ? list : [...prev, ...list]));
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPlayers(true);
      return () => { };
    }, [])
  );

  const renderItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: '/screens/PlayerDetails', params: { playerId: item.id } })
      }
    >
      <PlayerCard player={item} />
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Jugadores</Text>
      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        onEndReached={() => fetchPlayers()}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
