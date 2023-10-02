import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { MdVerified } from 'react-icons/md';
import Moment from 'react-moment'
import CountdownTimer from './CountdownTimer';

const Polls = () => {
  const { data: session } = useSession();
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'polls'));
        const pollData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const totalVotes = data.pollOptions.reduce((total, option) => total + option.votes, 0);

          // Calculate percentages for each option
          const pollOptionsWithPercentages = data.pollOptions.map((option) => ({
            ...option,
            percentage: totalVotes === 0 ? 0 : ((option.votes / totalVotes) * 100).toFixed(2),
          }));

          pollData.push({
            id: doc.id,
            createdBy: data.username,
            pollQuestion: data.pollQuestion,
            timestamp: data.timestamp,
            pollOptions: pollOptionsWithPercentages,
            totalVotes,
            userImg: data.userImg,
            pollImage: data.pollImage,
            pollVideo: data.pollVideo,
            endDate: data.endDate, // Add the end date/time to the poll data
            isClosed: data.isClosed, // Add isClosed to the poll data
          });
        });

        setPolls(pollData);
      } catch (error) {
        console.error('Error fetching polls:', error);
      }
    };

    fetchPolls();
  }, []);

  const handleVote = async (pollId, optionIndex) => {
    try {
      // Check if the user has already voted for this poll
      const userId = session?.user?.uid; // Replace with how you retrieve the user's ID
      if (!userId) {
        toast.error('User not authenticated.');
        return;
      }
  
      const pollRef = doc(db, 'polls', pollId);
  
      // Retrieve the user's votes for this poll
      const userVotesRef = doc(db, 'userVotes', `${userId}_${pollId}`); // Adjust this path as needed
  
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
        if (pollData.isClosed) {
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
      } else {
        toast.error('Poll not found.');
      }
    } catch (error) {
      console.error('Error voting for poll:', error);
      toast.error('Error voting for poll. Please try again later.');
    }
  };

  return (
    <div className='mt-4 border-t border-gray-300 px-4 pt-6 pb-4 cursor-pointer  overflow-y-auto'>
  <h1 className="text-3xl font-semibold text-gray-800">Display Polls</h1>
  <ul className="mt-4">
    {polls.map((poll) => (
      <li key={poll.id} className="bg-white shadow-md rounded-md p-4 mb-4">
        <div className='grid grid-cols-12 gap-4'>
          <div className="col-span-2">
            <img className='h-12 w-12 rounded-full object-cover' src={poll?.userImg} alt="" />
          </div>
          <div className="col-span-10">
            <div className='block sm:flex gap-1 items-center'>
              <div className='flex items-center'>
                <h1 className='text-xl font-semibold text-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{poll?.createdBy}</h1>
                {poll?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-1 ml-1" />) } {poll?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-1 ml-1" />) }
              </div>
              <div className='flex text-gray-500'>
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
        {poll.isClosed ? (
          <p className="mt-4 text-red-600 font-semibold">Poll Time Up.</p>
        ) : (
          <div className="mt-4">
            <p className="text-lg font-semibold">Time Remaining:</p>
            <CountdownTimer endDate={poll.endDate} />
          </div>
        )}

        {session ? (
          <ul className="mt-4">
            {poll.pollOptions.map((option, index) => (
              <li key={index} className="flex items-center justify-between mb-2">
                {/* Background color based on the percentage value */}
                <div className="w-1/6 h-8 bg-blue-400 rounded-l-lg" style={{ width: `${option.percentage}%` }}></div>
                {/* Disable voting options when the poll is closed */}
                {poll.isClosed ? (
                  <span className="text-lg font-semibold">{option.text} ({option.votes} votes, {option.percentage}%)</span>
                ) : (
                  <button
                    onClick={() => handleVote(poll.id, index)}
                    className="w-5/6 h-8 bg-blue-200 rounded-r-lg text-lg font-semibold text-blue-800 hover:bg-blue-300"
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
      </li>
    ))}
  </ul>
</div>

  );
};

export default Polls;