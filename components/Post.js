import React, { useContext, useEffect, useState } from 'react'
import { BsChat } from "react-icons/bs"
import { FaRetweet } from "react-icons/fa"
import { AiOutlineHeart, AiOutlineShareAlt, AiFillHeart } from 'react-icons/ai'
import { RiDeleteBin5Line } from 'react-icons/ri'
import Moment from 'react-moment'
// imports for the repost modal
import { MdClose } from "react-icons/md"
import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineGif, AiOutlineClose } from "react-icons/ai"
import { RiBarChart2Line } from "react-icons/ri"
import { IoCalendarNumberOutline } from "react-icons/io5"
import { HiOutlineLocationMarker, HiOutlineChat, HiOutlineHeart } from "react-icons/hi"

import { db } from "../firebase"
import { useRouter } from 'next/router'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, addDoc, serverTimestamp, updateDoc, getDoc, getDocs, where } from 'firebase/firestore'
import { useSession } from "next-auth/react"
import { AppContext } from '../contexts/AppContext'
import SkeletonLoader from './SkeletonLoader'
import {MdVerified} from 'react-icons/md';
import {toast} from 'react-toastify';


const Post = ({ id, post }) => {

  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [rePosted, setRePosted] = useState([])
  const [loading, setLoading] = useState(true); // State to track loading status

  const { data: session } = useSession()
  const router = useRouter()

  const [appContext, setAppContext] = useContext(AppContext)


// repost modal
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const openRepostModal = () => {
    setIsRepostModalOpen(true);
  };

  const closeRepostModal = () => {
    setIsRepostModalOpen(false);
  };


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
      onSnapshot(
        query(
          collection(db, "posts", id, "rePost"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => setRePosted(snapshot.docs)
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
      if (post?.postedById !== session.user.uid) {
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




  //reposting
  const [input, setInput] = useState('');
  const handleRepost = async () => {
    if (!input.trim()) {
      // Prevent reposting if the input is empty
      return;
    }

    try {
      // Create a new document in the 'rePost' subcollection of the post
      const rePostCollectionRef = collection(db, 'posts', id, 'rePost');
      const rePostDocRef = await addDoc(rePostCollectionRef, {
        userId: session.user.uid,
        username: session.user.name,
        userImg: session.user.image,
        text: input,
        timestamp: serverTimestamp(),
      });

     // Create a notification for the original post owner
  const originalPostRef = doc(db, 'posts', id);

  // Use getDoc to fetch the document
  const originalPostSnapshot = await getDoc(originalPostRef);

  // Check if the document exists
  if (originalPostSnapshot.exists()) {
    const originalPostData = originalPostSnapshot.data();

    if (originalPostData.postedById !== session.user.uid) {
      await addDoc(collection(db, 'notifications'), {
        recipientUserId: originalPostData.postedById,
        senderUserId: session.user.uid,
        senderName: session.user.name,
        senderImage: session.user.image,
        message: 'reposted your post.',
        repostMessage: input,
        type: 'repost',
        postId: id,
        rePostId: rePostDocRef.id, // Store the ID of the repost
        timestamp: serverTimestamp(),
        read: false,
      });
    }}

      // Redirect to the reposted post
      toast.success("Your repost was sent!");
      router.push(`/${id}`);
      onClose();
      
    } catch (error) {
      toast.error('Error reposting');
    }
  };


  // Function to format the post text, highlighting text after @ in blue and styling hashtags
const [showMore, setShowMore] = useState(true);
const formatPostText = (text) => {
  const maxWords = 15; // Maximum number of words to show initially
  const words = text && text.split(' ');

  // Check if the text exceeds the maximum number of words
  if (words?.length > maxWords) {
    const visibleWords = words.slice(0, maxWords).join(' ');
    const hiddenWords = words.slice(maxWords).join(' ');

    return (
      <p>
        {visibleWords.split(/(@\w+|#\w+)/).map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <span
                key={index}
                className="text-blue-500 font-semibold cursor-pointer"
                onClick={() => router.push(`/${id}`)}
              >
                {part}
              </span>
            );
          } else if (part.startsWith('#')) {
            return (
              <span
                key={index}
                className="text-blue-500 font-semibold cursor-pointer"
              >
                {part}
              </span>
            );
          } else {
            return <span key={index}>{part}</span>;
          }
        })}
        {showMore ? (
          <span
            className="text-gray-500 cursor-pointer ml-1"
            onClick={() => setShowMore(false)}
          >
            ...Read more
          </span>
        ) : (
          <>
            {hiddenWords.split(/(@\w+|#\w+)/).map((part, index) => {
              if (part.startsWith('@')) {
                return (
                  <span
                    key={index}
                    className="text-blue-500 font-semibold cursor-pointer"
                    onClick={() => router.push(`/${id}`)}
                  >
                    {part}
                  </span>
                );
              } else if (part.startsWith('#')) {
                return (
                  <span
                    key={index}
                    className="text-blue-500 font-semibold cursor-pointer"
                  >
                    {part}
                  </span>
                );
              } else {
                return <span key={index}>{part}</span>;
              }
            })}
            <span
              className="text-gray-500 cursor-pointer ml-1"
              onClick={() => setShowMore(true)}
            >
              Read less
            </span>
          </>
        )}
      </p>
    );
  }

  // If the text doesn't exceed the maximum number of words, display it as is
  return (
    <p>
      {text.split(/(@\w+|#\w+)/).map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={index}
              className="text-blue-500 font-semibold cursor-pointer"
              onClick={() => router.push(`/${id}`)}
            >
              {part}
            </span>
          );
        } else if (part.startsWith('#')) {
          return (
            <span
              key={index}
              className="text-blue-500 font-semibold cursor-pointer"
            >
              {part}
            </span>
          );
        } else {
          return <span key={index}>{part}</span>;
        }
      })}
    </p>
  );
};


  return (
    <div className='mt-4 mb-5 border-t border-gray-300 px-4 pt-6 pb-4 cursor-pointer  overflow-y-auto'>
      {loading ? (
      <SkeletonLoader /> // Display the SkeletonLoader while loading
    ) : (
      <div className='grid grid-cols-[48px,1fr] gap-4'>

        <div onClick={() => router.push(`/users/${post.postedById}`)}>
          <img className='h-12 w-12 rounded-full object-cover' src={post?.userImg} alt="" />
        </div>

        <div>
          <div className='block sm:flex gap-1' onClick={() => router.push(`/users/${post.postedById}`)}>
          <div className='flex items-center'>
            <h1 className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{post?.username}</h1>
            {post?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-1 ml-1" />) } {post?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-1 ml-1" />) }
            </div>
            <div className='flex'>
              <p className='text-gray-500'>@{post?.tag} &nbsp;·&nbsp;</p>
              <p className='text-gray-500'>
                <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
              </p>
            </div>


          </div>
          <p onClick={() => router.push(`/${id}`)}> {formatPostText(post?.text)}</p>
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
              <HiOutlineChat className='hoverEffect w-7 h-7 p-1' onClick={(e) => {
                e.stopPropagation()
                openModal()
              }} />
              {comments.length > 0 && (<span className='text-sm'>{comments.length}</span>)}
            </div>

            {session.user.uid !== post?.id ? (
              <div className='flex gap-1 items-center'>
              <FaRetweet className='hoverEffect w-7 h-7 p-1' onClick={(e) => {
                e.stopPropagation();
                openRepostModal();
              }}/>
              {rePosted.length > 0 && (<span className='text-sm'>{rePosted.length}</span>)}
              </div>
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
                : <HiOutlineHeart className='hoverEffect w-7 h-7 p-1' />}

              {likes.length > 0 && (<span className={`${liked && "text-yellow-500"} text-sm`}>{likes.length}</span>)}
            </div>

            <AiOutlineShareAlt className='hoverEffect w-7 h-7 p-1' />
          </div>
          {isRepostModalOpen && (
           <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] overflow-y-auto shadow-md `}>
           <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]     overflow-y-auto no-scrollbar h-[380px] md:h-[450px]'>
            
           <div className='flex justify-end'>
            <MdClose 
                className='text-[22px] cursor-pointer ' 
                onClick={closeRepostModal}
            />
          </div>
     
             <div className='relative mt-8 grid grid-cols-[48px,1fr] gap-4'>
               <div>
                 <img className='rounded-full' src={post?.userImg} alt='' />
               </div>
     
               <div>
                 <div className='flex gap-2 text-[12px] md:text-[16px]'>
                   <h1 className='text-bold'>{post?.username}</h1>
                   <h2 className='text-gray-500'>
                     <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
                   </h2>
                 </div>
                 <p className='text-[12px] md:text-[16px]'>{post?.text}</p>
     
                 {post?.image && (
                   <img
                     className='mt-2 max-h-[250px] rounded-[15px] object-cover'
                     src={post?.image}
                     alt=''
                   />
                 )}
                 {post?.video && (
                   <video
                     controls
                     className='mt-2 max-h-[250px] rounded-[15px] object-cover'
                   >
                     <source src={post?.video} />
                     Your browser does not support the video tag.
                   </video>
                 )}
     
                 <p className='mt-4 text-gray-500'>
                   Reposting: <span className='text-yellow-500'>@{post?.tag}</span> post
                 </p>
               </div>
     
               <div className='mt-4'>
                 <img className='rounded-full' src={session?.user?.image} alt='' />
               </div>
     
               <div className='mt-4'>
                 <textarea
                   className='w-[100%] bg-transparent outline-none text-[18px]'
                   rows='4'
                   placeholder='Write additional text on this post'
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
     
                 <div className='flex justify-between items-center'>
                   <div className='flex gap-4 text-[20px] text-yellow-500'>
                     <BsImage />
                     <div className='border-yellow-500 border rounded h-[18px] text-[16px] grid place-items-center'>
                       <AiOutlineGif />
                     </div>
                     <RiBarChart2Line className='rotate-90' />
                     <BsEmojiSmile />
                     <IoCalendarNumberOutline className='hidden md:block' />
                     <HiOutlineLocationMarker className='hidden md:block' />
                   </div>
     
                   <button
                     className='bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default'
                     onClick={handleRepost}
                   >
                     Repost
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
      )}
        </div>

      </div>
    )}
    </div>
  )
}

export default Post