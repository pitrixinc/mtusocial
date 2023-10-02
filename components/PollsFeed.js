import React, { useEffect, useState } from 'react'
import { HiOutlineSparkles } from "react-icons/hi"
import PollsInput from './PollsInput'
import Polls from './Polls'
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Feed = () => {

  const [polls, setPolls] = useState([])

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "polls"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setPolls(snapshot.docs);
        }
      ),
    [db]
  )
  return (
    <section className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
      <div className='sticky top-0 bg-white flex justify-between font-medium text-[20px] px-4 py-2'>
        Home
        <HiOutlineSparkles />
      </div>

      <PollsInput />
      
     
      <Polls  />
    
 


    </section>
  )
}

export default Feed