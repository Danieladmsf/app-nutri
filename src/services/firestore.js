import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export const collections = {
  CLIENTS: 'clients',
  VISITS: 'visits'
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
