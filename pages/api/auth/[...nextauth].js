import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { db, auth } from "../../../firebase";

export const authOptions = {
  // Configure one or more authentication providers
   providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }),
       // Add Firebase authentication provider
   {/* {
      id: "firebase",
      name: "Firebase",
      type: {
        // You can use different types based on your Firebase authentication method
        // For example, if you want to use email/password authentication, use 'credentials'
        // See NextAuth.js documentation for more options: https://next-auth.js.org/providers/credentials
        type: "credentials",
        // You can also use other Firebase authentication methods like Google, Facebook, etc.
      },
      credentials: {
        // The name to display on the sign-in form (e.g., "Sign in with Firebase")
        name: "Firebase",
        // Add options for Firebase credentials
        firebaseAuth: async (credentials) => {
          try {
            // Authenticate the user using Firebase
            const userCredential = await auth.signInWithEmailAndPassword(
              credentials.email,
              credentials.password
            );

            // You can customize the user object based on Firebase data
            const user = {
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              // Add other properties you want to include in the user object
            };

            // Return the user object if authentication is successful
            return Promise.resolve(user);
          } catch (error) {
            // Return null if authentication fails
            return Promise.resolve(null);
          }
        },
      },
    }, */}
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.tag = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();

      session.user.uid = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
export default NextAuth(authOptions)