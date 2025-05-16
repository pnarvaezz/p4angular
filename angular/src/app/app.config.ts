// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

import { environment } from '../environments/environment';

// —Opcional— si usas SW registrado por @angular/pwa
import { ServiceWorkerModule } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Firebase v10 modular
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),

    // registra el SW sólo en prod
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
      })
    ),
  ],
};
