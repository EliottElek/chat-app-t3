import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext } from "react";
import { Context } from "../../AppContext";
import Layout from "../../layout";

const Index = () => {
  const { data: session, status } = useSession();
  const { dataRooms, setOpenNewRoomModal } = useContext(Context);
  if (!session && status !== "loading" && typeof window !== "undefined")
    signIn();
  return (
    <Layout>
      <div className="w-full h-full flex flex-col bg items-center justify-center gap-1 text-gray-600">
        <img src="/logo.png" alt="" className="w-1/5" />
        <h1 className="text-2xl">Welcome back {session?.user?.name} !</h1>
        <h3>View your rooms of create a new one.</h3>
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => setOpenNewRoomModal(true)}
            className="mt-3 rounded-md border border-gray-300 px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
          >
            New chat room
          </button>
          <Link href={dataRooms ? `/rooms/${dataRooms[0]?.id}` : `/rooms/`}>
            <button
              type="link"
              className="mt-3 justify-center rounded-md border border-gray-300 px-4 py-2 bg-green-500 font-medium text-white hover:bg-green-600 focus:outline-none sm:mt-0 sm:text-sm"
            >
              View my rooms
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
export default Index;
