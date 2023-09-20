import React, { useEffect, useState } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';
import Input from './Input';
import Post from './Post';
import { onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import Image from 'next/image';
import mtuLogo from '../assets/images/mtulogo.jpg';
import { useSession } from 'next-auth/react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const { data: session } = useSession();
  const [isCurrentUserVerified, setIsCurrentUserVerified] = useState(false);

  useEffect(() => {
    onSnapshot(
      query(collection(db, 'posts'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        setPosts(snapshot.docs);
      }
    );

    // Fetch the user's document and check isVerified
    if (session && session.user) {
      const userRef = collection(db, 'users');
      const userQuery = query(userRef, where('id', '==', session.user.uid));
      onSnapshot(userQuery, (snapshot) => {
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setIsCurrentUserVerified(userData.isVerified);
        }
      });
    }
  }, [db, session]);

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
  <div className='sticky top-0 bg-white text-[#16181C] flex justify-between font-bold text-[20px] px-4 py-2 mt-[0px]'>
    Home
    <div className='rounded-[1px] md:hidden lg:hidden'>
      <Image className='rounded-[1px] md:hidden lg:hidden' src={mtuLogo} height='33px' width='29px' />
    </div>
    <HiOutlineSparkles />
  </div>

  {isCurrentUserVerified && <Input />}
  
  {isCurrentUserVerified ? (
    posts.map((post) => (
      <Post key={post.id} id={post.id} post={post.data()} />
    ))
  ) : (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <p className="bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center mb-4">
        Please verify your account to view posts from people and also post as well.
      </p>
      <button className='bg-yellow-500 p-2 rounded-[15px] text-white'>Verify</button>
    </div>
  )}


    {/*
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] min-h-screen border-r border-gray-400 text-[#16181C] py-2'>
      <div className='sticky top-0 bg-white text-[#16181C] flex justify-between font-bold text-[20px] px-4 py-2'>
        Home
        <div className='rounded-[1px] md:hidden lg:hidden'>
          <Image className='rounded-[1px] md:hidden lg:hidden' src={mtuLogo} height='33px' width='29px' />
        </div>
        <HiOutlineSparkles />
      </div>
       
      {isCurrentUserVerified &&
      <Input />
      } 

      {isCurrentUserVerified ? (
        posts.map((post) => (
          <Post key={post.id} id={post.id} post={post.data()} />
        ))
      ) : (
        <div className='flex flex-col items-center justify-center min-h-screen'>
        <p className="bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center mb-4">
          Please verify your account to view posts from people and also post as well.
        </p>
        <button className='bg-yellow-500 p-2 rounded-[15px] text-white'>Verify</button>
      </div>
      
      )}
    </section>
     */}
     </section>
  );
};

export default Feed;










{/*

import React, { useEffect, useState } from 'react'
import { HiOutlineSparkles } from "react-icons/hi"
import Input from './Input'
import Post from './Post'
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import Image from 'next/image'
import mtuLogo from "../assets/images/mtulogo.jpg";

const Feed = () => {

  const [posts, setPosts] = useState([])

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "posts"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setPosts(snapshot.docs);
        }
      ),
    [db]
  )
  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] min-h-screen border-r border-gray-400 text-[#16181C] py-2'>
      <div className='sticky top-0 bg-white text-[#16181C] flex justify-between font-bold text-[20px] px-4 py-2'>
        Home
        <div className='rounded-[1px] md:hidden lg:hidden'>
        <Image className='rounded-[1px] md:hidden lg:hidden' src={mtuLogo} height="33px" width="29px" />
        </div>
        <HiOutlineSparkles />
      </div>

      <Input />
      {posts.map((post) => (
        <Post key={post.id} id={post.id} post={post.data()} />
      ))}

    </section>
  )
}

export default Feed

 */}