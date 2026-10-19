import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUserRole, registerUser } from "@/lib/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ user }) {
      if (!user.email) return false;
      registerUser(user.email, user.name ?? user.email);
      return true;
    },
    session({ session }) {
      const email = session.user?.email;
      if (email) session.user.role = getUserRole(email);
      return session;
    },
  },
});