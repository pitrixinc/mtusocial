import React from 'react'
import Sidebar from '../../components/Sidebar'
import Notifications from '../../components/Notifications'
import ProfileData from '../../components/ProfileData'

const NotificationPage = () => {
  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <Notifications/>
        <ProfileData />
        </div>
    </div>
  )
}

export default NotificationPage