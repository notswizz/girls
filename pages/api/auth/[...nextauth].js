import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getMongoDBAdapter } from '../../../lib/mongodb/mongodb-adapter';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: getMongoDBAdapter(),
  callbacks: {
    async jwt({ token, account, user }) {
      // If signing in
      if (account && user) {
        // Add the user ID to the token
        token.userId = user.id;
        token.isAdmin = user.isAdmin || false;
        
        // Update user's last login
        try {
          const { db } = await connectToDatabase();
          const users = db.collection('users');
          
          await users.updateOne(
            { email: user.email },
            { $set: { lastLoginAt: new Date() } }
          );
        } catch (error) {
          console.error('Error updating user last login:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session
      if (token) {
        session.user.id = token.userId;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        const { db } = await connectToDatabase();
        const users = db.collection('users');
        
        // Check if user exists
        const existingUser = await users.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user if they don't exist
          const newUser = new User({
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified || new Date(),
            googleId: profile.sub,
            isAdmin: false,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
          
          await users.insertOne(newUser.toDatabase());
        } else {
          // Update Google ID if not present
          if (!existingUser.googleId) {
            await users.updateOne(
              { email: user.email },
              { $set: { googleId: profile.sub } }
            );
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/', // Custom sign-in page path
    error: '/', // Error page path
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions); 