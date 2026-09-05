/* ============================================================
   FIREBASE-KONFIGURATION
   ============================================================

   Diese Werte stammen aus der Firebase-Konsole:
   Zahnrad → Projekteinstellungen → Meine Apps → Web-App.

   ------------------------------------------------------------
   IST DAS EIN GEHEIMNIS?
   ------------------------------------------------------------
   Nein. Diese Werte sind öffentlich und dürfen im Repo stehen.
   Sie identifizieren nur dein Projekt — sie berechtigen zu
   nichts. Der Schutz deiner Daten kommt ausschließlich aus den
   Sicherheitsregeln (Datei firestore.rules), die auf Googles
   Servern laufen und nicht umgangen werden können.

   Merksatz: Die Konfiguration ist die Postadresse.
             Die Regeln sind das Türschloss.
   ============================================================ */

export const FIREBASE_KONFIG = {
  apiKey:            "AIzaSyA_Wm46EeNisrtQ8qmlkDFyweC5n3qKDoE",
  authDomain:        "der-eine-wurf.firebaseapp.com",
  projectId:         "der-eine-wurf",
  storageBucket:     "der-eine-wurf.firebasestorage.app",
  messagingSenderId: "634088666735",
  appId:             "1:634088666735:web:93bb2683ad9d910e8a7f9a"
};

/* ------------------------------------------------------------
   Firebase-Module direkt vom Google-CDN.
   Kein npm, kein Build-Schritt — genau wie der Rest des
   Projekts. Die Versionsnummer ist bewusst festgeschrieben,
   damit ein Update von Google nicht unangekündigt etwas
   kaputtmacht.
   ------------------------------------------------------------ */

const V = '11.6.0';
export const CDN = `https://www.gstatic.com/firebasejs/${V}`;
