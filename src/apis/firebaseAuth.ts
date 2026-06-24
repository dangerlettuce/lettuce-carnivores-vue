import { db, auth } from '@/apis/firebase';

import {
  getDoc,
  doc,
  setDoc,
  getDocs,
  collection,
  // onSnapshot,
} from 'firebase/firestore';
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export const fbCreateAccount = async (email: string, password: string) => {
  const response = await createUserWithEmailAndPassword(auth, email, password);
  if (response) {
    return response.user;
  } else {
    return null;
  }
};
//   await fbSetUserProfile(profileDetails);
//   const profileResponse = await fbGetUserProfile();
//   if(!profileResponse) {
//     return {
//       user: userResponse.user,
//       profile: null
//     }
//   }
//   return {
//     user: userResponse.user,
//     profile: profileResponse.profile
//   };
// };

export const fbSignIn = async (email: string, password: string) => {
  const response = await signInWithEmailAndPassword(auth, email, password);
  return response;
};
export async function fbSignInAnonymously() {
  const response = await signInAnonymously(auth);
  return response;
}
export async function fbSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const response = await signInWithPopup(auth, provider);
  return response;
}
export const fbSignOut = async () => {
  await signOut(auth);
  return true;
};

export const fbAuthStateListener = (callback: any) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      callback(null);
    }
  });
};

export const fbSetUserProfile = async (profileDetails: object) => {
  const user = auth.currentUser;
  const ref = doc(db, 'users', user?.uid as string);
  if (ref && user) {
    await setDoc(
      ref,
      {
        uid: user?.uid,
        ...profileDetails,
      },
      { merge: true },
    );
  }
  return true;
};

export const fbGetUserProfile = async () => {
  const user = auth.currentUser;
  const ref = doc(db, 'users', user?.uid as string);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    return {
      ...docSnap.data(),
      uid: user?.uid,
    };
  } else {
    // doc.data() will be undefined in this case
    console.log('No such document!', user?.uid);
    return null;
  }
};

export async function requestPasswordResetEmail(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: false, message: 'Password reset email sent!' };
  } catch (e) {
    return { success: true, error: false, message: 'Password reset email sent!' };
  }
}

export const queryObjectCollection = async ({ collectionName }: { collectionName: string }) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const results: any[] = [];

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    results.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  return results;
};
