import { getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useContext } from 'react'
import Feed from '../components/Feed'
import Login from '../components/Login'
import Modal from '../components/Modal'
import Sidebar from '../components/Sidebar'
import Trending from "../components/Trending"
import { AppContext } from '../contexts/AppContext'
import VerifiedUsersList from '../components/VerifiedUsersList'

export default function Home() {

  const { data: session } = useSession()
  const [appContext] = useContext(AppContext)

  if (!session) return <Login />

  return (
    <div>
      <Head>
        <title>MTU Social</title>
        <meta name="description" content="Michigan Technological University Social Network" />
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
