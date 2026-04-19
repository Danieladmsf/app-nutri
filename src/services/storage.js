import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a photo to Firebase Storage
 * @param {File} file - The file object to upload
 * @param {string} laudoId - The ID of the laudo (for folder organization)
 * @param {string} occurrenceId - The unique ID of the occurrence block
 * @returns {Promise<string>} - The public download URL
 */
export const uploadAuditPhoto = async (file, laudoId, occurrenceId) => {
  if (!file) return null;
  
  // Create a safe folder name. If laudoId is missing, use 'unsorted'
  const folder = laudoId || 'unsorted';
  const timestamp = Date.now();
  const fileName = `${occurrenceId}_${timestamp}`;
  const storageRef = ref(storage, `laudos/${folder}/${fileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading photo to Storage:", error);
  }
};

/**
 * Uploads a profile photo to Firebase Storage
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} - The public download URL
 */
export const uploadProfilePhoto = async (file) => {
  if (!file) return null;
  
  const timestamp = Date.now();
  const fileName = `profile_${timestamp}`;
  const storageRef = ref(storage, `profiles/${fileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw error;
  }
};
