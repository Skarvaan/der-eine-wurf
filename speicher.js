/* ============================================================
   SPEICHER — Firestore-Anbindung
   ============================================================

   Die gesamte App spricht nur über dieses Modul mit der
   Datenbank. app.js und die Ansichtsmodule kennen weder
   Firestore noch Firebase Auth direkt.

   ------------------------------------------------------------
   DATENMODELL
   ------------------------------------------------------------

   nutzer/{uid}
     name, email, letzteGruppe

   gruppen/{gid}
     name             Name der Runde
     slUid            wer Spielleiter ist
     mitgliederIds[]  Liste der UIDs (für Abfragen + Regeln)
     mitglieder{}     { uid: { name, rolle } }
     eingeladeneMails[]  wer beitreten darf, aber noch nicht drin ist
     freigaben        { steigern: bool }

   gruppen/{gid}/charaktere/{cid}
     besitzer, name, attribute{}, fertigkeiten{}, ...
     → Spieler schreibt nur den eigenen, SL alle
     → ACHTUNG: alle Mitglieder DÜRFEN DAS LESEN. Private Notizen
       gehören deshalb NICHT hierher, siehe notizbuch/{uid} unten.

   gruppen/{gid}/notizbuch/{uid}
     text
     → Dokument-ID ist die eigene UID. Nur die Person selbst
       schreibt; sie selbst und die Spielleitung lesen mit.
       Andere Mitspieler sehen das nicht.

   gruppen/{gid}/geteilt/{did}
     typ: 'journal' | 'indiz' | 'ort' | 'nsc'
     → alle Mitglieder lesen; schreiben: SL alles, Spieler nur Journal

   gruppen/{gid}/sl/{did}
     typ: 'fall' | 'welt' | 'notiz' | 'geheim'
     → nur der Spielleiter, für Spieler komplett unsichtbar

   Die Trennung in drei Sammlungen ist Absicht: Sie ist die
   Grundlage der Sicherheitsregeln. Was ein Spieler nicht sehen
   soll, liegt in einer Sammlung, die er gar nicht erst lesen
   darf — nicht in einem Feld, das die Oberfläche ausblendet.
   ============================================================ */

import { FIREBASE_KONFIG, CDN } from './firebase-konfig.js';

/* Firebase-Module vom CDN nachladen */
const { initializeApp } = await import(`${CDN}/firebase-app.js`);

const {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, sendPasswordResetEmail
} = await import(`${CDN}/firebase-auth.js`);

const {
  getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, addDoc, onSnapshot, query, where, serverTimestamp,
  arrayUnion, arrayRemove, enableIndexedDbPersistence
} = await import(`${CDN}/firebase-firestore.js`);

const app  = initializeApp(FIREBASE_KONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

/* Lokaler Zwischenspeicher: Die App funktioniert damit auch,
   wenn am Spieltisch das Netz wegbricht. Sobald wieder
   Verbindung besteht, gleicht Firestore selbständig ab.
   Schlägt fehl, wenn die App in mehreren Tabs offen ist —
   das ist unkritisch, dann läuft sie eben online. */
try {
  await enableIndexedDbPersistence(db);
} catch (e) {
  console.info('Offline-Speicher nicht aktiv (mehrere Tabs offen?).');
}

/* ============================================================
   ANMELDUNG
   ============================================================ */

export const Auth = {

  /** Ruft die Funktion bei jedem An- und Abmelden auf */
  beobachten(rueckruf) {
    return onAuthStateChanged(auth, rueckruf);
  },

  /** Aktueller Nutzer oder null */
  nutzer() {
    return auth.currentUser;
  },

  async registrieren(email, passwort, name) {
    const ergebnis = await createUserWithEmailAndPassword(auth, email, passwort);
    await updateProfile(ergebnis.user, { displayName: name });

    // Ein Nutzerdokument anlegen, damit wir den Namen später
    // auch ohne Auth-Objekt kennen
    await setDoc(doc(db, 'nutzer', ergebnis.user.uid), {
      name, email, angelegt: serverTimestamp()
    });

    return ergebnis.user;
  },

  async anmelden(email, passwort) {
    const ergebnis = await signInWithEmailAndPassword(auth, email, passwort);
    return ergebnis.user;
  },

  async abmelden() {
    return signOut(auth);
  },

  async passwortZuruecksetzen(email) {
    return sendPasswordResetEmail(auth, email);
  }
};

/* ============================================================
   GRUPPEN
   ============================================================ */

export const Gruppen = {

  /**
   * Legt eine neue Runde an. Wer sie anlegt, ist Spielleiter.
   */
  async anlegen(name, slName) {
    const uid = auth.currentUser.uid;
    const verweis = doc(collection(db, 'gruppen'));

    await setDoc(verweis, {
      name,
      slUid: uid,
      mitgliederIds: [uid],
      mitglieder: { [uid]: { name: slName, rolle: 'sl' } },
      eingeladeneMails: [],
      freigaben: { steigern: false },
      angelegt: serverTimestamp()
    });

    return verweis.id;
  },

  /** Alle Gruppen, in denen ich Mitglied bin */
  async meine() {
    const uid = auth.currentUser.uid;
    const abfrage = query(collection(db, 'gruppen'), where('mitgliederIds', 'array-contains', uid));
    const schnappschuss = await getDocs(abfrage);
    return schnappschuss.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /** Gruppen, in die ich eingeladen wurde, aber noch nicht drin bin */
  async einladungen() {
    const email = auth.currentUser.email;
    const abfrage = query(collection(db, 'gruppen'), where('eingeladeneMails', 'array-contains', email));
    const schnappschuss = await getDocs(abfrage);
    return schnappschuss.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(g => !g.mitgliederIds.includes(auth.currentUser.uid));
  },

  /** Einer Gruppe beitreten, in die ich eingeladen wurde */
  async beitreten(gid, name) {
    const uid = auth.currentUser.uid;
    await updateDoc(doc(db, 'gruppen', gid), {
      mitgliederIds: arrayUnion(uid),
      [`mitglieder.${uid}`]: { name, rolle: 'spieler' }
    });
  },

  /** Der Spielleiter lädt jemanden per E-Mail ein */
  async einladen(gid, email) {
    await updateDoc(doc(db, 'gruppen', gid), {
      eingeladeneMails: arrayUnion(email.trim().toLowerCase())
    });
  },

  async einladungZuruecknehmen(gid, email) {
    await updateDoc(doc(db, 'gruppen', gid), {
      eingeladeneMails: arrayRemove(email)
    });
  },

  /** Laufend über Änderungen an der Gruppe informiert werden */
  abonnieren(gid, rueckruf) {
    return onSnapshot(doc(db, 'gruppen', gid),
      s => rueckruf(s.exists() ? { id: s.id, ...s.data() } : null),
      fehler => {
        // Tritt auf, wenn die Runde gelöscht wurde oder der
        // Zugriff entzogen ist. Auch dann muss der Rückruf
        // kommen, sonst hängt die App auf der Ladeanzeige.
        console.warn('Runde nicht lesbar:', fehler.code);
        rueckruf(null);
      }
    );
  },

  /** Freigaben ändern (nur Spielleiter) */
  async freigabeSetzen(gid, schluessel, wert) {
    await updateDoc(doc(db, 'gruppen', gid), { [`freigaben.${schluessel}`]: wert });
  }
};

/* ============================================================
   SAMMLUNGEN — charaktere, geteilt, sl
   ============================================================
   Alle drei funktionieren gleich, deshalb eine gemeinsame
   Fabrik. Das spart Code und sorgt dafür, dass sich alle
   Bereiche identisch verhalten.
   ============================================================ */

function sammlung(name) {
  return {

    /**
     * Hört laufend auf alle Dokumente dieser Sammlung.
     * Der Rückruf bekommt bei JEDER Änderung die komplette
     * Liste — auch bei Änderungen von anderen Geräten.
     * Das ist die eigentliche Synchronisierung.
     *
     * @returns {function} aufrufen beendet das Abo
     */
    abonnieren(gid, rueckruf) {
      return onSnapshot(
        collection(db, 'gruppen', gid, name),
        schnappschuss => {
          rueckruf(schnappschuss.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        fehler => {
          // Tritt normalerweise nur auf, wenn ein Spieler
          // versucht, die SL-Sammlung zu lesen — dafür sind
          // die Sicherheitsregeln da.
          console.warn(`Kein Zugriff auf "${name}":`, fehler.code);
          rueckruf([]);
        }
      );
    },

    async anlegen(gid, daten) {
      const verweis = await addDoc(collection(db, 'gruppen', gid, name), {
        ...daten,
        autorUid: auth.currentUser.uid,
        autorName: auth.currentUser.displayName || auth.currentUser.email,
        angelegt: serverTimestamp(),
        geaendert: serverTimestamp()
      });
      return verweis.id;
    },

    async aendern(gid, id, daten) {
      await updateDoc(doc(db, 'gruppen', gid, name, id), {
        ...daten, geaendert: serverTimestamp()
      });
    },

    async loeschen(gid, id) {
      await deleteDoc(doc(db, 'gruppen', gid, name, id));
    },

    async einzeln(gid, id) {
      const s = await getDoc(doc(db, 'gruppen', gid, name, id));
      return s.exists() ? { id: s.id, ...s.data() } : null;
    }
  };
}

export const Charaktere = sammlung('charaktere');
export const Geteilt    = sammlung('geteilt');
export const SLNotizen  = sammlung('sl');

/* ============================================================
   NOTIZBUCH — private Notizen je Person
   ============================================================
   Kein Fall für die Sammlungs-Fabrik oben: Es gibt genau EIN
   Dokument pro Person (Dokument-ID = die eigene UID), keine
   Liste mit auto-generierten IDs. Siehe firestore.rules,
   match /notizbuch/{uid} — nur Besitzer und Spielleitung lesen. */
export const Notizbuch = {

  /** Hört auf die eigenen Notizen. Der Rückruf bekommt den Text
      (leer, solange noch nichts gespeichert wurde). */
  abonnieren(gid, uid, rueckruf) {
    return onSnapshot(doc(db, 'gruppen', gid, 'notizbuch', uid),
      s => rueckruf(s.exists() ? (s.data().text || '') : ''),
      fehler => {
        console.warn('Notizbuch nicht lesbar:', fehler.code);
        rueckruf('');
      }
    );
  },

  async speichern(gid, uid, text) {
    await setDoc(doc(db, 'gruppen', gid, 'notizbuch', uid), {
      text, geaendert: serverTimestamp()
    });
  }
};
