import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

interface BoxData {
  items: string[];
  description: string;
  createdAt?: unknown;
}

const getUserBoxesCollection = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return collection(db, 'users', user.uid, 'boxes');
};

const getBoxDoc = (boxId: string) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return doc(db, 'users', user.uid, 'boxes', boxId);
};

export const FirebaseStorage = {
  // Get all boxes
  async getAllBoxes(): Promise<string[]> {
    const boxesRef = getUserBoxesCollection();
    const snapshot = await getDocs(boxesRef);
    return snapshot.docs.map(doc => doc.id);
  },

  // Get box items
  async getBoxItems(boxId: string): Promise<string[]> {
    const boxRef = getBoxDoc(boxId);
    const snapshot = await getDoc(boxRef);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.data() as BoxData;
    return data.items || [];
  },

  // Get box description
  async getBoxDescription(boxId: string): Promise<string> {
    const boxRef = getBoxDoc(boxId);
    const snapshot = await getDoc(boxRef);
    if (!snapshot.exists()) {
      return '';
    }
    const data = snapshot.data() as BoxData;
    return data.description || '';
  },

  // Set box description
  async setBoxDescription(boxId: string, description: string): Promise<void> {
    const boxRef = getBoxDoc(boxId);
    const snapshot = await getDoc(boxRef);

    if (!snapshot.exists()) {
      await setDoc(boxRef, {
        items: [],
        description,
        createdAt: serverTimestamp()
      });
    } else {
      await updateDoc(boxRef, { description });
    }
  },

  // Add item to box
  async addItemToBox(boxId: string, item: string): Promise<void> {
    const boxRef = getBoxDoc(boxId);
    const snapshot = await getDoc(boxRef);

    if (!snapshot.exists()) {
      await setDoc(boxRef, {
        items: [item],
        description: '',
        createdAt: serverTimestamp()
      });
    } else {
      const data = snapshot.data() as BoxData;
      const items = data.items || [];
      items.push(item);
      await updateDoc(boxRef, { items });
    }
  },

  // Remove item from box
  async removeItemFromBox(boxId: string, item: string): Promise<void> {
    const boxRef = getBoxDoc(boxId);
    const snapshot = await getDoc(boxRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as BoxData;
      const items = (data.items || []).filter(i => i !== item);
      await updateDoc(boxRef, { items });
    }
  },

  // Delete box
  async deleteBox(boxId: string): Promise<void> {
    const boxRef = getBoxDoc(boxId);
    await deleteDoc(boxRef);
  },

  // Check if box exists
  async boxExists(boxId: string): Promise<boolean> {
    const boxRef = getBoxDoc(boxId);
    const snapshot = await getDoc(boxRef);
    return snapshot.exists();
  }
};
