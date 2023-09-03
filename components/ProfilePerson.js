import React, { useContext, useEffect, useState } from 'react'
import { BsChat } from "react-icons/bs"
import { FaRetweet } from "react-icons/fa"
import { AiOutlineHeart, AiOutlineShareAlt, AiFillHeart } from 'react-icons/ai'
import { RiDeleteBin5Line } from 'react-icons/ri'
import Moment from 'react-moment'

import { db } from "../firebase"
import { useRouter } from 'next/router'
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'
import { useSession, getSession  } from "next-auth/react"
import { AppContext } from '../contexts/AppContext'
import Post from '../components/Post';

const ProfilePerson = ({ id, post }) => {
  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true); // State to track loading status
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const router = useRouter()

  const [appContext, setAppContext] = useContext(AppContext)

  // post display
  const [userPosts, setUserPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);

  // Fetch the user's posts and total post count
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        // Create a Firestore query to get posts by the current user
        const q = query(collection(db, 'posts'), where('id', '==', session.user.uid));
        const querySnapshot = await getDocs(q);

        const posts = [];
        querySnapshot.forEach((doc) => {
          // Assuming your post document structure, modify accordingly
          const post = {
            id: doc.id,
            username: doc.data().username,
            userImg: doc.data().userImg,
            tag: doc.data().tag,
            text: doc.data().text,
            image: doc.data().image,
            video: doc.data().video,
            timestamp: doc.data().timestamp, // Include the timestamp field
          };
          posts.push(post);
        });

        setUserPosts(posts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    if (session) {
      fetchUserPosts();
    }
  }, [session]);



  const [activeTab, setActiveTab] = useState('Tweets'); // Initialize with the default tab

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Define the content for each tab
  const tabContents = {
    Tweets: <div>{userPosts.slice().reverse().map((post) => (
      <Post key={post.id} id={post.id} post={post} />
    ))}</div> ,
    'Tweets & replies': <div>Content for Tweets & replies tab</div>,
    Media: <div>Content for Media tab</div>,
    Likes: <div>Content for Likes tab</div>,
  };
  
  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] py-2'>
       {/* <h1 className='font-semibold'>{session?.user?.name}</h1> */}
       <div class="mx-auto flex h-screen w-full items-start justify-center bg-white text-sm text-gray-900 antialiased">
  <div class="mx-auto w-full max-w-[600px]">
  {/*  <!-- Name and tweet count header --> */}
    <div class="flex items-center space-x-4 p-1.5">
      <button class="inline-flex items-center justify-center rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 hover:dark:bg-gray-800 hover:dark:text-white" onClick={() => router.push(`/`)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
        </svg>
      </button>
      <div class="flex flex-col items-start">
        <h2 class="text-xl font-bold tracking-tight">{session?.user?.name}</h2>
        <span class="text-xs text-gray-500 dark:text-gray-400">{userPosts.length} Writings </span>
      </div>
    </div>

   {/* <!-- Header image --> */}
    <div>
      <img src="https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg" />
    </div>

   {/* <!-- Profile picture and edit button --> */}
    <div class="flex items-start justify-between px-4 py-3">
      <img class="-mt-[4.5rem] h-32 w-32 cursor-pointer rounded-full" src={session?.user?.image} />
      <button class="rounded-full border border-gray-300 px-4 py-1.5 font-bold transition duration-150 ease-in-out hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-700">Edit profile</button>
    </div>

   {/* <!-- Name and handle --> */}
    <div class="mt-2 px-4">
      <h2 class="text-xl font-bold tracking-tight">{session?.user?.name}</h2>
      <span class="text-gray-500 dark:text-gray-400">@{session?.user?.tag}</span>
    </div>

   {/* <!-- Bio --> */}
    <div class="mt-4 px-4">
      <span>✨ Designing, building and talking about digital products.</span>
    </div>

  {/*}  <!-- Location, CTA and join date --> */}
    <div class="mt-3 flex items-center space-x-4 px-4">
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span class="text-gray-500 dark:text-gray-400">✍️ &nbsp;&nbsp;→</span>
      </div>
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <a class="text-sky-500 hover:underline" href="https://r.bluethl.net" target="_blank">r.bluethl.net</a>
      </div>
      <div class="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 dark:text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>

        <span class="text-gray-700 dark:text-gray-400"> Joined August 2020</span>
      </div>
    </div>

  {/*  <!-- Following/follower count --> */}
    <div class="mt-3 flex items-center space-x-4 px-4">
      <div class="cursor-pointer hover:underline">
        <span class="font-bold">168</span>
        <span class="text-gray-700 dark:text-gray-400">Following</span>
      </div>
      <div class="cursor-pointer hover:underline">
        <span class="font-bold">638</span>
        <span class="text-gray-700 dark:text-gray-400">Followers</span>
      </div>
    </div>

    {/* -- Tabs -- */ }
    <div>
      {/* Tabs */}
      <ul className="mt-3 flex justify-evenly">
        {Object.keys(tabContents).map((tabName) => (
          <li
            key={tabName}
            className={`relative flex w-full cursor-pointer items-center justify-center p-4 transition duration-150 ease-in-out ${
              activeTab === tabName
                ? 'bg-gray-200 dark:bg-yellow-500'
                : 'hover:bg-gray-200 dark:hover:bg-yellow-200'
            }`}
            onClick={() => handleTabClick(tabName)}
          >
            <span
              className={`font-bold ${
                activeTab === tabName ? '' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {tabName}
            </span>
            {activeTab === tabName && (
              <div className="absolute bottom-0 w-14 border-b-[3px] border-sky-500"></div>
            )}
          </li>
        ))}
      </ul>

      {/* Content */}
      <div className="mt-4">{tabContents[activeTab]}</div>
    </div>
  </div>
</div>


    </section>
  )
}

export default ProfilePerson