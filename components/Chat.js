import React, { useState, useEffect } from 'react';
import {  collection,
  where,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
 } from 'firebase/firestore';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import { db, storage } from '../firebase';
import { AiOutlineArrowLeft, AiOutlineVideoCameraAdd, AiOutlineClose } from 'react-icons/ai';
import { VscSettings } from 'react-icons/vsc';
import { HiOutlineDocumentAdd } from 'react-icons/hi';
import { BsEmojiSmile, BsImage, BsFileEarmarkMusic } from 'react-icons/bs';
import { FaFileDownload } from 'react-icons/fa';
import Moment from 'react-moment'
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { FcDocument } from 'react-icons/fc';
import CryptoJS from 'crypto-js';


const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userInfo, setUserInfo] = useState({}); // Add state for user info
  const router = useRouter()
  const { id } = router.query;


  /////// chat with media file
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  
    // Encrypt the message using a secret key (you should securely manage this key)
    const secretKey = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY; // Replace with your actual secret key
    const encryptedMessage = CryptoJS.AES.encrypt(input, secretKey).toString();

  const addMusicToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedMusic(readerEvent.target.result);
    };
  };

  const addDocumentToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedDocument(readerEvent.target.result);
    };
  };

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
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  const addEmoji = (e) => {
    let sym = e.unified.split('-');
    let codesArray = [];
    sym.forEach((el) => codesArray.push('0x' + el));
    let emoji = String.fromCodePoint(...codesArray);
    setInput(input + emoji);
  };







  useEffect(() => {
    if (!session || !id) return;

    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50) // Adjust as needed
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMessages = [];
      querySnapshot.forEach((doc) => {
        const message = doc.data();
        // Check if the message is between the current user and the specified user
        if ((message.fromId === session.user.uid && message.toId === id) ||
            (message.fromId === id && message.toId === session.user.uid)) {
              // Decrypt the message here
              const decryptedMessage = CryptoJS.AES.decrypt(
                message.text,
                secretKey
              ).toString(CryptoJS.enc.Utf8);
      
              // Check if decryption was successful before adding to updatedMessages
              if (decryptedMessage !== '' && decryptedMessage.length > 0) {
                // Replace the original message with the decrypted message
                message.text = decryptedMessage;
                updatedMessages.push(message);
              }
            }
          });
          setMessages(updatedMessages);
        });

    // Fetch the user's info and set it in state
    const fetchUserInfo = async () => {
      const userDoc = doc(db, 'users', id); // Assuming you have a 'users' collection
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        setUserInfo(userSnap.data()); // Set the entire user document
      }
    };

    fetchUserInfo();

    return unsubscribe;
  }, [session, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input || !id) return;

    // Create a new message document in Firestore
    //await addDoc(collection(db, 'messages'), {
      // text: input,
      // fromId: session.user.uid,
      // toId: id,
      // timestamp: serverTimestamp(),
      // });

    // setNewMessage('');






    try {
      const messageData = {
        text: encryptedMessage,
        fromId: session.user.uid,
        toId: id,
        timestamp: serverTimestamp(),
        senderImage: session.user.image,
        name: session.user.name,
      };

      if (selectedFile) {
        const imageRef = ref(
          storage,
          `groups/${doc.id}/images/${Date.now()}_${selectedFile.name}`
        );
        await uploadString(imageRef, selectedFile, 'data_url');
        const imageUrl = await getDownloadURL(imageRef);
        messageData.image = imageUrl;
      }

      if (selectedVideo) {
        const videoRef = ref(
          storage,
          `groups/${doc.id}/videos/${Date.now()}_${selectedVideo.name}`
        );
        await uploadString(videoRef, selectedVideo, 'data_url');
        const videoUrl = await getDownloadURL(videoRef);
        messageData.video = videoUrl;
      }

      if (selectedMusic) {
        const musicRef = ref(
          storage,
          `groups/${doc.id}/music/${Date.now()}_${selectedMusic.name}`
        );
        await uploadString(musicRef, selectedMusic, 'data_url');
        const musicUrl = await getDownloadURL(musicRef);
        messageData.music = musicUrl;
      }

      if (selectedDocument) {
        const documentRef = ref(
          storage,
          `groups/${doc.id}/documents/${Date.now()}_${selectedDocument.name}`
        );
        await uploadString(documentRef, selectedDocument, 'data_url');
        const documentUrl = await getDownloadURL(documentRef);
        messageData.document = documentUrl;
      }

      await addDoc(collection(db, 'messages'), messageData);

      setLoading(false);
      setInput('');
      setSelectedFile(null);
      setSelectedMusic(null);
      setSelectedDocument(null);
      setSelectedVideo(null);
      setShowEmojis(false);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };





   // chat backround images change
   const [backgroundImages, setBackgroundImages] = useState([
    'url(https://e0.pxfuel.com/wallpapers/875/426/desktop-wallpaper-i-whatsapp-background-chat-whatsapp-graffiti-thumbnail.jpg)',
    'url(https://w0.peakpx.com/wallpaper/649/225/HD-wallpaper-dark-seamless-pattern-black-cafe-chat-drawing-icon-love-social-theme.jpg)',
    'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8YonVIbNG1LNG3xpfRj8BwME9C6L0AZcy_6kqlLcIKD3F1TopzU53eSGo89w9kHoXBoM&usqp=CAU)',
    'url(https://i.pinimg.com/236x/88/57/0e/88570e500312820cf8873d180d05f0c0.jpg)',
    'url(https://i.pinimg.com/736x/35/69/e3/3569e3e18d8a5cc341751eeef5de367c.jpg)',
    'url(https://e1.pxfuel.com/desktop-wallpaper/962/464/desktop-wallpaper-aesthetic-for-whatsapp-chat-backgrounds-chats-thumbnail.jpg)',
  ]);

  const [currentBackgroundImageIndex, setCurrentBackgroundImageIndex] = useState(0);

  useEffect(() => {
    const changeBackgroundImage = () => {
      // Increment the index and wrap around when reaching the end
      setCurrentBackgroundImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    };

    // Change the background image every minute
    const backgroundImageInterval = setInterval(changeBackgroundImage, 60000);

    return () => {
      // Clear the interval when the component unmounts
      clearInterval(backgroundImageInterval);
    };
  }, [backgroundImages]);

  const [isVerified, setIsVerified] = useState(false);
  useEffect(() => {
    if (session) {
      // Check if the user is verified (you might need to adjust the condition)
      const userDoc = doc(db, 'users', session.user.uid);
      getDoc(userDoc)
        .then((userSnapshot) => {
          const userData = userSnapshot.data();
          if (userData && userData.isVerified) {
            setIsVerified(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data', error);
        });
    }
  }, [session]);

  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] h-screen min-h-screen border-r border-gray-400 text-[#16181C] overflow-y-auto no-scrollbar bg-white'>
 {isVerified ? ( <>   
    <div className='flex items-center p-4 border-b border-b-gray-300 shadow-md'>
          <button onClick={() => router.push(`/ConversationList`)} className='mr-2 text-blue-500 hover:underline sticky'>
            <AiOutlineArrowLeft className='text-2xl text-black'/>
          </button>
          {userInfo.profileImage && (
            <img
              src={userInfo.profileImage}
              alt={`${userInfo.name}'s Profile`}
              className='w-8 h-8 rounded-full object-cover mr-2'
            />
          )}
          <h1 className='text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{userInfo.name}</h1>
        </div>
        
      

<div className='flex flex-col p-4 space-y-2 overflow-y-auto no-scrollbar h-[350px] md:h-[500px] lg:h-[550px]'
  style={{
    backgroundImage: backgroundImages[currentBackgroundImageIndex],
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  }}
>
  {messages.length === 0 ? (
    <div className='flex justify-center items-center min-h-screen'>
    <div className='text-center text-gray-500  bg-white p-2 rounded-full'>No messages, start a conversation with <span className='bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{userInfo.name}</span></div>
    </div>
  ) : (
    messages.map((message) => (
      <div
      key={message.id}
      className={
        message.fromId === session.user.uid
          ? 'self-end bg-yellow-500 text-white rounded-tl-lg rounded-bl-lg rounded-tr-lg p-2 max-w-[70%]'
          : 'self-start bg-gray-100 text-yellow-700 text-transparent rounded-tr-lg rounded-br-lg rounded-tl-lg p-2 max-w-[70%] border  border-yellow-500'
      }
    >
      <div className='flex items-center'>
        <img
          src={message.senderImage}
          alt='member'
          className='w-5 h-5 rounded-full'
        />
        <span className='text-gray-500 text-xs font-semibold ml-1'>
          {message.name}
        </span>
      </div>
      {message.text}
      {message?.image && (
        <img
          className='max-h-[450px] object-cover rounded-[20px] mt-2'
          src={message?.image}
          alt="post"
        />
      )}
      {message?.music && (
        <audio controls className="max-h-40 rounded-[20px] w-[60%] md:w-full lg:w-full mt-2">
        <source src={message.music} type="audio/mpeg" />
        <source src={message.music} type="audio/ogg" />
        <source src={message.music} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      )}
      {message?.document && (
        <div className="flex items-center">
          <FcDocument className="text-blue-500 mr-2" />
          <span className="text-blue-500 hover:underline">
            {message?.document?.slice(message?.document?.lastIndexOf('/') + 1).slice(0, 15)}
          </span>
          <a href={message?.document} target="_blank" rel="noopener noreferrer" download className="text-blue-500 hover:underline cursor-pointer">
            <FaFileDownload className="text-blue-500 ml-2" />
          </a>      
        </div>
      )}
      {message?.video && (
        <video
          controls
          className="max-h-[450px] object-cover rounded-[20px] mt-2"
        >
          <source src={message?.video} />
          Your browser does not support the video tag.
        </video>
      )}
      <div className='text-gray-500 text-xs'>
        <Moment fromNow>{message.timestamp?.toDate()}</Moment>
      </div>
    </div>
    ))
  )}
</div>






 {/* Input field and send button */}
 <div className={`mt-4 px-4  ${loading && "opacity-60"}`}>
      {showEmojis && (
                        <div className='absolute mt-[10px] -ml-[40px] max-w-[320px] rounded-[20px]'>
                            <Picker
                                onEmojiSelect={addEmoji}
                                data={data}

                                theme="dark"
                            />
                        </div>
                    )}

<div className='grid grid-cols-[48px,1fr] gap-4  mb-[71px] md:mb-0 lg:mb-0'>

    <div>
        <img className='h-12 w-12 rounded-full object-contain' src={session?.user?.image} alt="" />
    </div>

    <div className='w-[90%]'>
        <textarea
            className='w-[100%] bg-transparent outline-none text-[20px]'
            rows="2"
            placeholder="Type a message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)} 
            />

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

          {selectedMusic && (
            <div className="relative mb-4">
              <div className='absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer' onClick={() => setSelectedMusic(null)}>
                <AiOutlineClose className='text-white h-5' />
              </div>
              {/* Display an audio player for the selected music */}
              <audio controls className="max-h-40 rounded-[20px]">
                <source src={selectedMusic} type="audio/mpeg" />
                <source src={selectedMusic} type="audio/ogg" />
                <source src={selectedMusic} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>

            </div>
          )}

          {selectedDocument && (
            <div className="relative mb-4">
              <div className='absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer' onClick={() => setSelectedDocument(null)}>
                <AiOutlineClose className='text-white h-5' />
              </div>
              <div className="flex items-center">
                <FcDocument className="text-blue-500 mr-2" />
                {/* Display the file name with a character slice of 15 characters */}
                <span className="text-blue-500 hover:underline">
                  {selectedDocument.slice(selectedDocument.lastIndexOf('/') + 1).slice(0, 15)}
                </span>
              </div>
            </div>
          )}

        {!loading && (
            <div className='flex justify-between items-center'>

                <div className='flex gap-4 text-[20px] text-yellow-500'>

                    <label htmlFor="file">
                        <BsImage className='cursor-pointer' />
                    </label>
                    <input 
                           id="file" 
                           type="file"
                           accept="image/*" 
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

                    <label htmlFor="audio">
                            <BsFileEarmarkMusic className="cursor-pointer" />
                            </label>
                            <input
                            id="audio"
                            type="file"
                           // accept="audio/*" // Allow audio files only
                            hidden
                            onChange={addMusicToPost}
                            />

                    <label htmlFor="document">
                      <HiOutlineDocumentAdd className="cursor-pointer font-yellow-500" />
                    </label>
                    <input
                      id="document"
                      type="file"
                      accept=".pdf, .doc, .docx, .zip, .rar, .txt, .csv, .xlsx, .ppt, .pptx, .odt, .ods, .odp, .rtf, .html, .css, .js, .xml, .json, .log, .ini, .yml, .yaml, .sql, .dat, .csv, .tsv, .rtf, .odt, .ott, .xls, .ods, .ots, .ppt, .odp, .otp, .csv, .tsv, .tex, .rtf, .dot, .dotx, .dotm, .pub, .pages, .key, .numbers, .svg, .eps, .epub, .accdb, .mdb" // Specify accepted file types
                      hidden
                      onChange={addDocumentToPost}
                    />

                            {/* ...existing code */}
                            
                    <BsEmojiSmile className='cursor-pointer' 
                     onClick={() => setShowEmojis(!showEmojis)}
                     />
                   {/* <IoCalendarNumberOutline />
                       <RiBarChart2Line className='rotate-90' />
                       <HiOutlineLocationMarker /> */}
                </div>

                <button
                    className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                      disabled={!input.trim() && !selectedFile}
                      onClick={handleSubmit} 
                  >
                    Write
                </button>

            </div>
        )}

        

    </div>

</div>

</div> </> ) : (
          <p className="text-red-500 mt-5 text-center">Please verify your account to chat with <span className='text-yellow-800'>{userInfo.name} </span></p>
        )}
</section>

  );
};

export default Chat;
