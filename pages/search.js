import React from 'react'
import TheSearch from '../components/TheSearch';
import Sidebar from '../components/Sidebar';
import VerifiedUsersLists from '../components/VerifiedUsersList';

const search = () => {

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <TheSearch />
        <VerifiedUsersLists />
        </div>
    </div>
  );
};

export default search;
