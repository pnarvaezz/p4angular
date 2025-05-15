/**
 * Entrypoint para Expo Router **+** handler de Firebase Messaging
 * (coloca este archivo en la raíz del proyecto, NO dentro de /app).
 */

import messaging from '@react-native-firebase/messaging';

// Se ejecuta cuando llega un mensaje con la app cerrada o en segundo plano
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Mensaje FCM en segundo plano:', remoteMessage);
});

import 'expo-router/entry';        //  🔸 SIEMPRE el último import
