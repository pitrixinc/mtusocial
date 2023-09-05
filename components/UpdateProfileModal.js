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
} from 'firebase/firestore'; // Import Firebase Firestore functions

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userDocRef = doc(collection(db, 'users'), session.user.uid);
      await setDoc(userDocRef, profileData);

      // Close the modal after successfully updating the data
      onClose();
    } catch (error) {
      console.error('Error updating user profile data:', error);
      // Handle error updating user data here
    }
  };

  return (
    <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]'>

                <MdClose className='text-[22px] cursor-pointer' onClick={onClose} />
                
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            {/* Header image */}
            <img src={profileData.headerImage || 'https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg'} alt="Header" />
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
                className="-mt-16 h-32 w-32 cursor-pointer rounded-full"
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
            <label>Name:</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>

          {/* Username */}
          <div className="mt-4">
            <label>Username:</label>
            <input
              type="text"
              value={profileData.tag}
              onChange={(e) => setProfileData({ ...profileData, tag: e.target.value })}
            />
          </div>

          {/* Bio */}
          <div className='mt-4'>
            <textarea
              className='w-[100%] bg-transparent outline-none text-[18px]'
              rows="4"
              placeholder="Enter Bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            />

            <div className='flex justify-between items-center'>
              <div className='flex gap-4 text-[20px] text-yellow-500'>
                <BsEmojiSmile />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mt-4">
            <label>Location:</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />
          </div>

          {/* Website */}
          <div className="mt-4">
            <label>Website:</label>
            <input
              type="text"
              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="mt-4">
            <label>Email:</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
          </div>

          {/* Date of Birth */}
          <div className="mt-4">
            <label>Date of Birth:</label>
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
            />
          </div>

          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfileModal;
