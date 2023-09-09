import { useRouter } from 'next/router';
import ListConversation from '../components/ListConversation';
import Sidebar from '../components/Sidebar';
import ProfileData from '../components/ProfileData';

const ConversationList = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <ListConversation />
        <ProfileData />
        </div>
    </div>
  );
};

export default ConversationList;
