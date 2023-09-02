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