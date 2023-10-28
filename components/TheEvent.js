import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { AiOutlineControl } from 'react-icons/ai';

const TheEvent = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (id) {
      // Fetch event details
      const eventDocRef = doc(db, 'events', id);
      getDoc(eventDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            setEvent(docSnapshot.data());
          }
        })
        .catch((error) => {
          console.error('Error fetching event details:', error);
        });

      // Check if the user is already a member of the event
      if (session) {
        const userDocRef = doc(db, 'users', session.user.uid);
        const membersQuery = query(
          collection(db, 'events', id, 'members'),
          where('userId', '==', session.user.uid)
        );
        getDocs(membersQuery)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              setIsMember(true);
            }
          })
          .catch((error) => {
            console.error('Error checking membership:', error);
          });
      }
    }
  }, [id, session]);

  // Get the total member count
  useEffect(() => {
    if (id) {
      const membersCollectionRef = collection(db, 'events', id, 'members');
      getDocs(membersCollectionRef)
        .then((querySnapshot) => {
          setMemberCount(querySnapshot.size);
        })
        .catch((error) => {
          console.error('Error fetching member count:', error);
        });
    }
  }, [id]);

  const handleJoinEvent = async () => {
    if (!session) {
      toast.error('You need to sign in to join the event.');
      return;
    }

    if (event && id) {
      // Add the user to the event's members
      const membersCollectionRef = collection(db, 'events', id, 'members');
      await addDoc(membersCollectionRef, {
        userId: session.user.uid,
        userName: session.user.name,
        userImage: session.user.image,
      });

      // Update the local state to indicate that the user has joined
      setIsMember(true);
      toast.success("You have joined the event")
      // Update the member count
      setMemberCount(memberCount + 1);
    }
  };

  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      {event ? (
        <div>
          <div className="mt-0">
            <img
              src={event.banner || "https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"}
              className="w-full h-[190px] object-cover mt-0"
            />
          </div>
          <div className="p-3">
            <h1 className="text-xl font-bold mb-4">{event.eventName}</h1>
            <p className="mt-4 px-2 text-center">{event.eventDescription || 'No Description'}</p>
            <div className="flex items-center w-[100%] gap-4 font-semibold">
              <button disabled className="text-sm w-[50%] text-yellow-500 shadow-sm bg-gray-100 rounded-md h-[55px]">Starts: {event.startDate}</button>
              <button disabled className="text-sm w-[50%] text-red-500 shadow-sm bg-gray-100 rounded-md h-[55px]">Ends: {event.endDate}</button>
            </div>
            <div className="flex items-center w-[100%] gap-4 ">
            <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
              <p className='text-md font-semibold'>Event Type</p> <span className='font-normal text-sm'>{event.eventType}</span>
            </button>
            <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
            <p className='text-md font-semibold'>Event Location</p> <span className='font-normal text-sm'>{event.eventLocation}</span>
            </button>
            </div>
            <div className="flex items-center w-[100%] gap-4 ">
            <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
            <p className='text-md font-semibold'>Co-Hosts</p> <span className='font-normal text-sm'>{event.coHosts.join(', ')}</span>
            </button>
            <button disabled className="mt-4 w-[50%] text-gray-500 bg-gray-100 shadow-sm rounded-md p-2">
            <p className='text-md font-semibold'>Total Members</p> <span className='font-normal text-sm'>{memberCount}</span>
            </button>
            </div>
            <div className="mb-2 mt-2">
              <p className='font-semibold mb-1'>Hosted by</p>
             <div className='flex items-center gap-2'>
                <img src={event.creatorImage || "https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"} alt='' className='w-[50px] h-[50px] rounded-full' />
                <p>{event.creatorName}</p>
                {event.creatorId && (
                  <button
                    onClick={() => router.push(`/events/manage-event/${id}`)}>
                      <AiOutlineControl className='w-6 h-6'/>
                  </button>
                )}
             </div>
              {isMember ? (
                <div className='flex items-center justify-center'>
                <button disabled className="mx-3 text-white bg-gray-400 font-semibold p-3 rounded  cursor-not-allowed mt-5 mb-[60px]">
                  You have joined this event
                </button>
                </div>
              ) : (
                <div className='flex items-center justify-center'>
                <button
                  onClick={handleJoinEvent}
                  className="mx-3 text-white bg-yellow-500 font-semibold p-3 rounded mt-5 mb-[60px]"
                >
                  Join Event
                </button>
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

export default TheEvent;
