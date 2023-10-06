// Poll.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MdVerified } from 'react-icons/md';
import Moment from 'react-moment';
import CountdownTimer from './CountdownTimer';
import { BsArrowLeft } from 'react-icons/bs';
import { toast } from 'react-toastify';
import {RiRadioButtonLine} from 'react-icons/ri'

const SinglePoll = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [poll, setPoll] = useState(null);
   // New state variables for password handling
   const [passwordFormVisible, setPasswordFormVisible] = useState(false);
   const [enteredPassword, setEnteredPassword] = useState('');
   const [correctPasswordEntered, setCorrectPasswordEntered] = useState(false);
 

  useEffect(() => {
    const fetchPoll = async () => {
      if (id) {
        try {
          const pollDocRef = doc(db, 'polls', id);
          const pollDocSnapshot = await getDoc(pollDocRef);

          if (pollDocSnapshot.exists()) {
            const data = pollDocSnapshot.data();
            setPoll(data);
          } else {
            // Handle poll not found
            toast.error('Poll not found');
          }
        } catch (error) {
          toast.error('Error fetching poll:', error);
          // Handle error
        }
      }
    };

    fetchPoll();
  }, [id]);

  const handleVote = async (optionIndex) => {
    try {
      // Check if the user has already voted for this poll
      const userId = session?.user?.uid; // Replace with how you retrieve the user's ID
      if (!userId) {
        toast.error('User not authenticated.');
        return;
      }

      const pollRef = doc(db, 'polls', id);

      // Retrieve the user's votes for this poll
      const userVotesRef = doc(db, 'userVotes', `${userId}_${id}`); // Adjust this path as needed

      const userVotesSnapshot = await getDoc(userVotesRef);

      if (userVotesSnapshot.exists()) {
        toast.warning('You have already voted for this poll.');
        return;
      }

      // Get the poll document from Firestore
      const pollDocSnapshot = await getDoc(pollRef);

      if (pollDocSnapshot.exists()) {
        // Get the current poll data
        const pollData = pollDocSnapshot.data();

        // Check if the poll is closed
        if (new Date() >= new Date(pollData.endDate)) {
          toast.info('Poll time up.');
          return;
        }

        // Increment the vote count for the selected option
        pollData.pollOptions[optionIndex].votes += 1;

        // Update the poll document with the new vote count
        await updateDoc(pollRef, {
          pollOptions: pollData.pollOptions,
        });

        // Record the user's vote to prevent voting again
        await setDoc(userVotesRef, {
          voted: true,
        });

        toast.success('Vote recorded successfully!');
        
        // Update the poll state to reflect the changes
        setPoll(pollData);
      } else {
        toast.error('Poll not found.');
      }
    } catch (error) {
      console.error('Error voting for poll:', error);
      toast.error('Error voting for poll. Please try again later.');
    }
  };

  if (!poll) {
    // Display loading or error message
    return (
      <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
        <div className='flex justify-center items-center min-h-screen'>
          <p className="bg-clip-text text-transparent font-semibold bg-gradient-to-r from-yellow-500 to-black text-center">Loading Poll...</p>
        </div>
      </div>
    );
  }

  // Calculate the winner and total votes
  const totalVotes = poll.pollOptions.reduce((total, option) => total + option.votes, 0);
  const winner = totalVotes > 0
    ? poll.pollOptions.reduce((prev, current) => (current.votes > prev.votes ? current : prev)).text
    : 'No Votes';


    // password polls -----------------------------------------------------------
const handlePasswordInputChange = (e) => {
  setEnteredPassword(e.target.value);
};

const handlePasswordSubmit = async (id) => {
  try {
    // Check if the entered password matches the actual poll password
    const actualPollPassword = poll.password; // Use the password from the fetched poll data
      
    if (enteredPassword === actualPollPassword) {
      setCorrectPasswordEntered(true);
    } else {
      toast.error('Incorrect poll password. Please try again.');
    }
  } catch (error) {
    console.error('Error checking poll password:', error);
    toast.error('Error checking poll password. Please try again later.');
  }
};

  // -------------------------------------------------------------------------------------

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
      <div className='sticky top-0 bg-white flex items-center gap-4 font-bold text-[20px] px-4 py-2 shadow-md'>
        <BsArrowLeft className='cursor-pointer' onClick={() => router.push(`/polls`)} />
        <div className='text-center items-center justify-center'> MTU Social Poll</div>
      </div>

      <div key={poll.id} className="bg-white shadow-md rounded-md p-4 mb-4">
        {/* Display the poll details similar to your existing code */}
        <div className='grid grid-cols-[48px,1fr] gap-4'>
        
        <div>
          <img className='h-12 w-12 rounded-full object-cover' src={poll?.userImg} alt="" />
        </div>
        <div>
        <div className='block sm:flex gap-1'>
          <div className='flex items-center'>
            <h1 className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{poll?.username}</h1>
            {poll?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-1 ml-1" />) } {poll?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-1 ml-1" />) }
            </div>
            <div className='flex'>
              <p className='text-gray-500'>@{poll?.tag} &nbsp;·&nbsp;</p>
              <p className='text-gray-500'>
                <Moment fromNow>{poll?.timestamp?.toDate()}</Moment>
              </p>
            </div>


          </div></div>
          </div>
        
        <p className="mt-4 text-md">{poll.pollQuestion}</p>
        {poll?.pollImage && (
          <img
            className='max-h-[450px] object-cover rounded-lg mt-4'
            src={poll?.pollImage}
            alt="poll"
          />
        )}
        {poll?.pollVideo && (
          <video
            controls
            className="max-h-[450px] object-cover rounded-lg mt-4"
          >
            <source src={poll?.pollVideo}  />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Display the countdown timer */}
        {new Date() >= new Date(poll.endDate) ? (
          <div className="mt-4 text-red-600">
            <p className="mt-2 text-sm font-bold">Poll Time Up.</p>
            <p className="mt-2 text-sm font-semibold capitalize">Winner: {winner}</p>
            <p className="mt-2 text-sm font-semibold">Total Votes: {totalVotes}</p>
          </div>
        ) : (
          <div className="mt-4 flex items-center">
            <p className="text-sm mr-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">Time Remaining:</p>
            <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black"> <CountdownTimer endDate={poll.endDate} /> </p>
          </div>
        )}

        {/* Check if the poll is private */}
        {poll.isPrivate ? (
                correctPasswordEntered ? (
          <ul className="mt-4">
            {poll.pollOptions.map((option, index) => {
              const percentage = totalVotes === 0 ? 0 : ((option.votes / totalVotes) * 100).toFixed(2);
              const isPollClosed = new Date() >= new Date(poll.endDate);

              return (
                <li key={index} className="relative  justify-start mb-2">
                  {/* Background color based on the percentage value */}
                  <div className={`w-1/6 h-8 ${isPollClosed ? 'bg-green-400' : 'bg-yellow-100'} rounded-l-lg`} style={{ width: `${percentage}%` }}></div>
                  {/* Display the option text and votes */}
                  <div className="w-5/6 flex items-center justify-between">
                   
                    {isPollClosed ? (
                      <span className="text-sm font-semibold absolute inset-0 flex items-center px-2 text-gray-500"> <RiRadioButtonLine className='mr-1' /> {option.text} {option.votes} votes, {percentage}%</span>
                    ) : (
                      <button
                        onClick={() => handleVote(index)}
                        className={`absolute inset-0 w-full h-8 rounded-r-lg text-sm font-semibold flex px-2 text-yellow-800 items-center`}
                      >
                      <RiRadioButtonLine className='mr-1' /> {option.text} {option.votes} Votes, ({percentage}%)
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          ) : (
            // Render password form if the correct password is not entered
            <div className="bg-gray-200 mt-2 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] sticky top-1 z-10 justify-between mx-3">
              
              <input
                id="passwordInput"
                type="password"
                value={enteredPassword}
                onChange={handlePasswordInputChange}
                placeholder="Enter Poll Password to view and vote"
                className="bg-transparent w-[100%] outline-none"
              />
              <button
                onClick={() => handlePasswordSubmit(poll.id)}
                className="border-l border-l-gray-400 px-1 text-md font-bold cursor-pointer"
              >
                View
              </button>
            </div>
          )
        ) : (
           // Render poll options for public polls
          <ul className="mt-4">
            {poll.pollOptions.map((option, index) => {
              const percentage = totalVotes === 0 ? 0 : ((option.votes / totalVotes) * 100).toFixed(2);
              return (
              <li key={index} className="relative  justify-start mb-2">
                {/* Background color based on the percentage value */}
                <div className={`w-1/6 h-8 ${new Date() >= new Date(poll.endDate) ? 'bg-green-400' : 'bg-yellow-200'} rounded-tl-lg rounded-bl-lg rounded-tr-lg`} style={{ width: `${percentage}%` }}>
                  {/* Placeholder for the background color */}
                </div>
                {/* Disable voting options when the poll is closed */}
                {new Date() >= new Date(poll.endDate) ? (
                  <span className="text-sm font-semibold absolute inset-0 flex items-center px-2 text-gray-600 cursor-not-allowed">
                    <RiRadioButtonLine className='mr-1' />  {option.text} ({option.votes} votes, {percentage}%)
                  </span>
                ) : (
                  <button
                    onClick={() => handleVote(poll.id, index)}
                    className={`absolute inset-0 w-full h-8  text-sm font-semibold flex px-2 text-gray-600 items-center`}
                  >
                   <RiRadioButtonLine className='mr-1' /> {option.text} ({option.votes} votes, {percentage}%)
                  </button>
                )}
              </li>
            )})}
          </ul>)}
       
      </div>
    </div>
  );
};

export default SinglePoll;
