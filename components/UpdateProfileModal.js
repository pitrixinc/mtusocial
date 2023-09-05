import React, { useState } from 'react';
import { MdClose } from "react-icons/md"
import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineGif, AiOutlineClose } from "react-icons/ai"
import { RiBarChart2Line } from "react-icons/ri"
import { IoCalendarNumberOutline } from "react-icons/io5"
import { HiOutlineLocationMarker } from "react-icons/hi"
import { useSession } from 'next-auth/react'

function UpdateProfileModal({ isOpen, onClose }) {
  // State variables to manage user input
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const { data: session } = useSession()

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Send updated profile data to your API or update Firebase here
    // You can use newName and newImage states to send updated data

    // Close the modal
    onClose();
  };

  return (
    <div className={`fixed top-0 left-0 z-20 h-screen w-screen bg-[#242d34bb] ${isOpen ? '' : 'hidden'}`}>
      <div className='bg-white w-[350px] md:w-[650px] text-black absolute left-[50%] translate-x-[-50%] mt-[40px] p-4 rounded-[20px]'>

                <MdClose className='text-[22px] cursor-pointer' onClick={onClose} />
                
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
             {/* <!-- Header image --> */}
    <div>
      <img src="https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg" />
    </div>

   {/* <!-- Profile picture and edit button --> */}
    <div class="flex items-start justify-between px-4 py-3">
      <img class="-mt-[4.5rem] h-32 w-32 cursor-pointer rounded-full" src={session?.user?.image} />
    </div>

    

          <div className="mt-4">
            <label>Name:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label>Profile Image URL:</label>
            <input
              type="text"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
            />
          </div>
          <div className='mt-4'>
                        <textarea
                            className='w-[100%] bg-transparent outline-none text-[18px]'
                            rows="4"
                            placeholder="Enter Bio"/>

                        <div className='flex justify-between items-center'>
                            <div className='flex gap-4 text-[20px] text-yellow-500'>

                                <BsEmojiSmile />
                            </div>

                        </div>
                    </div>
            <div className="mt-4">
            <label>Location:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label>Website:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>       
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfileModal;
