import { Stack, Link } from 'expo-router';
import { Text, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

/**
 * Layout raíz de Expo Router + registro de listeners FCM.
 *  - Pide permisos de notificación (POST_NOTIFICATIONS en Android 13+).
 *  - Obtiene y guarda el token FCM en la colección "tokens".
 *  - Muestra un Alert cuando llega un push en primer plano.
 *  - Gestiona aperturas de notificación desde background / quit state.
 */
export default function RootLayout() {
  useFirebaseMessaging();
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#0c95f6' },

        // Titular clicable → HomeScreen
        headerTitle: () => (
          <Link
            href="/screens/HomeScreen"
            replace
            asChild
          >
            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 28 }}>
              Equipo Basket
            </Text>
          </Link>
        ),
      }}
    >
      <Stack.Screen name="screens/HomeScreen" options={{ title: 'Inicio' }} />
      <Stack.Screen name="screens/PlayerDetails" options={{ title: 'Detalle' }} />
      <Stack.Screen name="screens/MediaPlayer" options={{ title: 'Reproductor' }} />
    </Stack>
  );
}

function useFirebaseMessaging() {
  useEffect(() => {
    const init = async () => {
      /* ------------------------------------------------------------------ *
       * 1. Permisos                                                        *
       * ------------------------------------------------------------------ */
      if (Platform.OS === 'android') {
        // Android 13+ necesita POST_NOTIFICATIONS
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }
        // Registro necesario en Android para FCM
        await messaging().registerDeviceForRemoteMessages();
      }

      // iOS (y refuerzo para Android) – pide permiso al usuario
      await messaging().requestPermission();

      /* ------------------------------------------------------------------ *
       * 2. Token FCM → Firestore                                           *
       * ------------------------------------------------------------------ */
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Guarda / actualiza el token en la colección "tokens"
      await firestore()
        .collection('tokens')
        .doc(token) // usamos el token como ID
        .set(
          {
            updatedAt: firestore.FieldValue.serverTimestamp(),
            platform: Platform.OS,
            // uid: auth().currentUser?.uid ?? null,  // descomenta si usas Firebase Auth
          },
          { merge: true },
        );

      // Si el token se refresca (p. ej. reinstalación o borrado de caché)
      const unsubOnTokenRefresh = messaging().onTokenRefresh(async newToken => {
        console.log('FCM Token refrescado:', newToken);
        await firestore()
          .collection('tokens')
          .doc(newToken)
          .set(
            { updatedAt: firestore.FieldValue.serverTimestamp(), platform: Platform.OS },
            { merge: true },
          );
      });

      /* ------------------------------------------------------------------ *
       * 3. Mensajes con la app en primer plano                             *
       * ------------------------------------------------------------------ */
      const unsubOnMessage = messaging().onMessage(async msg => {
        Alert.alert(msg.notification?.title ?? 'Mensaje', msg.notification?.body ?? '');
      });

      /* ------------------------------------------------------------------ *
       * 4. Cuando el usuario toca la notificación (app en background)      *
       * ------------------------------------------------------------------ */
      const unsubOnOpened = messaging().onNotificationOpenedApp(msg => {
        console.log('Notificación abierta desde background:', msg);
        // TODO: Navegar según msg.data si lo necesitas
      });

      /* ------------------------------------------------------------------ *
       * 5. Si la app se abrió desde quit state a causa de una notificación *
       * ------------------------------------------------------------------ */
      const initialMsg = await messaging().getInitialNotification();
      if (initialMsg) {
        console.log('Notificación que abrió la app (quit state):', initialMsg);
        // TODO: Navegar / procesar datos
      }

      /* ------------------------------------------------------------------ *
       * Limpieza al desmontar                                              *
       * ------------------------------------------------------------------ */
      return () => {
        unsubOnMessage();
        unsubOnOpened();
        unsubOnTokenRefresh();
      };
    };

    init().catch(err => console.warn('FCM init error', err));
  }, []);
}
