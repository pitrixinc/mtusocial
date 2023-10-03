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

const SinglePoll = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [poll, setPoll] = useState(null);

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
  const pollOptionsWithPercentages = poll.pollOptions.map((option) => ({
    ...option,
    percentage: totalVotes === 0 ? '0.00%' : `${((option.votes / totalVotes) * 100).toFixed(2)}%`,
  }));
  const winner = totalVotes > 0
    ? poll.pollOptions.reduce((prev, current) => (current.votes > prev.votes ? current : prev)).text
    : 'No Votes';

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] py-2 overflow-y-auto h-screen no-scrollbar'>
      <div className='sticky top-0 bg-white flex items-center gap-4 font-bold text-[20px] px-4 py-2'>
        <BsArrowLeft className='cursor-pointer' onClick={() => router.push(`/polls`)} />
        <div className='text-center items-center justify-center'> MTU Social Poll</div>
      </div>

      <div key={poll.id} className="bg-white shadow-md rounded-md p-4 mb-4">
        {/* Display the poll details similar to your existing code */}
        <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <img className="h-12 w-12 rounded-full object-cover" src={poll?.userImg} alt="" />
              </div>
              <div className="col-span-10">
                <div className="block sm:flex gap-1 items-center">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">{poll?.username}</h1>
                    {poll?.isQualifiedForBadge && <MdVerified className="text-blue-500 inline mt-1 ml-1" />}
                    {poll?.isQualifiedForGoldBadge && <MdVerified className="text-yellow-500 inline mt-1 ml-1" />}
                  </div>
                  <div className="flex text-gray-500">
                    <p>@{poll?.tag} &nbsp;·&nbsp;</p>
                    <p>
                      <Moment fromNow>{poll?.timestamp?.toDate()}</Moment>
                    </p>
                  </div>
                </div>
              </div>
            </div>
        
        <p className="mt-4 text-lg">{poll.pollQuestion}</p>
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
          <div className="mt-4 text-red-600 font-semibold">
            <p>Poll Time Up.</p>
            <p className="mt-2 text-lg font-semibold">Winner: {winner}</p>
            <p>Total Votes: {totalVotes}</p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-lg font-semibold">Time Remaining:</p>
            <CountdownTimer endDate={poll.endDate} />
          </div>
        )}

        {session ? (
          <ul className="mt-4">
            {pollOptionsWithPercentages.map((option, index) => (
              <li key={index} className="relative  justify-start mb-2">
              {/* Background color based on the percentage value */}
              <div className={`w-1/6 h-8 ${new Date() >= new Date(poll.endDate) ? 'bg-green-400' : 'bg-blue-400'} rounded-l-lg`} style={{ width: `${option.percentage}%` }}>
                {/* Placeholder for the background color */}
              </div>
              {/* Disable voting options when the poll is closed */}
              {new Date() >= new Date(poll.endDate) ? (
                <span className="text-lg font-semibold absolute inset-0 flex px-2">
                  {option.text} ({option.votes} votes, {option.percentage}%)
                </span>
              ) : (
                <button
                  onClick={() => handleVote(poll.id, index)}
                  className={`absolute inset-0 w-full h-8 rounded-r-lg text-lg font-semibold flex px-2 ${new Date() >= new Date(poll.endDate) ? 'bg-green-200 text-green-800 hover:bg-green-300' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}
                >
                  {option.text} ({option.votes} votes, {option.percentage}%)
                </button>
              )}
            </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-lg">Login to see and vote on polls</p>
        )}
      </div>
    </div>
  );
};

export default SinglePoll;
