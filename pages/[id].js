import React, { useContext } from 'react'
import { getSession, useSession } from 'next-auth/react'
import Login from '../components/Login'
import Sidebar from '../components/Sidebar'
import Head from 'next/head'
import Trending from '../components/Trending'
import SinglePost from '../components/SinglePost'
import Comment from "../components/Comment"
import { useRouter } from 'next/router'
import { AppContext } from '../contexts/AppContext'
import Modal from '../components/Modal'

const PostPage = () => {

  const { data: session } = useSession()
  const [appContext] = useContext(AppContext)

  if (!session) return <Login />

  return (
    <div>
      <Head>
        <title>MTU Social</title>
        <meta name="description" content="Michigan Technological University Social Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
          <SinglePost />
          <Trending />
          {appContext?.isModalOpen && <Modal />}
        </div>
      </main>

    </div>
  )
}

export default PostPage

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session
    },
  };
}
