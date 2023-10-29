import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { collection, doc, getDoc, getDocs, query, where, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import Moment from 'react-moment'

const ManageEvent = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [eventData, setEventData] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState({});

  useEffect(() => {
    if (id) {
      // Fetch event details
      const eventDocRef = doc(db, 'events', id);
      getDoc(eventDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            setEventData(docSnapshot.data());
            setEditedEvent(docSnapshot.data());

            // Check if the current user is the creator
            if (session?.user.uid !== docSnapshot.data().creatorId) {
              toast.error('Access Denied');
              router.push(`/events/${id}`); // Redirect to home if not the creator
            }
          } else {
            toast.error('Event not found.');
            router.push('/events'); // Redirect if event not found
          }
        })
        .catch((error) => {
          console.error('Error fetching event details:', error);
        });

      // Fetch members of the event
      const membersCollectionRef = collection(db, 'events', id, 'members');
      getDocs(membersCollectionRef)
        .then((querySnapshot) => {
          const membersData = [];
          querySnapshot.forEach((doc) => {
            membersData.push({ id: doc.id, ...doc.data() });
          });
          setMembers(membersData);
          setMemberCount(membersData.length);
        })
        .catch((error) => {
          console.error('Error fetching members:', error);
        });
    }
  }, [id]);

  const handleDeleteMember = (memberId) => {
    // Prevent deleting the creator
    if (memberId === eventData.creatorId) {
      toast.error("You can't delete yourself from the event.");
      return;
    }

    // Delete the member from the subcollection
    const memberDocRef = doc(db, 'events', id, 'members', memberId);
    deleteDoc(memberDocRef)
      .then(() => {
        toast.success('Member deleted successfully.');
        // Update the local state
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId));
        setMemberCount(memberCount - 1);
      })
      .catch((error) => {
        console.error('Error deleting member:', error);
      });
  };

  const handleEditEvent = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset the edited event back to the original event data
    setEditedEvent(eventData);
  };

  const handleSaveEdit = () => {
    // Check if the user is the creator
    if (eventData.creatorId === session.user.uid) {
      const eventDocRef = doc(db, 'events', id);
      // Update the event with the edited data
      updateDoc(eventDocRef, editedEvent)
        .then(() => {
          toast.success('Event updated successfully.');
          setIsEditing(false);
        })
        .catch((error) => {
          console.error('Error updating event:', error);
          toast.error('Failed to update the event. Please try again.');
        });
    } else {
      toast.error('You are not the creator of this event.');
      router.push(`/events/${id}`);
      return  
    }
  };

  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      {eventData ? (
        <div>
          <div className="mt-0">
            <img
              src={eventData.banner || 'https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg'}
              className="w-full h-[190px] object-cover mt-0"
            />
          </div>
          <div className="p-3">
            <div className="flex justify-end mb-2">
              {session && eventData.creatorId === session.user.uid && (
                <button
                  onClick={handleEditEvent}
                  className="text-gray-500 cursor-pointer"
                >
                  <AiOutlineEdit />
                </button>
              )}
            </div>
            {isEditing ? (
              <div>
                <div className="mb-4">
                  <label className="block font-semibold">Event Name</label>
                  <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                  <input
                    type="text"
                    value={editedEvent.eventName}
                    onChange={(e) => setEditedEvent({ ...editedEvent, eventName: e.target.value })}
                    className="bg-transparent w-[100%] outline-none font-semibold"
                  />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Start Date</label>
                  <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                  <input
                    type="text"
                    value={editedEvent.startDate}
                    onChange={(e) => setEditedEvent({ ...editedEvent, startDate: e.target.value })}
                    className="bg-transparent w-[100%] outline-none font-semibold"
                  />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">End Date</label>
                  <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                  <input
                    type="text"
                    value={editedEvent.endDate}
                    onChange={(e) => setEditedEvent({ ...editedEvent, endDate: e.target.value })}
                    className="bg-transparent w-[100%] outline-none font-semibold"
                  />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Event Location</label>
                  <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                  <input
                    type="text"
                    value={editedEvent.eventLocation}
                    onChange={(e) => setEditedEvent({ ...editedEvent, eventLocation: e.target.value })}
                    className="bg-transparent w-[100%] outline-none font-semibold"
                  />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Event Description</label>
                  <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                  <textarea
                    value={editedEvent.eventDescription}
                    onChange={(e) => setEditedEvent({ ...editedEvent, eventDescription: e.target.value })}
                    className="bg-transparent w-[100%] outline-none font-semibold"
                  />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Co-Hosts (comma-separated)</label>
                  <div className="bg-gray-200 mt-1 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[15px] w-[full] mx-3">
                  <input
                    type="text"
                    value={editedEvent.coHosts.join(', ')}
                    onChange={(e) => setEditedEvent({ ...editedEvent, coHosts: e.target.value.split(',').map((s) => s.trim()) })}
                    className="bg-transparent w-[100%] outline-none font-semibold"
                  />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold mb-4">{eventData.eventName}</h1>
                <p className="mt-4 px-2 text-center">{eventData.eventDescription || 'No Description'}</p>
                <div className="flex items-center w-[100%] gap-4 font-semibold">
                  <button disabled className="text-sm w-[50%] text-yellow-500 shadow-sm bg-gray-100 rounded-md h-[55px] capitalize">Starts: <Moment fromNow>{eventData?.startDate}</Moment></button>
                  <button disabled className="text-sm w-[50%] text-red-500 shadow-sm bg-gray-100 rounded-md h-[55px] capitalize">Ends:  <Moment fromNow>{eventData?.endDate}</Moment></button>
                </div>
                <div className="flex items-center w-[100%] gap-4 ">
                  <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
                    <p className="text-md font-semibold">Event Type</p>{' '}
                    <span className="font-normal text-sm">{eventData.eventType}</span>
                  </button>
                  <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
                    <p className="text-md font-semibold">Event Location</p>{' '}
                    <span className="font-normal text-sm">{eventData.eventLocation}</span>
                  </button>
                </div>
                <div className="flex items-center w-[100%] gap-4 ">
                  <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
                    <p className="text-md font-semibold">Co-Hosts</p>{' '}
                    <span className="font-normal text-sm">{eventData.coHosts.join(', ')}</span>
                  </button>
                  <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
                    <p className="text-md font-semibold">Total Members</p>{' '}
                    <span className="font-normal text-sm">{memberCount}</span>
                  </button>
                </div>
              </div>
            )}
            <div className="mb-2 mt-2">
              <p className="font-semibold mb-1">Event Members</p>
              {members.map((member) => (
                <div key={member.id} className="flex items-center rounded-[20px] justify-between p-2 border-b border-b-gray-300">
                  <div className="flex items-center gap-2">
                    <img
                      src={member.userImage || 'https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg'}
                      alt=""
                      className="w-[50px] h-[50px] rounded-full"
                    />
                    <p>{member.userName}</p>
                  </div>
                  {member && member.userId === eventData.creatorId ? (<p className='text-yellow-500 font-semibold'>Creator</p>) : (
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-500 font-bold cursor-pointer"
                    >
                      <AiOutlineDelete />
                    </button>
                  )}
                </div>
              ))}
              <p className='text-center text-yellow-500 font-semibold my-3'>Total Members: {memberCount}</p>
            </div>
            <div className="mb-2 mt-2">
              <p className="font-semibold mb-1">Hosted by</p>
              <div className="flex items-center gap-2">
                <img
                  src={eventData.creatorImage || 'https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg'}
                  alt=""
                  className="w-[50px] h-[50px] rounded-full"
                />
                <p>{eventData.creatorName}</p>
              </div>
              {session && eventData.creatorId === session.user.uid && (
                <div className="flex items-center justify-center mt-2">
                  {isEditing ? (
                    <div className="flex items-center">
                      <button
                        onClick={handleSaveEdit}
                        className="text-white bg-green-500 font-semibold p-3 rounded mb-[60px]"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-500 bg-gray-200 font-semibold p-3 ml-2 mb-[60px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditEvent}
                      className="text-white bg-yellow-500 font-semibold p-3 rounded mb-[60px]"
                    >
                      Edit Event
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default ManageEvent;
