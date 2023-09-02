import { signIn } from 'next-auth/react'
import React from 'react'
import { BsTwitter } from "react-icons/bs"
import Image from 'next/image'
import { FcGoogle } from "react-icons/fc"
import Logo from "../assets/images/mtu.png";

const Login = () => {
  return (
    <div className='grid grid-rows-2 md:grid-cols-2 lg:grid-cols-2'>

      <div className='bg-yellow-500 h-screen grid place-items-center '>
        <Image className='rounded-[1px]' src={Logo} height="120px" width="200px" />
      </div>

      <div className='grid place-items-center'>

        <div className='flex gap-4 bg-[#fff] p-4 px-6 items-center rounded-[6px] cursor-pointer' onClick={() => signIn('google')}>
          <FcGoogle className='text-[30px]' />
          SignIn with Google
        </div>

      </div>

    </div>
  )
}

export default Login