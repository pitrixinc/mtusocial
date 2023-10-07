import React, { useContext } from 'react'
import { useSession, getSession  } from "next-auth/react"
import Sidebar from '../../components/Sidebar'
import ProfilePerson from '../../components/ProfilePerson'
import Login from '../../components/Login'
import { AppContext } from '../../contexts/AppContext'
import UserProfileDetails from '../../components/UserProfileDetails'

const Profile = () => {
    
  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <ProfilePerson />
        <UserProfileDetails />
        </div>
    </div>
  )
}

export default Profile