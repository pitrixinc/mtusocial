import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const VerificationRequest = () => {
  const { data: session } = useSession();
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedVerificationRequest, setSelectedVerificationRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('unchecked');

  useEffect(() => {
    const fetchVerificationRequests = async (tab) => {
      try {
        const collectionName = tab === 'unchecked' ? 'applyVerify' : 'checkedVerify';
        const querySnapshot = await getDocs(collection(db, collectionName));
        const requests = [];
        querySnapshot.forEach((doc) => {
          requests.push({ docId: doc.id, ...doc.data() });
        });
        setVerificationRequests(requests);
      } catch (error) {
        toast.error('Error fetching verification requests: ' + error.message);
      }
    };

    fetchVerificationRequests(activeTab);
  }, [activeTab]);

  const toggleFormData = (request) => {
    setSelectedVerificationRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deleteRequest = async (docId, request) => {
    try {
      const requestDocRef = doc(db, 'applyVerify', docId);
      await deleteDoc(requestDocRef);
      await addDoc(collection(db, 'checkedVerify'), request);
      toast.success('Verification request deleted successfully.');
    } catch (error) {
      toast.error('Error deleting verification request: ' + error.message);
    }
  };

  const deleteCheckedVerifyRequest = async (docId) => {
    try {
      const requestDocRef = doc(db, 'checkedVerify', docId);
      await deleteDoc(requestDocRef);
      toast.success('Checked Verify request deleted successfully.');
    } catch (error) {
      toast.error('Error deleting Checked Verify request: ' + error.message);
    }
  };

  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      <h1>Verification Requests</h1>
      <div>
        <div className="flex">
          <button
            onClick={() => setActiveTab('unchecked')}
            className={`p-2 cursor-pointer ${
              activeTab === 'unchecked' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Unchecked Verification
          </button>
          <button
            onClick={() => setActiveTab('checked')}
            className={`p-2 cursor-pointer ${
              activeTab === 'checked' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Checked Verification
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Tag</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Timestamp</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {verificationRequests.map((request) => (
                <tr key={request.docId}>
                  <td className="border border-gray-300 px-4 py-2">{request.docId}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.tag}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.role}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {request.timestamp.toDate().toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2 flex items-center gap-3">
                    <button
                      onClick={() => toggleFormData(request)}
                      className="bg-blue-500 text-white py-1 px-4 rounded-full"
                    >
                      Toggle Details
                    </button>
                    <button
                      onClick={() => activeTab === 'unchecked' ?
                         deleteRequest(request.docId, request)
                         : deleteCheckedVerifyRequest(request.docId, request)}
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
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 h-screen overflow-y-auto">
          <div className="fixed inset-0 bg-gray-800 opacity-70 cursor-pointer" onClick={closeModal}></div>
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-lg relative overflow-y-auto no-scrollbar h-[380px] md:h-[450px]">
            <h2 className="text-2xl font-semibold mb-2">Verification Request Details</h2>
            {selectedVerificationRequest && (
              <div>
                {Object.keys(selectedVerificationRequest).map((field) => (
                  <div key={field} className="mb-2">
                    <strong className="font-semibold">{field}:</strong>
                    {field === 'timestamp'
                      ? selectedVerificationRequest[field].toDate().toLocaleString()
                      : field === 'imageUpload'
                      ? (
                        <img src={selectedVerificationRequest[field]} alt="Uploaded" className="max-w-full h-auto" />
                      )
                      : field === 'userImg'
                      ? (
                        <img src={selectedVerificationRequest[field]} alt="Uploaded" className="max-w-full h-auto rounded-full" />
                      ) 
                      : field === 'verifiedBadge'
                      ? (selectedVerificationRequest[field] ? 'Yes' : 'No')
                      : selectedVerificationRequest[field]}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover-bg-gray-400 hover:text-gray-800 ml-2"
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
