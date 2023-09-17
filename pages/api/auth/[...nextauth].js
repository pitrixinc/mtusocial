import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import moment from "moment";

export const authOptions = {
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Add other providers here if needed
  ],
  callbacks: {
    async session({ session, token }) {
      const allowedDomains = ["@gmail.com", "@eugogatelogistics.com"];
      const email = session.user.email;

      // Check if the user's email ends with any of the allowed domains
      const isAllowedDomain = allowedDomains.some((domain) =>
        email.endsWith(domain)
      );

      if (!isAllowedDomain) {
        // If the email domain is not allowed, sign the user out and return null
        return null;
      }

      // Continue processing for allowed domains
      session.user.tag = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();

      session.user.uid = token.sub;

      // Get the current date and format it as "Month Year"
      const currentDate = moment();
      const formattedDate = currentDate.format("MMMM YYYY"); // Example: "August 2021"

      // Check if the user's data exists in the Firestore collection
      const userDocRef = doc(db, "users", session.user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        // If the user's data doesn't exist, create a new document in the "users" collection
        try {
          const userData = {
            id: session.user.uid,
            name: session.user.name,
            email: session.user.email,
            tag: session.user.tag,
            signupDate: formattedDate, // Include the formatted date
            profileImage: session.user.image,
            isVerified: false, // Add the isVerified field with the default value
            isQualifiedForBadge,
            // Add other fields you want to store in the document
          };

          await setDoc(userDocRef, userData);
        } catch (error) {
          console.error("Error creating user document in Firestore:", error);
          return null;
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
















{/*

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { db, auth } from "../../../firebase";
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'
import moment from 'moment';

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
    }, ////////////////////////////////////////////// put a bottom comment here to hide the firebase next auth 
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.tag = session.user.name
        .split(" ")
        .join("")
        .toLocaleLowerCase();

      session.user.uid = token.sub;

      // Get the current date and format it as "Month Year"
      const currentDate = moment();
      const formattedDate = currentDate.format('MMMM YYYY'); // Example: "August 2021"

      // Check if the user's data exists in the Firestore collection
      const userDocRef = doc(db, 'users', session.user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        // If the user's data doesn't exist, create a new document in the "users" collection
        try {
          const userData = {
            id: session.user.uid,
            name: session.user.name,
            email: session.user.email,
            tag: session.user.tag,
            signupDate: formattedDate, // Include the formatted date
            profileImage: session.user.image,
            // Add other fields you want to store in the document
          };

          await setDoc(userDocRef, userData);
        } catch (error) {
          console.error('Error creating user document in Firestore:', error);
          return null
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
export default NextAuth(authOptions)

*/}