import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { AppContextProvider } from "../contexts/AppContext"
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps: { session, ...pageProps }, }) {
  return (
    <SessionProvider session={session}>
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
    </SessionProvider>
  )
}

export default MyApp
