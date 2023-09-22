import React from 'react'
import TheSearch from '../components/TheSearch';
import Sidebar from '../components/Sidebar';
import ProfileData from '../components/ProfileData';

const search = () => {

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <TheSearch />
        <ProfileData />
        </div>
    </div>
  );
};

export default search;
