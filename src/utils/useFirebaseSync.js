import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, FIREBASE_CONFIGURED } from '../firebase';

const ROOM_CODE_KEY = 'coc_7e_sync_room_code';

// Fields of campaign state that are synced to Firestore.
// UI-only state (activeCharacterId, sidebar, diceLog) is excluded intentionally.
const SYNC_FIELDS = ['name', 'characters', 'combat', 'timers', 'timeState', 'schemaVersion'];

/**
 * Generates a random 6-character uppercase room code.
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/I/1 ambiguity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Loads the persisted room code from localStorage, or generates + saves a new one.
 */
export function loadOrCreateRoomCode() {
  try {
    const existing = localStorage.getItem(ROOM_CODE_KEY);
    if (existing && existing.length === 6) return existing;
  } catch {}
  const fresh = generateRoomCode();
  try {
    localStorage.setItem(ROOM_CODE_KEY, fresh);
  } catch {}
  return fresh;
}

/**
 * Helper to compute a clean JSON payload hash of synced fields (excluding timestamps/sentinels).
 */
function computePayloadHash(data) {
  if (!data) return '';
  const payload = {};
  for (const key of SYNC_FIELDS) {
    if (data[key] !== undefined) payload[key] = data[key];
  }
  return JSON.stringify(payload);
}

/**
 * useFirebaseSync — subscribes to Firestore campaign document and pushes
 * local campaign state changes up on a debounced schedule.
 *
 * @param {object} campaign      — current campaign state from React
 * @param {function} onRemoteUpdate — called when Firestore pushes a new snapshot
 * @param {boolean} isKeeper     — if false, only subscribes (read-only)
 * @returns {{ syncStatus, roomCode, setRoomCode, isConfigured }}
 */
export function useFirebaseSync(campaign, onRemoteUpdate, isKeeper = true) {
  const [roomCode, setRoomCodeState] = useState(loadOrCreateRoomCode);
  const [syncStatus, setSyncStatus] = useState(
    FIREBASE_CONFIGURED ? 'connecting' : 'unconfigured'
  );

  // Track the most recent data hash to prevent echo-write loops
  const lastSyncedHashRef = useRef('');
  const writeTimerRef = useRef(null);

  const setRoomCode = useCallback((code) => {
    const cleaned = code.toUpperCase().trim().slice(0, 6);
    setRoomCodeState(cleaned);
    try {
      localStorage.setItem(ROOM_CODE_KEY, cleaned);
    } catch {}
  }, []);

  // ── Firestore listener ───────────────────────────────────────────────────
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !db || !roomCode || roomCode.length !== 6) {
      setSyncStatus('unconfigured');
      return;
    }

    setSyncStatus('connecting');
    const ref = doc(db, 'campaigns', roomCode);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const incomingHash = computePayloadHash(data);
          // Only trigger React state update if remote content actually differs
          if (incomingHash && incomingHash !== lastSyncedHashRef.current) {
            lastSyncedHashRef.current = incomingHash;
            onRemoteUpdate(data);
          }
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.error('[Keeper Tracker] Firestore sync error:', err);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, [roomCode, onRemoteUpdate]);

  // ── Firestore write (debounced 1.5s, Keeper only) ─────────────────────────
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !db || !isKeeper || !roomCode || roomCode.length !== 6) return;

    const currentHash = computePayloadHash(campaign);
    if (!currentHash || currentHash === lastSyncedHashRef.current) return;

    clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(async () => {
      try {
        setSyncStatus('saving');
        lastSyncedHashRef.current = currentHash;

        const syncData = {};
        for (const key of SYNC_FIELDS) {
          if (campaign[key] !== undefined) syncData[key] = campaign[key];
        }
        syncData.updatedAt = serverTimestamp();

        const ref = doc(db, 'campaigns', roomCode);
        await setDoc(ref, syncData, { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        console.error('[Keeper Tracker] Firestore write failed:', err);
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(writeTimerRef.current);
  }, [campaign, roomCode, isKeeper]);

  return {
    syncStatus,
    roomCode,
    setRoomCode,
    isConfigured: FIREBASE_CONFIGURED,
  };
}

/**
 * useFirestoreInvestigatorSync — for the Investigator view.
 * Reads the GM campaign document (characters, timeState) in real-time.
 * Also writes the investigator's own character to a sub-collection.
 *
 * @param {string} roomCode
 * @param {function} onGmUpdate  — receives { characters, timeState } from GM
 * @param {object|null} investigator  — the investigator's own character
 */
export function useFirestoreInvestigatorSync(roomCode, onGmUpdate, investigator) {
  const [syncStatus, setSyncStatus] = useState(
    FIREBASE_CONFIGURED ? 'connecting' : 'unconfigured'
  );
  const writeTimerRef = useRef(null);
  const lastSyncedHashRef = useRef('');

  // Subscribe to the GM campaign doc
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !db || !roomCode || roomCode.length !== 6) {
      setSyncStatus('unconfigured');
      return;
    }

    setSyncStatus('connecting');
    const ref = doc(db, 'campaigns', roomCode);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const hash = JSON.stringify({ c: data.characters, t: data.timeState });
          if (hash !== lastSyncedHashRef.current) {
            lastSyncedHashRef.current = hash;
            onGmUpdate({ characters: data.characters, timeState: data.timeState });
          }
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.error('[Keeper Tracker] Investigator sync error:', err);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, [roomCode, onGmUpdate]);

  // Push investigator's own character updates to sub-collection
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !db || !roomCode || !investigator?.id) return;

    const payloadHash = JSON.stringify(investigator);
    if (payloadHash === lastSyncedHashRef.current) return;

    clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(async () => {
      try {
        lastSyncedHashRef.current = payloadHash;
        const ref = doc(db, 'campaigns', roomCode, 'investigators', investigator.id);
        await setDoc(ref, { ...investigator, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.error('[Keeper Tracker] Investigator write failed:', err);
      }
    }, 1500);

    return () => clearTimeout(writeTimerRef.current);
  }, [investigator, roomCode]);

  return { syncStatus, isConfigured: FIREBASE_CONFIGURED };
}
