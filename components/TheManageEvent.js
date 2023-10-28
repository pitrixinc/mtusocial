import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { collection, doc, getDoc, getDocs, query, where, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

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
    }
  };

  if (!eventData.creatorId) {
    toast.error("Access denied");
    router.push(`/events/${id}`);
    return;
  }


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
                  <input
                    type="text"
                    value={editedEvent.eventName}
                    onChange={(e) => setEditedEvent({ ...editedEvent, eventName: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Start Date</label>
                  <input
                    type="text"
                    value={editedEvent.startDate}
                    onChange={(e) => setEditedEvent({ ...editedEvent, startDate: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">End Date</label>
                  <input
                    type="text"
                    value={editedEvent.endDate}
                    onChange={(e) => setEditedEvent({ ...editedEvent, endDate: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Event Location</label>
                  <input
                    type="text"
                    value={editedEvent.eventLocation}
                    onChange={(e) => setEditedEvent({ ...editedEvent, eventLocation: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Event Description</label>
                  <textarea
                    value={editedEvent.eventDescription}
                    onChange={(e) => setEditedEvent({ ...editedEvent, eventDescription: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold">Co-Hosts (comma-separated)</label>
                  <input
                    type="text"
                    value={editedEvent.coHosts.join(', ')}
                    onChange={(e) => setEditedEvent({ ...editedEvent, coHosts: e.target.value.split(',').map((s) => s.trim()) })}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold mb-4">{eventData.eventName}</h1>
                <p className="mt-4 px-2 text-center">{eventData.eventDescription || 'No Description'}</p>
                <div className="flex items-center w-[100%] gap-4 font-semibold">
                  <button disabled className="text-sm w-[50%] text-yellow-500 shadow-sm bg-gray-100 rounded-md h-[55px]">
                    Starts: {eventData.startDate}
                  </button>
                  <button disabled className="text-sm w-[50%] text-red-500 shadow-sm bg-gray-100 rounded-md h-[55px]">
                    Ends: {eventData.endDate}
                  </button>
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
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={member.userImage || 'https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg'}
                      alt=""
                      className="w-[50px] h-[50px] rounded-full"
                    />
                    <p>{member.userName}</p>
                  </div>
                  {session && eventData.creatorId === session.user.uid ? (<p className='text-yellow-500 font-semibold'>Creator</p>) : (
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-500 cursor-pointer"
                    >
                      <AiOutlineDelete />
                    </button>
                  )}
                </div>
              ))}
              <p>Total Members: {memberCount}</p>
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
                        className="text-white bg-green-500 font-semibold p-3 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-500 font-semibold p-3 ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditEvent}
                      className="text-white bg-yellow-500 font-semibold p-3 rounded"
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
