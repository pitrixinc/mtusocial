import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const VerificationRequest = () => {
  const { data: session } = useSession();
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedVerificationRequest, setSelectedVerificationRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all verification requests from Firestore
    const fetchVerificationRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'applyVerify'));
        const requests = [];
        querySnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() });
        });
        setVerificationRequests(requests);
      } catch (error) {
        toast.error('Error fetching verification requests: ' + error.message);
      }
    };

    fetchVerificationRequests();
  }, []);

  const toggleFormData = (request) => {
    setSelectedVerificationRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar'>
      <h1>Verification Requests</h1>
      <table className="border-collapse w-full">
        <thead>
        <tr>
            <th className="border border-gray-300">ID</th>
            <th className="border border-gray-300">Username</th>
            <th className="border border-gray-300">Tag</th>
            <th className="border border-gray-300">Role</th>
            <th className="border border-gray-300">Timestamp</th>
            <th className="border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {verificationRequests.map((request) => (
            <tr key={request.id}>
              <td className="border border-gray-300">{request.id}</td>
              <td className="border border-gray-300">{request.username}</td>
              <td className="border border-gray-300">{request.tag}</td>
              <td className="border border-gray-300">{request.role}</td>
              <td className="border border-gray-300">
                {request.timestamp.toDate().toLocaleString()}
              </td>
              <td className="border border-gray-300">
                <button
                  onClick={() => toggleFormData(request)}
                  className="bg-blue-500 text-white py-1 px-4 rounded-full"
                >
                  Toggle Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-gray-800 opacity-70 cursor-pointer" onClick={closeModal}></div>
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-2">Verification Request Details</h2>
            {selectedVerificationRequest && (
              <div>
                {Object.keys(selectedVerificationRequest).map((field) => (
                  <div key={field} className="mb-2">
                    <strong className="font-semibold">{field}:</strong> {field === 'timestamp' ? selectedVerificationRequest[field].toDate().toLocaleString() : selectedVerificationRequest[field]}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequest;
