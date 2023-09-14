import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import JoinViewGroup from '../../components/JoinViewGroup';
import JoinViewGroupDetails from '../../components/JoinViewGroupDetails';

const Group = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <JoinViewGroup />
        <JoinViewGroupDetails />
        </div>
    </div>
  );
};

export default Group;
