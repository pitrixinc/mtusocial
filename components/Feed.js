import React, { useEffect, useState } from 'react'
import { HiOutlineSparkles } from "react-icons/hi"
import Input from './Input'
import Post from './Post'
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { BsTwitter } from "react-icons/bs"

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
        <BsTwitter className='text-blue-500 text-[29px] md:hidden lg:hidden' />
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