import React, { useEffect, useState } from 'react'
import { HiOutlineSparkles } from "react-icons/hi"
import PollsInput from './PollsInput'
import Polls from './Polls'
import { onSnapshot, collection, query, orderBy, getDoc, doc} from "firebase/firestore";
import { db } from "../firebase";
import { useSession } from 'next-auth/react';

const Feed = () => {

  const [polls, setPolls] = useState([]);
  const { data: session } = useSession();

  const [isVerified, setIsVerified] = useState(false); // Add state for user verification
  useEffect(() => {
    const fetchUserVerification = async () => {
      if (session) {
        // Check if the user is verified (you might need to adjust the condition)
        const userDoc = doc(db, 'users', session.user.uid);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        
        if (userData && userData.isVerified) {
          setIsVerified(true);
          // Fetch conversations if the user is verified
          
        }
      }
    };

    fetchUserVerification();
  }, [session]);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "polls"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setPolls(snapshot.docs);
        }
      ),
    [db]
  )
  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      <div className='sticky top-0 z-10 bg-white flex justify-between font-medium text-[20px] px-4 py-2'>
      <h1 className="text-xl font-semibold text-gray-800">All Polls</h1>
        <HiOutlineSparkles />
      </div>

      {isVerified ? ( <>
      <PollsInput />
      
     
      <Polls  />
      </>) : (
          <div className='flex flex-col items-center justify-center min-h-screen'>
            <p className='bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center mb-4'>
              Please verify your account to view polls from people and also create polls as well.
            </p>
            <button className='bg-yellow-500 p-2 rounded-[15px] text-white' onClick={() => router.push('/verify')}>Verify</button>
          </div>
        )}
 


    </section>
  )
}

export default Feed