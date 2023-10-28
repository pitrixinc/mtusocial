import React from 'react';
import { useRouter } from 'next/router'

const EventCard = ({ event }) => {
  const router = useRouter()

  return (
    <div className="bg-white shadow-lg rounded-xl cursor-pointer mt-2 ring-offset-2 ring-4 ring-yellow-500" onClick={() => router.push(`/events/${event.eventId}`)}>
    <img
        src={event.banner || "https://t3.ftcdn.net/jpg/02/16/47/50/360_F_216475029_YEdkzXdw97bvK9OioWRwRjfPG1IQkP69.jpg"}
        alt="Event Banner"
        className="w-full h-48 object-cover rounded-t-xl"
    />
    <div className=' p-1'>
      <h3 className="text-md font-semibold text-gray-800 mb-2">{event.eventName}</h3>

      <div className="flex justify-between">
        <p className="text-sm text-gray-600">{event.creatorName}</p>
        <p className="text-sm text-gray-500 mb-2">{event.eventLocation}</p>
      </div>
      </div>
    </div>
  );
};

export default EventCard;
