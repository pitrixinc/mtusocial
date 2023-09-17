import React from 'react'
import { FiSearch } from "react-icons/fi"
import VerifiedUsers from './VerifiedUsers'

const VerifiedUsersList = () => {
    return (

        <div className='hidden lg:block w-[350px] mt-2 h-screen overflow-y-auto no-scrollbar'>

            <div className='bg-white flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10 '>
                <FiSearch />
                <input className='bg-transparent w-[100%] outline-none' type="text" placeholder='Search Twitter' />
            </div>


            <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4 top-1 z-10 h-full sticky'>
                <h1 className='text-[20px] font-medium'>What's Happening</h1>

                <VerifiedUsers />

            </div>

        </div>
    )
}

export default VerifiedUsersList