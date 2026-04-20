import { db, auth } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

export const collections = {
  CLIENTS: 'clients',
  VISITS: 'visits',
  LAUDOS: 'laudos'
};

// --- Clients ---
export const subscribeToClients = (callback) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  const q = query(collection(db, collections.CLIENTS), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(clients);
  }, (error) => {
    console.error("Error subscribing to clients:", error);
    callback([]);
  });
};

export const saveClient = async (clientData, overrides = {}) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const isNew = String(clientData.id).startsWith('_temp_') || !clientData.id;
  const docRef = isNew ? doc(collection(db, collections.CLIENTS)) : doc(db, collections.CLIENTS, String(clientData.id));
  
  const payload = {
    ...clientData,
    ...overrides,
    userId,
    updatedAt: serverTimestamp()
  };
  
  if (isNew) payload.createdAt = serverTimestamp();
  
  delete payload.id;
  
  await setDoc(docRef, payload, { merge: true });
  return docRef.id;
};

export const deleteClient = async (clientId) => {
  await deleteDoc(doc(db, collections.CLIENTS, String(clientId)));
};

export const findClientByName = async (name) => {
  if (!name) return null;
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const q = query(collection(db, collections.CLIENTS), where('userId', '==', userId), where('name', '==', name));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

// --- Visits ---
export const subscribeToVisits = (callback) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback({});
    return () => {};
  }

  const q = query(collection(db, collections.VISITS), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const grouped = {};
    visits.forEach(v => {
      const dateKey = v.dateKey; 
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(v);
    });
    
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
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const isNew = String(visitData.id).startsWith('_temp_') || !visitData.id;
  const docRef = isNew ? doc(collection(db, collections.VISITS)) : doc(db, collections.VISITS, String(visitData.id));
  
  const payload = {
    ...visitData,
    userId,
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
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, collections.LAUDOS), where('userId', '==', userId));
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

export const saveLaudo = async (laudoData) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const hasId = laudoData.id && !String(laudoData.id).startsWith('_temp_');
  const docRef = hasId
    ? doc(db, collections.LAUDOS, String(laudoData.id))
    : doc(collection(db, collections.LAUDOS));

  const payload = {
    ...laudoData,
    userId,
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
