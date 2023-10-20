import { signIn } from 'next-auth/react'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { FcGoogle } from "react-icons/fc"
import Logo from "../assets/images/mtu2.png";
import Typewriter from "typewriter-effect";
import Head from 'next/head'

const Login = () => {
  
  return (
    <>
    <Head>
        <title>Login - MTU Social</title>
        <meta name="description" content="Michigan Technological University Social Network" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </Head>

    <div className='grid grid-rows-2 md:grid-cols-2 lg:grid-cols-2 h-screen'>
      {/* ... (your existing UI code) ... */}
      <div className='bg-gradient-to-r from-yellow-500 to-black h-screen hidden md:grid lg:grid place-items-center '>
          <div className='hidden md:block lg:block'>
            <Image className='rounded-[1px]' src={Logo} height="220px" width="500px" />
          </div>
    </div>

      <div className='grid place-items-center h-screen overflow-y-scroll no-scrollbar mb-5'>
      <h1 className="font-bold text-xl md:text-5xl lg:text-5xl p-5">
         <span className="bg-gradient-to-r text-white from-yellow-500 to-black p-5 rounded-lg shadow-lg">Welcome To MTU Social</span>
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
         
         <div className='font-bold text-2xl'>
         <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div> */}

        <div className='flex gap-4 bg-[#fff] p-4 px-6 items-center rounded-[6px] cursor-pointer shadow-md' onClick={() => signIn('google')}>
          <FcGoogle className='text-[30px]' />
          Sign In with Google
        </div>

      </div>

    </div></>
  )
}

export default Login