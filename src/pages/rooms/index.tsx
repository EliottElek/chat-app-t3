import { signIn, useSession } from "next-auth/react";
import React from "react";
import Layout from "../../layout";

const index = () => {
  const { data: session, status } = useSession();

  if (!session && status !== "loading" && typeof window !== "undefined")
    signIn();

  return <Layout></Layout>;
};

export default index;
