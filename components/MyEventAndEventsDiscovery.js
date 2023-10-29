import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from './EventCard';
import { MdOutlineAddCircleOutline } from 'react-icons/md';

const MyEventAndEventsDiscovery = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsQuery = query(eventsCollection);

        const querySnapshot = await getDocs(eventsQuery);
        const eventList = [];

        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          const members = eventData.members || []; // Handle undefined members
          eventList.push({
            eventId: doc.id,
            creatorId: eventData.creatorId,
            creatorName: eventData.creatorName,
            eventName: eventData.eventName,
            banner: eventData.banner,
            eventLocation: eventData.eventLocation,
            eventType: eventData.eventType,
            eventDescription: eventData.eventDescription,
             members, // Add the members array
          });
        });

        setEvents(eventList);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      event.creatorName.toLowerCase().includes(query) ||
      event.eventName.toLowerCase().includes(query) ||
      event.eventLocation.toLowerCase().includes(query) ||
      event.eventType.toLowerCase().includes(query) ||
      event.eventId.toLowerCase().includes(query) ||
      event.eventDescription.toLowerCase().includes(query)
    );
  });

  const myEvents = events.filter((event) => event.creatorId === session?.user?.uid);

 // Filter and display events that the current user is a member of
 const joinedEvents = events.filter((event) => event.members.includes(session?.user?.uid));


  return (
    <div className="sm:ml-[81px] xl:ml-[340px] w-[600px] border-r px-2 border-gray-400 text-[#16181C] overflow-y-auto h-screen no-scrollbar">
      <div className='sticky top-0 z-10 bg-white font-medium text-[20px] px-4 py-2 flex justify-between shadow-md border-b border-b-gray-100'>
        <h1 className="text-xl font-semibold text-gray-800 my-2">Events</h1>
        <div onClick={() => router.push('/events/create')}>
          <MdOutlineAddCircleOutline className='text-2xl text-yellow-500 cursor-pointer my-2' />
        </div>
      </div>
      {/* Event Discovery Section */}
      <section className="my-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Event Discovery</h2>
      <div className='bg-gray-200 flex gap-2 rounded-full py-2 px-4 text-black items-center text-[20px] mx-4'>
        <input
          type="text"
          placeholder="Search for events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='bg-transparent w-[100%] outline-none'
        />
      </div>
      {searchQuery === '' ? (
        <p className='text-center font-semibold text-yellow-500'>You can search for events by typing keywords or event names.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredEvents.length === 0 && searchQuery.length > 0 ? (
            <p className="text-gray-500 mt-2">No events found for your search.</p>
          ) : (
            filteredEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))
         ) }
        </div>
      )}
    </section>

      {/* My Events Section */}
      <section className="my-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {myEvents.map((event) => (
            // Render each event card
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </section>

       {/* Joined Events Section 
       <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Joined Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {joinedEvents.length > 0 ? (
            joinedEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))
          ) : (
            <p className="text-gray-600">You haven't joined any events yet.</p>
          )}
        </div>
      </div>
      */}
    </div>
  );
};

export default MyEventAndEventsDiscovery;
