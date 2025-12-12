import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyBziwhux0ts8ooK5FNR5b5cnbjhM02gaHU",
    authDomain: "lazamorana-49fe6.firebaseapp.com",
    projectId: "lazamorana-49fe6",
    storageBucket: "lazamorana-49fe6.appspot.com",
    messagingSenderId: "140653417138",
    appId: "1:140653417138:web:df6873cfd470e9c5abafab"
  };

  // Inicializar Firebase solo en el cliente
  let firebaseApp;
  let db;

  try {
    firebaseApp = initializeApp(firebaseConfig);
    
    // Inicializar Firestore con manejo de errores
    try {
      db = getFirestore(firebaseApp);
      
      // Conectar al emulador en desarrollo si está configurado
      if (process.env.NODE_ENV === 'development' && process.env.FIRESTORE_EMULATOR_HOST) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
    } catch (firestoreError) {
      console.warn('Firestore no está disponible:', firestoreError);
      db = null;
    }
  } catch (appError) {
    console.error('Error al inicializar Firebase:', appError);
    firebaseApp = null;
    db = null;
  }

  return {
    provide: {
      firebase: firebaseApp,
      firestore: db
    }
  };
}); 