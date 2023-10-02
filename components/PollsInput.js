import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { addDoc, collection, doc, serverTimestamp, getDoc,  updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { toast } from 'react-toastify';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { AiOutlineClose } from 'react-icons/ai';
import {BiAddToQueue} from 'react-icons/bi'
import {MdOutlineRemoveCircleOutline} from 'react-icons/md'

const Input = () => {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [endDate, setEndDate] = useState(null); // State to track the end date/time

  const [pollOptions, setPollOptions] = useState([
    { text: 'Option 1', votes: 0 },
    { text: 'Option 2', votes: 0 },
  ]);

  // Poll-related state
  const [pollType, setPollType] = useState('text'); // 'text', 'image', or 'video'
  const [pollImage, setPollImage] = useState(null);
  const [pollVideo, setPollVideo] = useState(null);

  useEffect(() => {
    if (session?.user) {
      const userDocRef = doc(db, 'users', session.user.uid);
  
      const fetchData = async () => {
        try {
          const userDocSnapshot = await getDoc(userDocRef);
  
          if (userDocSnapshot.exists()) {
            const userDocData = userDocSnapshot.data();
            setUserData(userDocData);
          } else {
            // User document does not exist
            toast.error('User data not found.');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Error fetching user data. Please try again later.');
        }
      };
  
      fetchData();
    }
  }, [session]);

  const addImageToPoll = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setPollImage(readerEvent.target.result);
    };
  };

  const addVideoToPoll = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setPollVideo(readerEvent.target.result);
    };
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, { text: '', votes: 0 }]);
  };

  const removePollOption = (index) => {
    const updatedOptions = [...pollOptions];
    updatedOptions.splice(index, 1);
    setPollOptions(updatedOptions);
  };

  const handleOptionChange = (index, newText) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index].text = newText;
    setPollOptions(updatedOptions);
  };

  const calculatePercentage = (votes) => {
    const totalVotes = pollOptions.reduce((total, option) => total + option.votes, 0);
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(2);
  };

  const sendPoll = async () => {
    if (loading) return;

    setLoading(true);

    if (!userData) {
      toast.error('User data is not available.');
      setLoading(false);
      return;
    }

     // Calculate the end date/time (e.g., 1 hour from the current time)
     const endTimestamp = new Date(endDate);
     const currentTimestamp = new Date();
 
     if (endTimestamp <= currentTimestamp) {
       toast.error('End date/time should be in the future.');
       setLoading(false);
       return;
     }

    try {
      const pollData = {
        id: userData.id,
        username: userData.name,
        userImg: userData.profileImage,
        tag: userData.tag,
        pollQuestion: input,
        pollType,
        pollOptions,
        timestamp: serverTimestamp(),
        pollImage: pollImage || '',
        pollVideo: pollVideo || '',
        isVerified: userData.isVerified || false,
        isQualifiedForBadge: userData.isQualifiedForBadge || false,
        isQualifiedForGoldBadge: userData.isQualifiedForGoldBadge || false,
        endDate: endTimestamp.toISOString(), // Store the end date/time as a string
        isClosed: false, // Initialize isClosed as false
      };

      const docRef = await addDoc(collection(db, 'polls'), pollData); // Assign docRef here

      // Schedule a function to automatically close the poll when the end date/time is reached
      const pollId = docRef.id;
      const timeRemaining = endTimestamp - serverTimestamp();
      if (timeRemaining > 0) {
        setTimeout(async () => {
          try {
            const pollRef = doc(db, 'polls', pollId);

            // Check if the poll is already closed
            const pollDocSnapshot = await getDoc(pollRef);
            const pollData = pollDocSnapshot.data();

            if (!pollData.isClosed) {
              // Update the poll document to indicate that it's closed
              await updateDoc(pollRef, {
                isClosed: true,
              });
              toast.info('Poll closed automatically.');
            }
          } catch (error) {
            console.error('Error closing poll:', error);
          }
        }, timeRemaining);
      }

      
      setInput('');
      setPollOptions([{ text: 'Option 1', votes: 0 }, { text: 'Option 2', votes: 0 }]);
      setPollType('text');
      setPollImage(null);
      setPollVideo(null);

      toast.success('Your poll was created!');
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Error creating poll. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-4 px-4 ${loading && 'opacity-60'}`}>
      <div className="grid grid-cols-[48px,1fr] gap-4">
        <div>
          <img className="h-12 w-12 rounded-full object-contain" src={session?.user?.image} alt="" />
        </div>

        <div className="w-[90%]">
          <textarea
            className="w-[100%] bg-transparent outline-none text-[20px] no-scrollbar"
            rows="2"
            placeholder="What's Happening?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

{pollImage && (
            <div className="relative mb-4">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setPollImage(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={pollImage} alt="" className="rounded-2xl max-h-80 object-contain" />
            </div>
          )}

          {pollVideo && (
            <div className="relative mb-4">
              <div
                className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
                onClick={() => setPollVideo(null)}
              >
                <AiOutlineClose className="text-white h-5" />
              </div>
              <video controls src={pollVideo} className="rounded-2xl max-h-80"></video>
            </div>
          )}

          {/* Media upload options */}
          {pollType === 'image' && (
            <div>
              <label htmlFor="imageFile" className="cursor-pointer">
                Upload Image
              </label>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                hidden
                onChange={addImageToPoll}
              />
            </div>
          )}
          {pollType === 'video' && (
            <div>
              <label htmlFor="videoFile" className="cursor-pointer">
                Upload Video
              </label>
              <input
                id="videoFile"
                type="file"
                accept="video/*"
                hidden
                onChange={addVideoToPoll}
              />
            </div>
          )}

          {/* Poll options */}
          {pollOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="border p-1"
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              <button onClick={() => removePollOption(index)}>
                <MdOutlineRemoveCircleOutline />
              </button>
            </div>
          ))}

          <button onClick={addPollOption}><BiAddToQueue /></button>

           {/* Input field for setting the end date/time */}
        <div>
          <label htmlFor="endDateInput" className="block mb-2">
            End Date/Time
          </label>
          <input
            id="endDateInput"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border p-1"
          />
        </div>

          <div className="flex gap-4 text-[20px] text-yellow-500">
            <button
              onClick={() => setPollType('text')}
              className={`cursor-pointer ${pollType === 'text' && 'text-yellow-700'}`}
            >
              Text
            </button>
            <button
              onClick={() => setPollType('image')}
              className={`cursor-pointer ${pollType === 'image' && 'text-yellow-700'}`}
            >
              Image
            </button>
            <button
              onClick={() => setPollType('video')}
              className={`cursor-pointer ${pollType === 'video' && 'text-yellow-700'}`}
            >
              Video
            </button>
          </div>

          {!loading && (
            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-[20px] text-yellow-500">
                <button onClick={() => setShowEmojis(!showEmojis)}>
                  Show Emojis
                </button>
              </div>

              <button
                className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                disabled={!input.trim() || !pollOptions.length}
                onClick={sendPoll}
              >
                Create Poll
              </button>
            </div>
          )}

          {showEmojis && (
            <div className='absolute mt-[10px] -ml-[40px] max-w-[320px] rounded-[20px]'>
              <Picker
                onEmojiSelect={(e) => setInput(input + e.native)}
                data={data}
                theme="dark"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;
