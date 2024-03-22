import React, { useContext, useState } from 'react'
import { MdClose } from "react-icons/md"
import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineGif, AiOutlineClose } from "react-icons/ai"
import { RiBarChart2Line } from "react-icons/ri"
import { IoCalendarNumberOutline } from "react-icons/io5"
import { HiOutlineLocationMarker } from "react-icons/hi"
import { useSession } from 'next-auth/react'
import { AppContext } from '../contexts/AppContext'
import Moment from 'react-moment'
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useRouter } from 'next/router'

const Modal = () => {

    const [input, setInput] = useState("")
    const [appContext, setAppContext] = useContext(AppContext)
    const { data: session } = useSession()
    const router = useRouter()

    const closeModal = () => {
        setAppContext({ ...appContext, isModalOpen: false })
    }

    const post = appContext.post

    const sendComment = async (e) => {

        e.preventDefault();

        await addDoc(collection(db, "posts", appContext.postId, "comments"), {
          comment: input,
          username: session.user.name,
          tag: session.user.tag,
          userImg: session.user.image,
          timestamp: serverTimestamp(),
        });

        // Check if the post owner's user ID is defined
    if (post && post.postedById) {
        // Create a notification for the post owner
        await addDoc(collection(db, 'notifications'), {
            recipientUserId: post.postedById, // Post owner's user ID
            senderUserId: session.user.uid,
            senderName: session.user.name,
            senderImage: session.user.image,
            message:  'commented on your post.',
            comment: input,
            type: 'comment',
            postId: appContext.postId,
            timestamp: serverTimestamp(),
            read: false,
        });
    }
        setAppContext({...appContext, isModalOpen: false})
        setInput("");

        router.push(`/posts/${appContext.postId}`);
    }

     

    return (
        <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] overflow-y-auto shadow-md `} onClick={closeModal}>

        <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]     overflow-y-auto no-scrollbar h-[380px] md:h-[450px]'
                onClick={(e) => e.stopPropagation()}>
                    <div className='text-center font-bold '>Comment</div>
 
               <div className='flex justify-end'>
                    <MdClose 
                        className='text-[22px] cursor-pointer ' 
                        onClick={closeModal}
                    />
                </div>

                <div className='relative mt-8 grid grid-cols-[48px,1fr] gap-4'>

                    <div>
                        <img className='rounded-full' src={post?.userImg} alt="" />
                    </div>

                    <div>
                        <div className='flex gap-2 text-[12px] md:text-[16px]'>
                            <h1 classsName="text-bold">{post?.username}</h1>
                            <h2 className='text-gray-500'><Moment fromNow>{post?.timestamp?.toDate()}</Moment></h2>
                        </div>
                        <p className='text-[12px] md:text-[16px]'>{post?.text}</p>

                        {post?.image && (
                            <img
                            className='mt-2 max-h-[250px] rounded-[15px] object-cover'
                            src={post?.image}
                            alt="" />
                        )}
                        {post?.video && (
                            <video
                            controls
                            className="mt-2 max-h-[250px] rounded-[15px] object-cover"
                        >
                            <source src={post?.video}  />
                            Your browser does not support the video tag.
                        </video>
                       )}

                       {/* <img src={post?.image} className='mt-2 max-h-[250px] rounded-[15px] object-cover' alt="" /> */}

                        <p className='mt-4 text-gray-500'>Replying to: <span className='text-yellow-500'>@{post?.tag}</span></p>

                    </div>

                    <div className='mt-4'>
                        <img className='rounded-full' src={session?.user?.image} alt="" />
                    </div>

                    <div className='mt-4'>
                        <textarea
                            className='w-[100%] bg-transparent outline-none text-[18px]'
                            rows="4"
                            placeholder="Write your reply"
                            value={input}
                            onChange={(e) => setInput(e.target.value)} />

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
                                className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                                disabled={!input.trim()}
                                onClick={sendComment}>
                                Comment
                            </button>
                        </div>



                    </div>

                </div>

            </div>

        </div>
    )
}

export default Modal