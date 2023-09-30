import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineVideoCameraAdd, AiOutlineClose } from "react-icons/ai"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { toast } from 'react-toastify';
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

const Input = () => {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentionInput, setMentionInput] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [mentionStartIndex, setMentionStartIndex] = useState(null);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tempHashtags, setTempHashtags] = useState([]); // Temporary storage for hashtags

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
          toast.error('Error fetching user data');
        }
      };

      fetchData();
    }
  }, [session]);

  const handleMentionInputChange = (e) => {
    const inputValue = e.target.value;
    setInput(inputValue);

    // Check if the user has typed @
    if (inputValue.includes('@')) {
      const mentionIndex = inputValue.lastIndexOf('@');
      setMentionStartIndex(mentionIndex);
      setMentionInput(inputValue.substring(mentionIndex + 1));
    } else {
      setUserSuggestions([]);
    }
  };

  useEffect(() => {
    // Function to shuffle an array randomly
    const shuffleArray = (array) => {
      let currentIndex = array.length,
        randomIndex,
        tempValue;

      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap elements
        tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
      }

      return array;
    };

    const fetchUserSuggestions = async () => {
      if (mentionStartIndex !== null) {
        try {
          const usersCollectionRef = collection(db, 'users');
          const q = query(usersCollectionRef, where('name', '>=', mentionInput), where('name', '<=', mentionInput + '\uf8ff'));
          const querySnapshot = await getDocs(q);

          const users = querySnapshot.docs.map((doc) => doc.data());

          // Shuffle the users array randomly
          const shuffledUsers = shuffleArray(users);

          // Limit the number of user suggestions to 4
          const limitedUserSuggestions = shuffledUsers.slice(0, 4);

          setUserSuggestions(limitedUserSuggestions);
        } catch (error) {
          console.error('Error fetching user suggestions:', error);
        }
      }
    };

    fetchUserSuggestions();
  }, [mentionInput, mentionStartIndex]);

  const handleUserMentionSelect = (user) => {
    const mentionIndex = mentionStartIndex !== null ? mentionStartIndex : 0;
    const inputValue =
      input.substring(0, mentionIndex) +
      `@${user.tag} ` +
      input.substring(mentionIndex + mentionInput.length + 1);

    setInput(inputValue);
    setUserSuggestions([]);
  };

  const handleHashtagInputChange = (e) => {
    const hashtagValue = e.target.value;
    setHashtagInput(hashtagValue);

    // Check if the user has typed #
    if (hashtagValue.includes('#')) {
      const hashtagIndex = hashtagValue.lastIndexOf('#');
      const currentHashtag = hashtagValue.substring(hashtagIndex + 1);

      // Fetch hashtag suggestions based on current input
      fetchHashtagSuggestions(currentHashtag);
    } else {
      setHashtagSuggestions([]);
    }
  };

  const fetchHashtagSuggestions = async (currentHashtag) => {
    try {
      const hashtagsCollectionRef = collection(db, 'hashtags');
      const q = query(hashtagsCollectionRef, where('name', '>=', currentHashtag), where('name', '<=', currentHashtag + '\uf8ff'));
      const querySnapshot = await getDocs(q);

      const hashtags = querySnapshot.docs.map((doc) => doc.data());

      setHashtagSuggestions(hashtags);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    }
  };

  const handleHashtagSelect = (hashtag) => {
    const inputValue = input + `#${hashtag.name} `;
    setInput(inputValue);
    setHashtagSuggestions([]);
  };

  const createNewHashtag = async () => {
    if (hashtagInput.trim() === '') {
      return;
    }

    try {
      // Add the new hashtag to Firestore
  {/*    const hashtagsCollectionRef = collection(db, 'hashtags');
      await addDoc(hashtagsCollectionRef, {
        name: hashtagInput.trim(),
        timestamp: serverTimestamp(),
      });
    */}
      // Append the new hashtag to the input
      const inputValue = input + `${hashtagInput.trim()} `;
      setInput(inputValue);
      setHashtagInput('');
      setHashtagSuggestions([]);
      // Store the hashtag temporarily
      setTempHashtags([...tempHashtags, `${hashtagInput.trim()}`]);
    } catch (error) {
      console.error('Error creating new hashtag:', error);
    }
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

  const sendPost = async () => {
    if (loading) return;

    setLoading(true);

    if (!userData) {
      toast.error('User data is not available.');
      setLoading(false);
      return;
    }

    // Check for mentions in the input text
    const mentionRegex = /@(\w+)/g;
    const mentions = input.match(mentionRegex);

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

    const imageRef = ref(storage, `posts/${docRef.id}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, 'data_url')
        .then(async () => {
          const downloadURL = await getDownloadURL(imageRef);
          await updateDoc(doc(db, 'posts', docRef.id), {
            image: downloadURL,
          });
        })
        .catch((error) => {
          toast.error('Error uploading image');
        });
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
          toast.error('Error uploading video');
        });
    }

    // Check for mentions and send notifications
    if (mentions) {
      mentions.forEach(async (mention) => {
        // Extract the username from the mention (remove '@' character)
        const username = mention.slice(1);

        // Find the user with the mentioned username
        const userQuery = query(collection(db, 'users'), where('tag', '==', username));
        const userQuerySnapshot = await getDocs(userQuery);

        userQuerySnapshot.forEach(async (userDoc) => {
          // Create a notification for the mentioned user
          const mentionedUserId = userDoc.id;

          await addDoc(collection(db, 'notifications'), {
            senderUserId: userData.id,
            recipientUserId: mentionedUserId,
            postId: docRef.id, // Include the post ID here
            type: 'tag',
            senderName: session.user.name,
            senderImage: session.user.image,
            message:  'tagged you in a recent post.',
            timestamp: new Date(),
            read: false,
          });
        });
      });
    }

    // Store hashtags in the "hashtags" collection
    tempHashtags.forEach(async (tempHashtag) => {
      try {
        // Add the new hashtag to Firestore
        const hashtagsCollectionRef = collection(db, 'hashtags');
        await addDoc(hashtagsCollectionRef, {
          postId: docRef.id,
          name: tempHashtag.substring(1), // Remove the '#' character
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error creating new hashtag:', error);
      }
    });


    // Clear temporary hashtags and input
    setTempHashtags([]);
    setInput('');
    setSelectedFile(null);
    setSelectedVideo(null);
    setShowEmojis(false);

    toast.success('Your post was sent!');
    setLoading(false);
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
            onChange={handleMentionInputChange}
          />

          {selectedFile && (
            <div className="relative mb-4">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setSelectedFile(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={selectedFile} alt="" className="rounded-2xl max-h-80 object-contain" />
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
              <video controls src={selectedVideo} className="rounded-2xl max-h-80"></video>
            </div>
          )}

          {!loading && (
            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-[20px] text-yellow-500">
                <label htmlFor="file">
                  <BsImage className="cursor-pointer" />
                </label>

                <input id="file" type="file" accept="image/*"  hidden onChange={addImageToPost} />

                <label htmlFor="video">
                  <AiOutlineVideoCameraAdd className="cursor-pointer" />
                </label>
                <input id="video" type="file" accept="video/*" hidden onChange={addVideoToPost} />

                <BsEmojiSmile className='cursor-pointer' onClick={() => setShowEmojis(!showEmojis)} />
              </div>

              <button
                className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                disabled={!input.trim() && !selectedFile}
                onClick={sendPost}
              >
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

          {userSuggestions.length > 0 && (
            <div className="mt-2 max-h-20 overflow-y-auto border rounded-md p-2 absolute bg-white shadow-md z-10 no-scrollbar">
              {userSuggestions.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
                  onClick={() => handleUserMentionSelect(user)}
                >
                  <img src={user.profileImage} alt={user.name} className="w-6 h-6 rounded-full object-cover mr-2" />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}

          {hashtagSuggestions.length > 0 && (
            <div className="mt-2 max-h-20 overflow-y-auto border rounded-md p-2 absolute bg-white shadow-md z-10 no-scrollbar">
              {hashtagSuggestions.map((hashtag) => (
                <div
                  key={hashtag.id}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
                  onClick={() => handleHashtagSelect(hashtag)}
                >
                  <span className="text-blue-500">#</span>
                  <span>{hashtag.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center">
            <input
              type="text"
              className="w-[100%] bg-transparent outline-none text-[15px] no-scrollbar"
              placeholder="Add hashtags"
              value={hashtagInput}
              onChange={handleHashtagInputChange}
              onBlur={createNewHashtag}
            />
          </div>

          {tempHashtags.length > 0 && (
            <div className="mt-2 flex items-center">
              <div className="text-gray-500">
                {tempHashtags.map((tag) => (
                  <span key={tag} className="mr-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;