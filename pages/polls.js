import { useRouter } from 'next/router';
import PollsInput from '../components/PollsInput'
import PollsFeed from '../components/PollsFeed'
import Sidebar from '../components/Sidebar';
import ProfileData from '../components/ProfileData';

const ConversationList = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <PollsFeed />
        <ProfileData />
        </div>
    </div>
  );
};

export default ConversationList;
