import { getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import Feed from '../components/Feed'
import Login from '../components/Login'
import Modal from '../components/Modal'
import Sidebar from '../components/Sidebar'
import Trending from "../components/Trending"
import { AppContext } from '../contexts/AppContext'
import VerifiedUsersList from '../components/VerifiedUsersList'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Verify from '../components/Verify'


export default function Home() {

  const { data: session } = useSession()
  const [appContext] = useContext(AppContext)

  if (!session) return <Login />

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

  if (!isVerified) return <Verify />

  return (
    <div>
      <Head>
        <title>Home - MTU Social</title>
        <meta name="description" content="Michigan Technological University Social Network Website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </Head>

      <main className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
          <Feed />
          <VerifiedUsersList />
          {appContext?.isModalOpen && <Modal />}
        </div>
      </main>
    </div>
  )
}


export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
