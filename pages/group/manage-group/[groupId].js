import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar';
import GroupManage from '../../../components/GroupManage';
import GroupDetails from '../../../components/GroupDetails';
import TheGroupChat from '../../../components/TheGroupChat';

const GroupChat = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <GroupManage />
        <GroupDetails />
        </div>
    </div>
  );
};

export default GroupChat;
