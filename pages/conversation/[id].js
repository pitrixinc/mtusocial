import { useRouter } from 'next/router';
import Chat from '../../components/Chat';
import Sidebar from '../../components/Sidebar';
import ChatDetails from '../../components/ChatDetails';

const ConversationPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <Chat userId={id} />
        <ChatDetails />
        </div>
    </div>
  );
};

export default ConversationPage;
