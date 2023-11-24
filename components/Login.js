import { signIn } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { FcGoogle } from "react-icons/fc"
import Logo from "../assets/images/mtu2.png";
import Typewriter from "typewriter-effect";
import Head from 'next/head'
import {toast} from 'react-toastify';

const Login = () => {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    'https://www.mtu.edu/news/2017/09/images/image180286-fshorizw.jpg',
    'https://www.mtu.edu/alumni/images/alumni-profiles-card800.jpg',
    'https://www.mtu.edu/housing/education/student-orgs/images/whsa2-card800.jpg',
    'https://www.mtu.edu/success/orientation/parents-family/images/michigan-tech-family-2-card800.jpg',
    'https://www.mtu.edu/engineering/images/coe-engineering-salaries-button-card800.jpg',
    'https://scontent.facc5-2.fna.fbcdn.net/v/t39.30808-6/284383869_374694901388174_2420203741948065705_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=5f2048&_nc_ohc=IC-Li5whMMwAX-iNnKm&_nc_zt=23&_nc_ht=scontent.facc5-2.fna&oh=00_AfB_cZ9xsJCY1--0sb58V9N4s1pXseK-aj454sXNzE7JvQ&oe=6564777A',
    'https://scontent.facc5-2.fna.fbcdn.net/v/t1.6435-9/167160250_105674501623550_7776483419068299302_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=0bb214&_nc_ohc=efI5EfoepCoAX9X521q&_nc_ht=scontent.facc5-2.fna&oh=00_AfBzex-KZ9J8G1iCGweSwuyE7GlLLcHpEb7B7Y5s6u1GZQ&oe=6586F762',
    'https://scontent.facc5-2.fna.fbcdn.net/v/t1.6435-9/165946910_105674351623565_3826990127748756188_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=0bb214&_nc_ohc=I8VJgehCRmMAX8tx-YQ&_nc_ht=scontent.facc5-2.fna&oh=00_AfCyhmW0h8aJ57jpeNq6tM5TL1daIIHX2IzFAffNtq-7TA&oe=6586F2D4',
    'https://i.ytimg.com/vi/BU0QfC3jUxQ/maxresdefault.jpg',
    'https://blogs.mtu.edu/business/files/2022/05/DECA2.jpg',
    'https://blogs.mtu.edu/physics/files/2022/04/20220405_1745030-scaled.jpg',
    // Add more image paths as needed
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      toast.success("Click the blurred image to sign in!");
    }, 12000); // Change the interval as needed (in milliseconds)

    return () => clearInterval(interval);
  }, [images.length]);
  
  return (
    <>
    <Head>
        <title>Login - MTU Social</title>
        <meta name="description" content="Michigan Technological University Social Network Website" />
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

      <div className='grid place-items-center justify-center h-screen overflow-y-scroll no-scrollbar mb-5 relative'>
          <div
            className='absolute inset-0 z-10 bg-opacity-40 bg-blur-md backdrop-blur-md'
            style={{ backgroundImage: `url(${images[currentImageIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
          ></div>
     <div className='absolute inset-0 z-20 flex flex-col items-center p-5 transition-all duration-300 rounded-lg blur-lg hover:blur-none'>
      <div className='wrapper flex flex-col items-center justify-between ' style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.6)'}}>
      <h1 className="font-bold text-xl sm:text-md md:text-md lg:text-5xl p-5">
         <span className="bg-gradient-to-r text-white from-yellow-500 to-black p-5 rounded-lg shadow-lg">Welcome To MTU Social</span>
      </h1>
      <h1 className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black p-5 text-center w-[90%]">
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

        <div className='flex gap-4 bg-[#fff] w-[250px] p-4 px-6 items-center text-center justify-center rounded-[6px] cursor-pointer shadow-md' onClick={() => signIn('google')}>
          <FcGoogle className='text-[30px]' />
          Sign In with Google
        </div>
        </div>
        </div>
      </div>

    </div></>
  )
}

export default Login