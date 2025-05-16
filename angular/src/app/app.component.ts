// src/app/app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `<h1>¡PWA con FCM!</h1>`
})
export class AppComponent implements OnInit {
  private messaging = inject(Messaging);
  private db = inject(Firestore);

  async ngOnInit() {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey
      });

      // Guarda el token en Firestore
      await setDoc(
        doc(this.db, 'tokens', token),
        { updatedAt: Date.now() },
        { merge: true }
      );

      // ➜ Muestra el token en la consola del navegador
      console.log('FCM token:', token);
    }

    // Notificaciones recibidas en primer plano
    onMessage(this.messaging, msg =>
      console.log('FCM foreground message:', msg)
    );
  }
}
