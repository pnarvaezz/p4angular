import { Stack, Link } from 'expo-router';
import { Text, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

/**
 * Layout raíz de Expo Router + registro de listeners FCM.
 *  - Pide permisos de notificación (POST_NOTIFICATIONS en Android 13+).
 *  - Obtiene y muestra el token FCM (puedes enviarlo a tu backend).
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
            href="/screens/HomeScreen"   // ruta de tu pantalla
            replace                       // evita duplicar la misma ruta en la pila
            asChild                       // Link solo aporta navegación; deja el aspecto al hijo
          >
            <Text
              style={{
                fontWeight: 'bold',
                color: '#fff',
                fontSize: 28,
              }}
            >
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
      // 1. Permisos (Android 13+ requiere POST_NOTIFICATIONS)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      // iOS y seguridad adicional
      await messaging().requestPermission();

      // 2. Token FCM
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // 3. Mensajes con la app en primer plano
      const unsubOnMessage = messaging().onMessage(async msg => {
        Alert.alert(
          msg.notification?.title ?? 'Mensaje',
          msg.notification?.body ?? '',
        );
      });

      // 4. Cuando el usuario toca la notificación (app en background)
      const unsubOnOpened = messaging().onNotificationOpenedApp(msg => {
        console.log('Notificación abierta desde background:', msg);
        // Ejemplo: navegar a una pantalla según msg.data
      });

      // 5. Si la app se abrió desde "quit state"
      messaging().getInitialNotification().then(msg => {
        if (msg) {
          console.log('Notificación que abrió la app (quit state):', msg);
        }
      });

      // Limpieza al desmontar
      return () => {
        unsubOnMessage();
        unsubOnOpened();
      };
    };

    init().catch(err => console.warn('FCM init error', err));
  }, []);
}
