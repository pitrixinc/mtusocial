import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { useSession } from 'next-auth/react';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'; // Import Firebase Firestore functions
import { toast } from 'react-toastify';

function UpdateProfileModal({ isOpen, onClose }) {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState({
    name: '',
    tag: '',
    bio: '',
    location: '',
    website: '',
    email: '',
    dateOfBirth: '',
    profileImage: '',
    headerImage: '',
  });

  const [tagError, setTagError] = useState('');
  const [isTagAvailable, setIsTagAvailable] = useState(false);

  useEffect(() => {
    // Fetch the user's existing profile data when the modal is opened
    if (isOpen) {
      const fetchProfileData = async () => {
        try {
          const userDocRef = doc(collection(db, 'users'), session.user.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setProfileData(userData);
          }
        } catch (error) {
          console.error('Error fetching user profile data:', error);
          toast.error('Error fetching user profile data')
        }
      };

      fetchProfileData();
    }
  }, [isOpen, session?.user.uid]);

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageData = reader.result;
        setProfileData({ ...profileData, [type]: imageData });
      };
    }
  };

  const checkTagAvailability = async (tag) => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, where('tag', '==', tag));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size === 0) {
        setTagError('Username is available');
        setIsTagAvailable(true);
      } else {
        // Check if the existing tag belongs to the current user
        const userRef = querySnapshot.docs[0].ref;
        const userDocSnapshot = await getDoc(userRef);
        const userData = userDocSnapshot.data();
        if (userDocSnapshot.id === session.user.uid) {
          setTagError('Username is available');
          setIsTagAvailable(true);
        } else {
          setTagError('Username is already in use, type a different username');
          setIsTagAvailable(false);
        }
      }
    } catch (error) {
      console.error('Error checking tag availability:', error);
    }
  };

  const handleTagChange = (e) => {
    const newTag = e.target.value;
    setProfileData({ ...profileData, tag: newTag });
    if (newTag.trim() === '') {
      setTagError('');
      setIsTagAvailable(false);
      return;
    }

    // Validate that the tag contains only letters, numbers, underscores, or periods
    const validTag = /^[A-Za-z0-9_.]+$/.test(newTag);
    if (!validTag) {
      setTagError('Invalid characters in username');
      setIsTagAvailable(false);
      return;
    }

    checkTagAvailability(newTag);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userDocRef = doc(collection(db, 'users'), session.user.uid);
      await setDoc(userDocRef, profileData);
      toast.success('Updated Profile Successfully');
      // Close the modal after successfully updating the data
      onClose();
    } catch (error) {
      console.error('Error updating user profile data:', error);
      // Handle error updating user data here
    }
  };

  return (
    <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] overflow-y-auto shadow-md ${isOpen ? '' : 'hidden'}`}>
      <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]     overflow-y-auto no-scrollbar h-[380px] md:h-[450px]'>
               <div className='flex justify-end'>
                <MdClose className='text-[22px] cursor-pointer ' onClick={onClose} />
                </div>
                
        <h1 className='font-bold text-xl mb-1'>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            {/* Header image */}
            <img src={profileData.headerImage || 'https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg'} alt="Header" className='w-[100%] h-[190px] mx-auto object-cover rounded-md' />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'headerImage')}
              className="absolute bottom-2 right-2 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="absolute bottom-2 right-2 border rounded-full p-1 bg-gray-200 shadow-lg">
              <GoPencil className="text-gray-700 text-lg cursor-pointer" />
            </div>
          </div>

          {/* Profile picture */}
          <div className="flex items-start justify-between px-4 py-3">
            <div className="relative">
              <img
                className="-mt-16 h-32 w-32 cursor-pointer rounded-full ring-4 ring-gray-100"
                src={profileData.profileImage || session?.user?.image}
                alt="Profile"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profileImage')}
                className="absolute bottom-2 right-2 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="absolute bottom-2 right-2 border rounded-full p-1 bg-gray-200 shadow-lg">
                <GoPencil className="text-gray-700 text-lg cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="mt-4">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Name:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder='Enter Full Name'
            />
            </div>
          </div>

          {/* Username */}
          <div className="mt-4">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Username:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <input
              type="text"
              value={profileData.tag}
              onChange={handleTagChange}
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder="Enter Your Username"
            />
            </div>
            {tagError && (
              <p className={`text-sm mt-1 mx-3 ${tagError === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                {tagError}
              </p>
            )}

          </div>

          {/* Bio */}
          <label className="mt-4 block mb-1 mx-3 font-semibold text-[17px]">Bio:</label>
          <div className=' bg-gray-200 rounded-lg'>
          
          <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <textarea
              className='w-[100%] bg-transparent outline-none text-[18px]'
              rows="4"
              placeholder="Enter Bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            />
            </div>
            <div className='flex justify-between items-center'>
              <div className='flex gap-4 text-[20px] text-yellow-500 py-2 px-2'>
                <BsEmojiSmile />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mt-4">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Location:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder="Enter Your Location"
            />
            </div>
          </div>

          {/* Website */}
          <div className="mt-4">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Website:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <input
              type="text"
              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder="Enter Your website"
            />
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Email:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="bg-transparent w-[100%] outline-none font-semibold text-gray-500 cursor-not-allowed"
              disabled
            />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="mt-4">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Date of Birth:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
              className="bg-transparent w-[100%] outline-none font-semibold"
            />
          </div>
          </div>

          <div className="flex justify-between items-center">
              <div className="flex gap-4 text-[20px] text-yellow-500">
                
              </div>
              <button
                type="submit"
                className={`bg-yellow-500 text-white mt-2 rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 ${isTagAvailable ? '' : 'opacity-50 cursor-not-allowed'}`}
                disabled={!isTagAvailable}
              >
                Save
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfileModal;
