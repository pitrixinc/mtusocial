import { signIn } from 'next-auth/react'
import React from 'react'
import { BsEmojiSmile, BsTwitter } from "react-icons/bs"
import Image from 'next/image'
import { FcGoogle } from "react-icons/fc"
import Logo from "../assets/images/mtu2.png";
import Typewriter from "typewriter-effect";

const Verify = () => {
  return (
    <div className='grid grid-rows-2 md:grid-cols-2 lg:grid-cols-2 h-screen'>

    <div className='bg-gradient-to-r from-yellow-500 to-black h-screen grid place-items-center '>
          <div className='hidden md:block lg:block'>
            <Image className='rounded-[1px]' src={Logo} height="220px" width="500px" />
          </div>
    </div>

      <div className='grid place-items-center h-screen overflow-y-scroll no-scrollbar mb-5'>
      <h1 className="font-bold text-2xl md:text-5xl lg:text-5xl p-5 mt-5">
         <span className="bg-gradient-to-r text-white from-yellow-500 to-black p-5 rounded-lg">Verify Your Identity</span>
      </h1>
      <h1 className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black p-5 text-center">
        <Typewriter 
           options={{
              strings: ['MTU Social: Where Huskies unite, passions ignite, and futures intertwine.','Connect with fellow Huskies; ignite your MTU journey today!','Unlock MTU`s vibrant community; share, inspire, and grow together.','Welcome to MTU Social: Where dreams meet and friendships flourish.','Step into MTU`s digital quad; discover, learn, and connect anew.','Join MTU`s digital campus; spark conversations, forge lifelong friendships.','MTU`s hub for connection: Explore, engage, and empower your aspirations.','Welcome, Huskies! Fuel your ambitions through shared experiences here.','Your gateway to MTU`s dynamic community: Connect, inspire, and excel.','Elevate your MTU experience: Unite, innovate, and thrive together.','Dear Husky, sign up to connect to the world of Tech'],
              autoStart: true,
              loop: true,
           }}
           />
      </h1>
       
       {/* Name */}
       <div className="mt-4 w-[80%]">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Name:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
            <input
              type="text"
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder='Enter Full Name'
            />
            </div>
          </div>

        {/* Date of Birth */}
       <div className="mt-4 w-[80%]">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Date Of Birth:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
            <input
              type="date"
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder='Enter Date of Birth'
            />
            </div>
          </div>


        {/* Email */}
       <div className="mt-4 w-[80%]">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">School Email:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
            <input
              type="email"
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder='Enter Your School/Student Email'
            />
            </div>
          </div>

        {/* Date Admitted */}
        <div className="mt-4 w-[80%]">
            <label className="block mb-1 mt-1 mx-3 font-semibold text-[17px]">Date Admitted:</label>
            <div  className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
            <input
              type="date"
              className="bg-transparent w-[100%] outline-none font-semibold"
              placeholder='Enter Date Admitted'
            />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4 w-[80%]">
          <label className="mt-4 block mb-1 mx-3 font-semibold text-[17px]">Bio:</label>
          <div className=' bg-gray-200 rounded-lg'>
          
          <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <textarea
              className='w-[100%] bg-transparent outline-none text-[18px]'
              rows="4"
              placeholder="Enter Bio"
            />
            </div>
            <div className='flex justify-between items-center'>
              <div className='flex gap-4 text-[20px] text-yellow-500 py-2 px-2'>
                <BsEmojiSmile />
              </div>
            </div>
          </div>
          </div>

         {/* Purpose of Joining */}
         <div className="mt-4 w-[80%]">
          <label className="mt-4 block mb-1 mx-3 font-semibold text-[17px]"> Purpose of Joining:</label>
          <div className=' bg-gray-200 rounded-lg'>
          
          <div  className="bg-gray-200 mt-1 flex gap-2 rounded-lg py-2 px-4 text-black items-center text-[15px] w-full mx-auto">
            <textarea
              className='w-[100%] bg-transparent outline-none text-[18px]'
              rows="4"
              placeholder="Purpose of Joining"
            />
            </div>
            <div className='flex justify-between items-center'>
              <div className='flex gap-4 text-[20px] text-yellow-500 py-2 px-2'>
                <BsEmojiSmile />
              </div>
            </div>
          </div>
          </div>

         {/*  <h1 className="font-bold text-3xl">Dear Husky, sign up to connect to the world of Tech </h1> 
        <div className='flex gap-4 bg-[#fff] p-4 px-6 items-center rounded-[6px] cursor-pointer shadow-md' onClick={() => signIn('google')}>
          <FcGoogle className='text-[30px]' />
          Sign In with Google
        </div>
          */}
      </div>

    </div>
  )
}

export default Verify