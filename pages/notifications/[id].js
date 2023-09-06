import React from 'react'
import Sidebar from '../../components/Sidebar'
import Notification from '../../components/Notifications'
import ProfileData from '../../components/ProfileData'

const NotificationPage = () => {
  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <Notification />
        <ProfileData />
        </div>
    </div>
  )
}

export default NotificationPage