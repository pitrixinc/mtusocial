import React from 'react'
import { FiSearch } from "react-icons/fi"
import TrendingList from './TrendingList'

const ProfileData = () => {
    return (

        <div className='hidden lg:block w-[350px] mt-2 overflow-y-auto no-scrollbar'>

            <div className='bg-white flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10'>
                <FiSearch />
                <input className='bg-transparent w-[100%] outline-none' type="text" placeholder='Search Twitter' />
            </div>


            <div className='bg-white rounded-[20px] text-[#16181C] mt-4 px-4 py-4 sticky top-1 z-10 h-full'>
                <h1 className='text-[20px] font-medium'>What's Happening</h1>

                <TrendingList />
                <TrendingList />
                <TrendingList />
                <TrendingList />
                <TrendingList />

            </div>

        </div>
    )
}

export default ProfileData