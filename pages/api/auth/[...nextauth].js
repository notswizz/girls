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
      // If signing in (account and user are only present on sign-in)
      if (account && user) {
        console.log(`[AUTH] Sign-in for ${user.email}, adapter user.id: ${user.id}`);
        
        // Look up the user in our users collection to get the correct MongoDB _id
        try {
          const { db } = await connectToDatabase();
          const users = db.collection('users');
          
          const dbUser = await users.findOne({ email: user.email });
          
          if (dbUser) {
            // Use the MongoDB _id from our users collection
            token.userId = dbUser._id.toString();
            token.userEmail = user.email;
            token.isAdmin = dbUser.isAdmin || false;
            console.log(`[AUTH] Found user in DB, using _id: ${token.userId}`);
            
            // Update last login
            await users.updateOne(
              { _id: dbUser._id },
              { $set: { lastLoginAt: new Date() } }
            );
          } else {
            // Fallback to adapter's user.id if user not found
            console.log(`[AUTH] User not found in DB, falling back to adapter id: ${user.id}`);
            token.userId = user.id;
            token.userEmail = user.email;
            token.isAdmin = user.isAdmin || false;
          }
        } catch (error) {
          console.error('[AUTH] Error in jwt callback:', error);
          token.userId = user.id;
          token.userEmail = user.email;
          token.isAdmin = user.isAdmin || false;
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