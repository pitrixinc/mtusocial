import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { AppContextProvider } from "../contexts/AppContext"
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SplashScreen from '../components/SplashScreen';
import React, { useEffect, useState } from 'react';

function MyApp({ Component, pageProps: { session, ...pageProps }, }) {

  const [isSSR, setIsSSR] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
     setIsSSR(false);
     
     // Simulate fetching data or performing other async tasks here
    // When done, set isReady to true to show the app
     setTimeout(() => {
      setIsReady(true);
    }, 3000);
  }, []);

if(isSSR) return null;

  return (
    <SessionProvider session={session}>
    {isReady ? (
      <AppContextProvider>
        <Component {...pageProps} />
        <ToastContainer
          theme="light"
          position="top-right"
          autoClose={4000}
          closeOnClick
          pauseOnHover={false}
        />
      </AppContextProvider>
    
    ) : (
      <SplashScreen />
    )}
    </SessionProvider>
  )
}

export default MyApp
