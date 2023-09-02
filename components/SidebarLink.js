import React from 'react'

const SidebarLink = ({Icon, text}) => {
  return (
    <div className='text-[#16181C] flex items-center text-semibold justify-center xl:justify-start text-xl hover:text-white hover:bg-blue-500 space-x-3 hoverEffect px-4 py-2 w-fit'>
        <Icon />
        <span className='hidden xl:inline'>{text}</span>
    </div>
  )
}

export default SidebarLink