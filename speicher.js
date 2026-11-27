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
  signOut, updateProfile, sendPasswordResetEmail,
  EmailAuthProvider, reauthenticateWithCredential,
  updatePassword, verifyBeforeUpdateEmail
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
  },

  /* --- Konto ändern ---------------------------------------- */

  /**
   * Ändert den Anzeigenamen: im Auth-Profil, im Nutzerdokument
   * und in jeder Runde, in der man Mitglied ist. Die Runden
   * speichern den Namen als Kopie unter mitglieder.{uid}.name,
   * damit alle ihn lesen können, ohne fremde Nutzerdokumente
   * lesen zu dürfen. Deshalb muss er dort mitgezogen werden.
   * Gibt die Namen der Runden zurück, in denen es NICHT geklappt
   * hat (meist: firestore.rules noch nicht neu eingespielt).
   */
  async nameAendern(name) {
    const nutzer = auth.currentUser;
    await updateProfile(nutzer, { displayName: name });
    await setDoc(doc(db, 'nutzer', nutzer.uid), { name }, { merge: true });

    const fehlgeschlagen = [];
    const runden = await Gruppen.meine();
    for (const g of runden) {
      try {
        // Punktpfad: ändert NUR das eigene name-Feld, die Rolle
        // bleibt. Die Regel prüft genau das.
        await updateDoc(doc(db, 'gruppen', g.id), { [`mitglieder.${nutzer.uid}.name`]: name });
      } catch (fehler) {
        console.warn(`Name in Runde ${g.id} nicht geändert:`, fehler.code);
        fehlgeschlagen.push(g.name);
      }
    }
    return fehlgeschlagen;
  },

  /** Firebase verlangt für E-Mail- und Passwortänderungen eine
      frische Anmeldung. Statt den Spieler abzumelden, fragen wir
      das aktuelle Passwort im selben Fenster ab. */
  async neuBestaetigen(passwort) {
    const nutzer = auth.currentUser;
    const nachweis = EmailAuthProvider.credential(nutzer.email, passwort);
    await reauthenticateWithCredential(nutzer, nachweis);
  },

  /**
   * Neue E-Mail-Adresse. Firebase ändert sie erst, wenn der Link
   * in der Bestätigungsmail an die NEUE Adresse angeklickt wurde.
   * So kann sich niemand durch einen Tippfehler aussperren.
   */
  async emailAendern(neueEmail, passwort) {
    await this.neuBestaetigen(passwort);
    await verifyBeforeUpdateEmail(auth.currentUser, neueEmail);
  },

  async passwortAendern(altesPasswort, neuesPasswort) {
    await this.neuBestaetigen(altesPasswort);
    await updatePassword(auth.currentUser, neuesPasswort);
  },

  /** Hält die E-Mail im Nutzerdokument aktuell, nachdem der
      Bestätigungslink angeklickt wurde (beim nächsten Anmelden). */
  async emailAbgleichen() {
    const nutzer = auth.currentUser;
    if (!nutzer?.email) return;
    await setDoc(doc(db, 'nutzer', nutzer.uid), { email: nutzer.email }, { merge: true });
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

  /** Über einen Einladungslink beitreten. Der Code wird mit
      geschrieben, damit die Sicherheitsregeln prüfen können,
      dass der Link wirklich zu dieser Runde gehört. */
  async beitretenPerLink(gid, code, name) {
    const uid = auth.currentUser.uid;
    await updateDoc(doc(db, 'gruppen', gid), {
      mitgliederIds: arrayUnion(uid),
      [`mitglieder.${uid}`]: { name, rolle: 'spieler' },
      beitrittsCode: code
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

  /** Einmal lesen (für die Spielleitung, siehe sl.js). getDoc
      fragt zuerst den Server und fällt nur ohne Netz auf den
      Offline-Speicher zurück. */
  async lesen(gid, uid) {
    const s = await getDoc(doc(db, 'gruppen', gid, 'notizbuch', uid));
    return s.exists() ? (s.data().text || '') : '';
  },

  async speichern(gid, uid, text) {
    await setDoc(doc(db, 'gruppen', gid, 'notizbuch', uid), {
      text, geaendert: serverTimestamp()
    });
  }
};

/* ============================================================
   WERKSTATT — Charaktere ohne Runde
   ============================================================
   nutzer/{uid}/charaktere/{cid}

   Damit Spieler ihren Charakter bauen können, bevor die
   Spielleitung eine Runde für sie angelegt hat. Beim Beitritt
   wird der Werkstatt-Charakter als KOPIE in die Runde übernommen
   (Charaktere.anlegen). Die Werkstatt-Fassung bleibt als Vorlage
   liegen; spätere Änderungen in der Runde wirken nicht zurück.
   Lesen und schreiben darf nur der Besitzer, siehe
   firestore.rules, match /nutzer/{uid}/charaktere/{cid}. */
function werkstattSammlung(uid) {
  return collection(db, 'nutzer', uid, 'charaktere');
}

export const Werkstatt = {

  abonnieren(uid, rueckruf) {
    return onSnapshot(werkstattSammlung(uid),
      s => rueckruf(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      fehler => {
        console.warn('Werkstatt nicht lesbar:', fehler.code);
        rueckruf([]);
      }
    );
  },

  /** Einmal laden, ohne Abo (für Listen auf der Rundenwahl) */
  async alle(uid) {
    const s = await getDocs(werkstattSammlung(uid));
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async anlegen(uid, daten) {
    const verweis = await addDoc(werkstattSammlung(uid), {
      ...daten, angelegt: serverTimestamp(), geaendert: serverTimestamp()
    });
    return verweis.id;
  },

  async aendern(uid, id, daten) {
    await updateDoc(doc(db, 'nutzer', uid, 'charaktere', id), {
      ...daten, geaendert: serverTimestamp()
    });
  },

  async loeschen(uid, id) {
    await deleteDoc(doc(db, 'nutzer', uid, 'charaktere', id));
  }
};

/* ============================================================
   EINLADUNGSLINKS
   ============================================================
   einladungen/{code}  →  { gid, name }

   Der Code ist zufällig und lang genug, dass man ihn nicht
   erraten kann. Er steht im Link (spiel.html?einladung=CODE),
   den die Spielleitung z. B. in einer Signal-Gruppe teilt. Der
   aktuelle Code steht zusätzlich in der Runde (einladungsCode),
   damit die Spielleitung ihn wieder anzeigen und erneuern kann.
   Regeln: firestore.rules, match /einladungen/{code}. */

function zufallsCode() {
  // Ohne leicht verwechselbare Zeichen (0/O, 1/l/I), falls
  // jemand den Link doch einmal abtippt.
  const zeichen = 'abcdefghijkmnpqrstuvwxyz23456789';
  const zahlen = crypto.getRandomValues(new Uint32Array(20));
  return Array.from(zahlen, z => zeichen[z % zeichen.length]).join('');
}

export const Einladungen = {

  /** Liest eine Einladung; null, wenn der Code ungültig ist */
  async lesen(code) {
    try {
      const s = await getDoc(doc(db, 'einladungen', code));
      return s.exists() ? { code, ...s.data() } : null;
    } catch (fehler) {
      console.warn('Einladung nicht lesbar:', fehler.code);
      return null;
    }
  },

  /** Legt einen neuen Link an; ein alter Code wird ungültig */
  async erneuern(gid, rundenName, alterCode) {
    const code = zufallsCode();
    await setDoc(doc(db, 'einladungen', code), {
      gid, name: rundenName, angelegt: serverTimestamp()
    });
    await updateDoc(doc(db, 'gruppen', gid), { einladungsCode: code });
    if (alterCode) {
      try { await deleteDoc(doc(db, 'einladungen', alterCode)); }
      catch (fehler) { console.warn('Alter Link nicht gelöscht:', fehler.code); }
    }
    return code;
  },

  /** Link abschalten, ohne einen neuen anzulegen */
  async abschalten(gid, code) {
    await updateDoc(doc(db, 'gruppen', gid), { einladungsCode: null });
    try { await deleteDoc(doc(db, 'einladungen', code)); }
    catch (fehler) { console.warn('Link nicht gelöscht:', fehler.code); }
  }
};
