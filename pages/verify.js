import React, { useState, useEffect } from 'react'
import Verify from '../components/Verify';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions here
import { db } from '../firebase';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {toast} from 'react-toastify';

const verify = () => {
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(false); // Add state for user verification
  const router = useRouter();


    useEffect(() => {
      const fetchUserVerification = async () => {
        if (session) {
          // Check if the user is verified (you might need to adjust the condition)
          const userDoc = doc(db, 'users', session.user.uid);
          const userSnapshot = await getDoc(userDoc);
          const userData = userSnapshot.data();
          
          if (userData && userData.isVerified) {
            setIsVerified(true);
            toast.warning("You are already verified")
            router.push('/');
            return null;
          }
        }
      };
  
      fetchUserVerification();
    }, [session]);

  return (
    <>
    {isVerified ? (
      <div className='flex justify-center items-center min-h-screen'>
      <p className='bg-clip-text text-transparent font-bold text-[20px] bg-gradient-to-r from-yellow-500 to-black text-center '> You are already verified </p>
      </div>
      ) : (
    <div className='relative max-w-[100%] mx-auto'>
        <Verify />
    </div>
    )}
    </>
  );
};

export default verify;
