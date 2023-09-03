import { signIn } from 'next-auth/react'
import React from 'react'
import { BsTwitter } from "react-icons/bs"
import Image from 'next/image'
import { FcGoogle } from "react-icons/fc"
import Logo from "../assets/images/mtu.png";
import Typewriter from "typewriter-effect";

const Verify = () => {
  return (
    <div className='grid grid-rows-2 md:grid-cols-2 lg:grid-cols-2'>

      <div className='bg-yellow-500 h-screen grid place-items-center '>
        <Image className='rounded-[1px]' src={Logo} height="120px" width="200px" />
      </div>

      <div className='grid place-items-center'>
      <h1 className="font-bold text-2xl md:text-5xl lg:text-5xl p-5">
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