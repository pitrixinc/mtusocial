import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const ThePolls = () => {
  const [publicPolls, setPublicPolls] = useState([]);
  const [privatePolls, setPrivatePolls] = useState([]);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all polls from Firestore
    const fetchPolls = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'polls'));
        const allPolls = [];

        querySnapshot.forEach((doc) => {
          const poll = { id: doc.id, ...doc.data() };
          if (poll.isPrivate) {
            allPolls.push(poll);
          } else {
            allPolls.push(poll);
          }
        });

        // Separate polls into public and private categories
        const publicPolls = allPolls.filter((poll) => !poll.isPrivate);
        const privatePolls = allPolls.filter((poll) => poll.isPrivate);

        setPublicPolls(publicPolls);
        setPrivatePolls(privatePolls);
      } catch (error) {
        toast.error('Error fetching polls: ' + error.message);
      }
    };

    fetchPolls();
  }, []);

  const deletePoll = async (pollId) => {
    try {
      const pollDocRef = doc(db, 'polls', pollId);
      await deleteDoc(pollDocRef);

      // Remove the deleted poll from the corresponding state array
      setPublicPolls((polls) => polls.filter((poll) => poll.id !== pollId));
      setPrivatePolls((polls) => polls.filter((poll) => poll.id !== pollId));

      toast.success('Poll deleted successfully');
    } catch (error) {
      toast.error('Error deleting poll: ' + error.message);
    }
  };

  const openModal = (poll) => {
    setSelectedPoll(poll);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPoll(null);
    setIsModalOpen(false);
  };

  const toggleModal = (poll) => {
    if (selectedPoll && selectedPoll.id === poll.id) {
      closeModal(); // Close the modal if the same poll is clicked again
    } else {
      openModal(poll); // Open the modal with the selected poll
    }
  };

  return (
    <div  className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
         
         {selectedPoll && (
            
        <div
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Poll Details"
          className="fixed inset-0 flex items-center justify-center z-50 h-screen overflow-y-auto"
        >
        <div className="fixed inset-0 bg-gray-800 opacity-70 cursor-pointer"  onClick={closeModal}></div>
        <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg relative overflow-y-auto no-scrollbar h-[380px] md:h-[450px]">
          <h2 className="text-2xl font-semibold mb-2">Poll Details</h2>
          <p>Username: {selectedPoll.username}</p>
          <p>Question: {selectedPoll.pollQuestion}</p>
          {/* Add more poll details here */}
          <button onClick={closeModal}>Close</button>
        </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => setViewDetails('public')}
          className="bg-blue-500 text-white py-1 px-4 rounded-full"
        >
          Public Polls
        </button>
        <button
          onClick={() => setViewDetails('private')}
          className="bg-red-500 text-white py-1 px-4 rounded-full"
        >
          Private Polls
        </button>
      </div>

      {viewDetails === 'public' && (
        <div>
          <h2>Public Polls</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Poll ID</th>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Question</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {publicPolls.map((poll) => (
                <tr key={poll.id}>
                  <td className="border border-gray-300 px-4 py-2">{poll.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{poll.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{poll.pollQuestion}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => deletePoll(poll.id)}
                      className="bg-red-500 text-white py-1 px-4 rounded-full"
                    >
                      Delete
                    </button>
                  
                <button onClick={() => toggleModal(poll)}>View Poll Details</button>
              </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewDetails === 'private' && (
        <div>
          <h2>Private Polls</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Poll ID</th>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Question</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {privatePolls.map((poll) => (
                <tr key={poll.id}>
                  <td className="border border-gray-300 px-4 py-2">{poll.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{poll.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{poll.pollQuestion}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => deletePoll(poll.id)}
                      className="bg-red-500 text-white py-1 px-4 rounded-full"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ThePolls;
