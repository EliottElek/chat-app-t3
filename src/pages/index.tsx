import { signIn, useSession } from "next-auth/react";

const Home = () => {
  const { data: session, status } = useSession();
  if (!session && status !== "loading" && typeof window !== "undefined")
    signIn();
};

export default Home;
