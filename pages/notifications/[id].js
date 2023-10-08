import React from 'react'
import Sidebar from '../../components/Sidebar'
import Notifications from '../../components/Notifications'
import VerifiedUsersList from '../../components/VerifiedUsersList'

const NotificationPage = () => {
  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <Notifications/>
        <VerifiedUsersList />
        </div>
    </div>
  )
}

export default NotificationPage