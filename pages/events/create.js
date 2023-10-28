import { useRouter } from 'next/router';
import TheCreateEvent from '../../components/TheCreateEvent';
import Sidebar from '../../components/Sidebar';
import VerifiedUsersList from '../../components/VerifiedUsersList'

const Create = () => {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL

  return (
    <div className='relative max-w-[1400px] mx-auto'>
        <Sidebar />
        <div className='flex gap-6'>
        <TheCreateEvent />
        <VerifiedUsersList />
        </div>
    </div>
  );
};

export default Create;
