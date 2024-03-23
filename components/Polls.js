import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { MdVerified } from 'react-icons/md';
import {RiRadioButtonLine} from 'react-icons/ri';
import Moment from 'react-moment';
import CountdownTimer from './CountdownTimer';
import { useRouter } from 'next/router';
import SkeletonLoader from './SkeletonLoader';
import CryptoJS from 'crypto-js';

const Polls = () => {
  const { data: session } = useSession();
  const [polls, setPolls] = useState([]);
  const router = useRouter();
  // New state variables for password handling
  const [passwordFormVisible, setPasswordFormVisible] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [correctPasswordEntered, setCorrectPasswordEntered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  

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
            isQualifiedForBadge: data.isQualifiedForBadge,
            isQualifiedForGoldBadge: data.isQualifiedForGoldBadge,
            isPrivate: data.isPrivate,
            password: data.password,
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

  const [loading, setLoading] = useState(true)
  // Use useEffect to simulate loading time
  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false); // Set loading to false after a simulated delay
    }, 1000); // Adjust the delay time as needed

    return () => clearTimeout(delay);
  }, []);

// password polls -----------------------------------------------------------
const handlePasswordInputChange = (e) => {
  setEnteredPassword(e.target.value);
};

const handlePasswordSubmit = async (pollId) => {
  try {
    // Find the poll by pollId
    const poll = polls.find((p) => p.id === pollId);

    if (!poll) {
      toast.error('Poll not found.');
      return;
    }

    // Check if the entered password matches the actual poll password
    const actualPollPassword = poll.password; // Use the password from pollData

    // Decrypt the entered password
    const bytes = CryptoJS.AES.decrypt(actualPollPassword, process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
      
    if (enteredPassword === decryptedPassword) {
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



  const handleSearchInputChange = (e) => {

    // Clear previous error message on search
    setErrorMessage('');

    setSearchQuery(e.target.value);

    // Check if the search query meets the length requirement
    if (searchQuery.length < 3) {
      setErrorMessage('Your search input should be at least three letters');
      setLoading(false);
      return;
    }

    // Check if the search query contains any special characters
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (specialCharacters.test(searchQuery)) {
      setErrorMessage('No special character is allowed');
      setLoading(false);
      return;
    }
  };

  const filteredPolls = polls.filter((poll) => {
    const searchText = searchQuery.toLowerCase();
    const pollId = poll.id.toLowerCase();
    const pollQuestion = poll.pollQuestion.toLowerCase();
    const createdBy = poll.createdBy.toLowerCase();

    return (
      pollId.includes(searchText) ||
      pollQuestion.includes(searchText) ||
      createdBy.includes(searchText)
    );
  });

  return (
    <div className="mt-4 border-t border-gray-300 px-4 pt-6 pb-4 cursor-pointer overflow-y-auto">
      

       {/* Add the search input */}
       <div className="bg-gray-200 mt-2 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[18px] sticky top-1 z-10 justify-between mx-3">
        <input
          type="text"
          placeholder="Search for a Poll by ID, question, or creator name"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="bg-transparent w-[100%] outline-none"
        />
      </div>

      {errorMessage ? (
            <div className='text-red-500 font-bold mb-4'>{errorMessage}</div>
          ) : loading ? (
      <SkeletonLoader /> // Display the SkeletonLoader while loading
    ) : (<>
    <><>
    {searchQuery === '' ? (
            <p className='mt-4 mb-10 text-center text-yellow-500 font-semibold'>You can search for a Poll by typing its ID, question, or Poll creator name.</p>
          ) :
          filteredPolls.length === 0 ? (
            <p className='mt-4 mb-10  text-center text-yellow-500 font-semibold'>No poll is related to your search.</p>
          ) : (
      <ul className="mt-4">
         {filteredPolls.map((poll) => (<>
        
          <li key={poll.id} className="bg-white shadow-sm border-t border-gray-300 rounded-md p-4 mb-4">
            <div className="grid grid-cols-[48px,1fr] gap-4">
              
            <div>
          <img className='h-12 w-12 rounded-full object-cover' src={poll?.userImg} alt="" />
        </div>
        <div><div>
        <div className='block sm:flex gap-1'>
          <div className='flex items-center'>
            <h1 className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black'>{poll?.createdBy}</h1>
            {poll?.isQualifiedForBadge && (<MdVerified className="text-blue-500 inline mt-1 ml-1" />) } {poll?.isQualifiedForGoldBadge && (<MdVerified className="text-yellow-500 inline mt-1 ml-1" />) }
            </div>
            <div className='flex'>
              <p className='text-gray-500'>@{poll?.tag} &nbsp;·&nbsp;</p>
              <p className='text-gray-500'>
                <Moment fromNow>{poll?.timestamp?.toDate()}</Moment>
              </p>
            </div>
            </div>

          </div>
          </div>
            </div>
            <p className="mt-4 text-md" onClick={() => router.push(`/polls/${poll?.id}`)}>
              {poll.pollQuestion}
            </p>
            {poll?.pollImage && (
              <img className="max-h-[450px] object-cover rounded-lg mt-4" src={poll?.pollImage} alt="poll" onClick={() => router.push(`/polls/${poll?.id}`)} />
            )}
            {poll?.pollVideo && (
              <video controls className="max-h-[450px] object-cover rounded-lg mt-4" onClick={() => router.push(`/polls/${poll?.id}`)}>
                <source src={poll?.pollVideo} />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Display the countdown timer */}
            {new Date() >= new Date(poll.endDate) ? (
              <div className="mt-4 text-red-600" onClick={() => router.push(`/polls/${poll?.id}`)}>
                <p className="mt-2 text-sm font-bold">Poll Time Up.</p>
                <p className="mt-2 text-sm font-semibold capitalize"> Winner: {poll.totalVotes === 0 ? "No Votes" : poll.pollOptions.reduce((prev, current) => (current.votes > prev.votes ? current : prev)).text}</p>
                <p className="mt-2 text-sm font-semibold">Total Votes: {poll.totalVotes}</p>
              </div>
            ) : (
              <div className="mt-4 flex items-center" onClick={() => router.push(`/polls/${poll?.id}`)}>
                <p className="text-sm mr-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black">Time Remaining:</p>
                <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black"> <CountdownTimer endDate={poll.endDate} /> </p>
              </div>
            )}

            
              {/* Check if the poll is private */}
              {poll.isPrivate ? (
                correctPasswordEntered ? (
              <ul className="mt-4">
              {poll.pollOptions.map((option, index) => (
                <li key={index} className="relative  justify-start mb-2">
                  {/* Background color based on the percentage value */}
                  <div className={`w-1/6 h-8 ${new Date() >= new Date(poll.endDate) ? 'bg-green-400' : 'bg-yellow-200'} rounded-tl-lg rounded-bl-lg rounded-tr-lg`} style={{ width: `${option.percentage}%` }}>
                    {/* Placeholder for the background color */}
                  </div>
                  {/* Disable voting options when the poll is closed */}
                  {new Date() >= new Date(poll.endDate) ? (
                    <span className="text-sm font-semibold absolute inset-0 flex items-center px-2 text-gray-600 justify-between border border-gray-600 rounded-xl">
                    <span className='flex items-center'> <RiRadioButtonLine className='mr-1' />  {option.text} </span> <p>({option.votes} votes, {option.percentage}%) </p>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVote(poll.id, index)}
                      className={`absolute inset-0 w-full h-8  text-sm font-semibold flex px-2 text-gray-600 items-center justify-between border border-yellow-600 rounded-xl`}
                    >
                   <span className='flex items-center'>  <RiRadioButtonLine className='mr-1' /> {option.text} </span> <p>({option.votes} votes, {option.percentage}%) </p>
                    </button>
                  )}
                </li>
              ))}
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
              {poll.pollOptions.map((option, index) => (
                <li key={index} className="relative  justify-start mb-2">
                  {/* Background color based on the percentage value */}
                  <div className={`w-1/6 h-8 ${new Date() >= new Date(poll.endDate) ? 'bg-green-400' : 'bg-yellow-200'} rounded-tl-lg rounded-bl-lg rounded-tr-lg`} style={{ width: `${option.percentage}%` }}>
                    {/* Placeholder for the background color */}
                  </div>
                  {/* Disable voting options when the poll is closed */}
                  {new Date() >= new Date(poll.endDate) ? (
                    <span className="text-sm font-semibold absolute inset-0 flex items-center px-2 text-gray-600 justify-between border border-gray-600 rounded-xl">
                      <span className='flex items-center'> <RiRadioButtonLine className='mr-1' />  {option.text} </span> <p>({option.votes} votes, {option.percentage}%)</p>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVote(poll.id, index)}
                      className={`absolute inset-0 w-full h-8  text-sm font-semibold flex px-2 text-gray-600 items-center justify-between border border-yellow-600 rounded-xl`}
                    >
                     <span className='flex items-center'> <RiRadioButtonLine className='mr-1' /> {option.text} </span> <p>({option.votes} votes, {option.percentage}%) </p>
                    </button>
                  )}
                </li>
              ))}
            </ul>)}
            

           
          </li></>
        ))}
      </ul>)}
        </>
        </>
      </>
      )}
      
    </div>
  );
};

export default Polls;
