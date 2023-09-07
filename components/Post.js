import React, { useContext, useEffect, useState } from 'react'
import { BsChat } from "react-icons/bs"
import { FaRetweet } from "react-icons/fa"
import { AiOutlineHeart, AiOutlineShareAlt, AiFillHeart } from 'react-icons/ai'
import { RiDeleteBin5Line } from 'react-icons/ri'
import Moment from 'react-moment'

import { db } from "../firebase"
import { useRouter } from 'next/router'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { useSession } from "next-auth/react"
import { AppContext } from '../contexts/AppContext'
import SkeletonLoader from './SkeletonLoader'


const Post = ({ id, post }) => {

  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true); // State to track loading status

  const { data: session } = useSession()
  const router = useRouter()

  const [appContext, setAppContext] = useContext(AppContext)

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "posts", id, "comments"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, id]
  )

  useEffect(
    () =>
      onSnapshot(collection(db, "posts", id, "likes"), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [db, id]
  )

  useEffect(() =>
    setLiked(
      likes.findIndex((like) => like.id === session?.user?.uid) !== -1
    ), [likes]
  )

  {/*
      const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, "posts", id, "likes", session.user.uid));
    } else {
      await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
        id: session.user.uid,
        username: session.user.name,
      });
    }
  }

  const openModal = () => {
    setAppContext({
      ...appContext, 
      isModalOpen: true,
      post,
      postId: id
    })

    console.log('opening model ', appContext.post);
  }
*/}

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, 'posts', id, 'likes', session.user.uid));
    } else {
      await setDoc(doc(db, 'posts', id, 'likes', session.user.uid), {
        id: session.user.uid,
        username: session.user.name,
      });

      // Create a notification for the post owner when someone likes their post
      if (post.postedById !== session.user.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientUserId: post.postedById,
          senderUserId: session.user.uid,
          senderName: session.user.name,
          senderImage: session.user.image,
          message:  'liked your post.',
          type: 'like',
          postId: id, // Add the post ID here
          timestamp: serverTimestamp(),
          read: false,
        });
      }
    }
  };
  

    // Mark notifications related to this post as read when the post is opened
    if (session?.user?.uid) {
      const notificationsCollection = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsCollection,
        orderBy('timestamp', 'desc')
      );

      onSnapshot(notificationsQuery, (snapshot) => {
        snapshot.docs.forEach(async (doc) => {
          if (
            doc.data().recipientUserId === session.user.uid &&
            doc.data().postId === id &&
            !doc.data().read
          ) {
            // Mark the notification as read
            await updateDoc(doc.ref, {
              read: true,
            });
          }
        });
      });
    
  };
  
  const openModal = () => {
    setAppContext({
      ...appContext, 
      isModalOpen: true,
      post,
      postId: id
    })

    console.log('opening model ', appContext.post);}

  // Use useEffect to simulate loading time
  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false); // Set loading to false after a simulated delay
    }, 1000); // Adjust the delay time as needed

    return () => clearTimeout(delay);
  }, []);

  return (
    <div className='mt-4 border-t border-gray-300 px-4 pt-6 pb-4 cursor-pointer'>
      {loading ? (
      <SkeletonLoader /> // Display the SkeletonLoader while loading
    ) : (
      <div className='grid grid-cols-[48px,1fr] gap-4'>

        <div onClick={() => router.push(`/users/${post.postedById}`)}>
          <img className='h-12 w-12 rounded-full object-cover' src={post?.userImg} alt="" />
        </div>

        <div>
          <div className='block sm:flex gap-1' onClick={() => router.push(`/users/${post.postedById}`)}>
            <h1 className='font-semibold'>{post?.username}</h1>

            <div className='flex'>
              <p className='text-gray-500'>@{post?.tag} &nbsp;·&nbsp;</p>
              <p className='text-gray-500'>
                <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
              </p>
            </div>


          </div>
          <p onClick={() => router.push(`/${id}`)}>{post?.text}</p>
          {post?.image && (
            <img
            className='max-h-[450px] object-cover rounded-[20px] mt-2'
            src={post?.image}
            alt="post"
            onClick={() => router.push(`/${id}`)}
             />
          )}
          {post?.video && (
            <video
            controls
            className="max-h-[450px] object-cover rounded-[20px] mt-2"
            onClick={() => router.push(`/${id}`)}
          >
            <source src={post?.video}  />
            Your browser does not support the video tag.
          </video>
          )}
        {/*  <img
            className='max-h-[450px] object-cover rounded-[20px] mt-2'
            src={post?.image}
            alt="" /> */}


          <div className='flex justify-between text-[20px] mt-4 w-[80%]'>

            <div className='flex gap-1 items-center'>
              <BsChat className='hoverEffect w-7 h-7 p-1' onClick={(e) => {
                e.stopPropagation()
                openModal()
              }} />
              {comments.length > 0 && (<span className='text-sm'>{comments.length}</span>)}
            </div>

            {session.user.uid !== post?.id ? (
              <FaRetweet className='hoverEffect w-7 h-7 p-1' />
            ) : (
              <RiDeleteBin5Line className='hoverEffect w-7 h-7 p-1'
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDoc(doc(db, "posts", id));
                }} />
            )}


            <div className='flex gap-1 items-center'
              onClick={(e) => {
                e.stopPropagation()
                likePost()
              }}>
              {liked ? <AiFillHeart className='hoverEffect w-7 h-7 p-1 text-yellow-500' />
                : <AiOutlineHeart className='hoverEffect w-7 h-7 p-1' />}

              {likes.length > 0 && (<span className={`${liked && "text-yellow-500"} text-sm`}>{likes.length}</span>)}
            </div>

            <AiOutlineShareAlt className='hoverEffect w-7 h-7 p-1' />
          </div>

        </div>

      </div>
    )}
    </div>
  )
}

export default Post