import React from 'react';
import Image from 'next/image';
import mtuLogo from "../assets/images/mtulogo.jpg";

import { useSession } from 'next-auth/react';

const SplashScreen = () => {
    const { data: session } = useSession();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
     <div className="w-[170px] md:w-[200px]">
              <Image 
                className="cursor-pointer rounded-md"
                src={mtuLogo}
                alt="MTUSocial"
                layout="responsive"
              />
           </div>
           
           
           
     <div className="flex justify-center items-center top-100 mt-20">
            <div className="grid gap-2">
                <div className="flex items-center justify-center space-x-2 animate-pulse">
                    <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-900 rounded-full"></div>
                </div>
            </div>

        </div>
      
      {session ? ( 
            <div className="px-2 md:px-4 text-md font-bold items-center mt-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black ">
                       <span className="">💛 Welcome back {session?.user?.name.slice(0, 13)} 💛</span>
                   </div>
                   ): (
                   <div className="px-2 md:px-4 text-md font-bold items-center mt-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-black ">
                       <span className="">💎 Developed by Kennedy Addo Quaye 💎</span>
                   </div>
                   
                   )
      }
      
    </div>
  );
};

export default SplashScreen;