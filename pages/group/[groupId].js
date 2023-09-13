import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import ProfileData from '../../components/ProfileData';
import JoinViewGroup from '../../components/joinViewGroup';

const Group = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <JoinViewGroup />
        <ProfileData />
        </div>
    </div>
  );
};

export default Group;
