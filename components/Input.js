import React, { useState, useEffect } from 'react'
import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineVideoCameraAdd, AiOutlineClose } from "react-icons/ai"
import { RiBarChart2Line } from "react-icons/ri"
import { IoCalendarNumberOutline } from "react-icons/io5"
import { HiOutlineLocationMarker } from "react-icons/hi"
import { useSession } from 'next-auth/react'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'


const Input = () => {

    const { data: session } = useSession()
    const [selectedFile, setSelectedFile] = useState(null)
    const [showEmojis, setShowEmojis] = useState(false)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    const [selectedVideo, setSelectedVideo] = useState(null);
    const [userData, setUserData] = useState(null);

     // Fetch user data when the session is available
  useEffect(() => {
    if (session?.user) {
      // Assuming you have a "users" collection
      const userDocRef = doc(db, 'users', session.user.uid);

      // Fetch the user's data from Firestore
      const fetchData = async () => {
        try {
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userDocData = userDocSnapshot.data();
            setUserData(userDocData); // Set user data in state
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchData();
    }
  }, [session]);




    const addVideoToPost = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
          reader.readAsDataURL(e.target.files[0]);
        }
    
        reader.onload = (readerEvent) => {
          setSelectedVideo(readerEvent.target.result);
        };
      };


    const addImageToPost = (e) => {

        const reader = new FileReader()
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0])
        }

        reader.onload = (readerEvent) => {
            setSelectedFile(readerEvent.target.result)
        }

    }

    const addEmoji = (e) => {
        let sym = e.unified.split("-")
        let codesArray = []
        sym.forEach((el) => codesArray.push("0x" + el))
        let emoji = String.fromCodePoint(...codesArray)
        setInput(input + emoji)
    }

    const sendPost = async () => {
        if (loading) return;
    
        setLoading(true);
    
        if (!userData) {
          console.error('User data is not available.');
          setLoading(false);
          return;
        }
    
        const docRef = await addDoc(collection(db, 'posts'), {
          id: userData.id,
          username: userData.name,
          userImg: userData.profileImage,
          tag: userData.tag,
          text: input,
          timestamp: serverTimestamp(),
          postedById: userData.id,
          isVerified: userData.isVerified || false,
          isQualifiedForBadge: userData.isQualifiedForBadge || false,
        });

        const imageRef = ref(storage, `posts/${docRef.id}/image`)

        if (selectedFile) {
            await uploadString(imageRef, selectedFile, "data_url")
                .then(async () => {
                    const downloadURL = await getDownloadURL(imageRef);
                    await updateDoc(doc(db, "posts", docRef.id), {
                        image: downloadURL,
                    })
                })
        }

        const videoRef = ref(storage, `posts/${docRef.id}/video`);

    if (selectedVideo) {
      await uploadString(videoRef, selectedVideo, 'data_url')
        .then(async () => {
          const downloadURL = await getDownloadURL(videoRef);
          await updateDoc(doc(db, 'posts', docRef.id), {
            video: downloadURL,
          });
        })
        .catch((error) => {
          console.error('Error uploading video:', error);
        });
    }

        setLoading(false)
        setInput("")
        setSelectedFile(null)
        setSelectedVideo(null); // Clear the selected video
        setShowEmojis(false)

    }

    return (
        <div className={`mt-4 px-4 ${loading && "opacity-60"}`}>

            <div className='grid grid-cols-[48px,1fr] gap-4'>

                <div>
                    <img className='h-12 w-12 rounded-full object-contain' src={session?.user?.image} alt="" />
                </div>

                <div className='w-[90%]'>
                    <textarea
                        className='w-[100%] bg-transparent outline-none text-[20px]'
                        rows="2"
                        placeholder="What's Happening?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)} />

                    {selectedFile && (

                        <div className="relative mb-4">
                            <div className='absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer' onClick={() => setSelectedFile(null)}>
                                <AiOutlineClose className='text-white h-5' />
                            </div>

                            <img
                                src={selectedFile}
                                alt=""
                                className='rounded-2xl max-h-80 object-contain' />

                        </div>

                    )}

                              {selectedVideo && (
                                        <div className="relative mb-4">
                                            <div
                                            className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
                                            onClick={() => setSelectedVideo(null)}
                                            >
                                            <AiOutlineClose className="text-white h-5" />
                                            </div>
                                            {/* Display the selected video */}
                                            <video
                                            controls
                                            src={selectedVideo}
                                            className="rounded-2xl max-h-80"
                                            ></video>
                                        </div>
                                        )}

                    {!loading && (
                        <div className='flex justify-between items-center'>

                            <div className='flex gap-4 text-[20px] text-yellow-500'>

                                <label htmlFor="file">
                                    <BsImage className='cursor-pointer' />
                                </label>

                                <input id="file" type="file"
                                    hidden
                                    onChange={addImageToPost}
                                />

                                <label htmlFor="video">
                                        <AiOutlineVideoCameraAdd className="cursor-pointer" />
                                        </label>
                                        <input
                                        id="video"
                                        type="file"
                                        accept="video/*" // Allow video files only
                                        hidden
                                        onChange={addVideoToPost}
                                        />
                                        {/* ...existing code */}
                                        
                                <BsEmojiSmile className='cursor-pointer' onClick={() => setShowEmojis(!showEmojis)} />
                               {/* <IoCalendarNumberOutline />
                                   <RiBarChart2Line className='rotate-90' />
                                   <HiOutlineLocationMarker /> */}
                            </div>

                            <button
                                className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                                disabled={!input.trim() && !selectedFile}
                                onClick={sendPost} >
                                Write
                            </button>

                        </div>
                    )}

                    {showEmojis && (
                        <div className='absolute mt-[10px] -ml-[40px] max-w-[320px] rounded-[20px]'>
                            <Picker
                                onEmojiSelect={addEmoji}
                                data={data}

                                theme="dark"
                            />
                        </div>
                    )}

                </div>

            </div>

        </div>
    )
}

export default Input











{/* 

import React, { useState } from 'react'
import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineVideoCameraAdd, AiOutlineClose } from "react-icons/ai"
import { RiBarChart2Line } from "react-icons/ri"
import { IoCalendarNumberOutline } from "react-icons/io5"
import { HiOutlineLocationMarker } from "react-icons/hi"
import { useSession } from 'next-auth/react'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'


const Input = () => {

    const { data: session } = useSession()
    const [selectedFile, setSelectedFile] = useState(null)
    const [showEmojis, setShowEmojis] = useState(false)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    const [selectedVideo, setSelectedVideo] = useState(null);

    const addVideoToPost = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
          reader.readAsDataURL(e.target.files[0]);
        }
    
        reader.onload = (readerEvent) => {
          setSelectedVideo(readerEvent.target.result);
        };
      };


    const addImageToPost = (e) => {

        const reader = new FileReader()
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0])
        }

        reader.onload = (readerEvent) => {
            setSelectedFile(readerEvent.target.result)
        }

    }

    const addEmoji = (e) => {
        let sym = e.unified.split("-")
        let codesArray = []
        sym.forEach((el) => codesArray.push("0x" + el))
        let emoji = String.fromCodePoint(...codesArray)
        setInput(input + emoji)
    }

    const sendPost = async () => {
        if (loading)
            return

        setLoading(true)

        const docRef = await addDoc(collection(db, 'posts'), {
            id: session.user.uid,
            username: session.user.name,
            userImg: session.user.image,
            tag: session.user.tag,
            text: input,
            timestamp: serverTimestamp(),
            postedById: session.user.uid,
        })

        const imageRef = ref(storage, `posts/${docRef.id}/image`)

        if (selectedFile) {
            await uploadString(imageRef, selectedFile, "data_url")
                .then(async () => {
                    const downloadURL = await getDownloadURL(imageRef);
                    await updateDoc(doc(db, "posts", docRef.id), {
                        image: downloadURL,
                    })
                })
        }

        const videoRef = ref(storage, `posts/${docRef.id}/video`);

    if (selectedVideo) {
      await uploadString(videoRef, selectedVideo, 'data_url')
        .then(async () => {
          const downloadURL = await getDownloadURL(videoRef);
          await updateDoc(doc(db, 'posts', docRef.id), {
            video: downloadURL,
          });
        })
        .catch((error) => {
          console.error('Error uploading video:', error);
        });
    }

        setLoading(false)
        setInput("")
        setSelectedFile(null)
        setSelectedVideo(null); // Clear the selected video
        setShowEmojis(false)

    }

    return (
        <div className={`mt-4 px-4 ${loading && "opacity-60"}`}>

            <div className='grid grid-cols-[48px,1fr] gap-4'>

                <div>
                    <img className='h-12 w-12 rounded-full object-contain' src={session?.user?.image} alt="" />
                </div>

                <div className='w-[90%]'>
                    <textarea
                        className='w-[100%] bg-transparent outline-none text-[20px]'
                        rows="2"
                        placeholder="What's Happening?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)} />

                    {selectedFile && (

                        <div className="relative mb-4">
                            <div className='absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer' onClick={() => setSelectedFile(null)}>
                                <AiOutlineClose className='text-white h-5' />
                            </div>

                            <img
                                src={selectedFile}
                                alt=""
                                className='rounded-2xl max-h-80 object-contain' />

                        </div>

                    )}

                              {selectedVideo && (
                                        <div className="relative mb-4">
                                            <div
                                            className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
                                            onClick={() => setSelectedVideo(null)}
                                            >
                                            <AiOutlineClose className="text-white h-5" />
                                            </div>
                                            {/* Display the selected video 
                                            <video
                                            controls
                                            src={selectedVideo}
                                            className="rounded-2xl max-h-80"
                                            ></video>
                                        </div>
                                        )}

                    {!loading && (
                        <div className='flex justify-between items-center'>

                            <div className='flex gap-4 text-[20px] text-yellow-500'>

                                <label htmlFor="file">
                                    <BsImage className='cursor-pointer' />
                                </label>

                                <input id="file" type="file"
                                    hidden
                                    onChange={addImageToPost}
                                />

                                <label htmlFor="video">
                                        <AiOutlineVideoCameraAdd className="cursor-pointer" />
                                        </label>
                                        <input
                                        id="video"
                                        type="file"
                                        accept="video/*" // Allow video files only
                                        hidden
                                        onChange={addVideoToPost}
                                        />
                                        {/* ...existing code
                                        
                                <BsEmojiSmile className='cursor-pointer' onClick={() => setShowEmojis(!showEmojis)} />
                               {/* <IoCalendarNumberOutline />
                                   <RiBarChart2Line className='rotate-90' />
                                   <HiOutlineLocationMarker /> 
                            </div>

                            <button
                                className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                                disabled={!input.trim() && !selectedFile}
                                onClick={sendPost} >
                                Write
                            </button>

                        </div>
                    )}

                    {showEmojis && (
                        <div className='absolute mt-[10px] -ml-[40px] max-w-[320px] rounded-[20px]'>
                            <Picker
                                onEmojiSelect={addEmoji}
                                data={data}

                                theme="dark"
                            />
                        </div>
                    )}

                </div>

            </div>

        </div>
    )
}

export default Input

*/}