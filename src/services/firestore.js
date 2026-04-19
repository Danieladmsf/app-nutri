import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export const collections = {
  CLIENTS: 'clients',
  VISITS: 'visits',
  LAUDOS: 'laudos'
};

// --- Clients ---
export const subscribeToClients = (callback) => {
  const q = query(collection(db, collections.CLIENTS), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(clients);
  }, (error) => {
    console.error("Error subscribing to clients:", error);
    callback([]);
  });
};

export const saveClient = async (clientData, overrides = {}) => {
  const isNew = String(clientData.id).startsWith('_temp_') || !clientData.id;
  // If no real ID, create a new document reference
  const docRef = isNew ? doc(collection(db, collections.CLIENTS)) : doc(db, collections.CLIENTS, String(clientData.id));
  
  const payload = {
    ...clientData,
    ...overrides,
    updatedAt: serverTimestamp()
  };
  
  if (isNew) payload.createdAt = serverTimestamp();
  
  // Clean up UI temp properties if they exist
  delete payload.id;
  
  await setDoc(docRef, payload, { merge: true });
  return docRef.id;
};

export const deleteClient = async (clientId) => {
  await deleteDoc(doc(db, collections.CLIENTS, String(clientId)));
};

// --- Visits ---
export const subscribeToVisits = (callback) => {
  const q = query(collection(db, collections.VISITS));
  return onSnapshot(q, (snapshot) => {
    const visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Client-side grouping logic matches the required grouped data format
    const grouped = {};
    visits.forEach(v => {
      const dateKey = v.dateKey; // YYYY-MM-DD
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(v);
    });
    
    // Sort visits by time internally
    for(let date in grouped) {
      grouped[date].sort((a,b) => a.time.localeCompare(b.time));
    }
    
    callback(grouped);
  }, (error) => {
    console.error("Error subscribing to visits:", error);
    callback({});
  });
};

export const saveVisit = async (visitData) => {
  const isNew = String(visitData.id).startsWith('_temp_') || !visitData.id;
  const docRef = isNew ? doc(collection(db, collections.VISITS)) : doc(db, collections.VISITS, String(visitData.id));
  
  const payload = {
    ...visitData,
    updatedAt: serverTimestamp()
  };
  
  if (isNew) payload.createdAt = serverTimestamp();
  
  delete payload.id;
  
  await setDoc(docRef, payload, { merge: true });
  return docRef.id;
};

export const deleteVisit = async (visitId) => {
  await deleteDoc(doc(db, collections.VISITS, String(visitId)));
};

// --- Laudos ---
export const subscribeToLaudos = (callback) => {
  const q = query(collection(db, collections.LAUDOS));
  return onSnapshot(q, (snapshot) => {
    const laudos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(laudos);
  }, (error) => {
    console.error("Error subscribing to laudos:", error);
    callback([]);
  });
};

export const getLaudo = async (laudoId) => {
  const snap = await getDoc(doc(db, collections.LAUDOS, String(laudoId)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// Creates a new laudo when no id is passed; otherwise merges an update into the existing doc.
// Returns the Firestore id so the caller can persist it on the next save.
export const saveLaudo = async (laudoData) => {
  const hasId = laudoData.id && !String(laudoData.id).startsWith('_temp_');
  const docRef = hasId
    ? doc(db, collections.LAUDOS, String(laudoData.id))
    : doc(collection(db, collections.LAUDOS));

  const payload = {
    ...laudoData,
    updatedAt: serverTimestamp()
  };
  if (!hasId) payload.createdAt = serverTimestamp();
  delete payload.id;

  await setDoc(docRef, payload, { merge: true });
  return docRef.id;
};

export const deleteLaudo = async (laudoId) => {
  await deleteDoc(doc(db, collections.LAUDOS, String(laudoId)));
};
