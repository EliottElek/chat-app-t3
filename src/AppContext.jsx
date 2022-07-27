import { useState, createContext } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "./utils/trpc";
import Toast from "./components/Toast";
export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const {
    data: dataRooms,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = trpc.useQuery(["room.get-rooms"]);
  const { data: session } = useSession();

  const [openNewRoomModal, setOpenNewRoomModal] = useState(false);
  const [messageToReply, setMessageToReply] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [focusInput, setFocusInput] = useState(false);
  const [toastContent, setToastContent] = useState(null);

  trpc.useSubscription(
    [
      "room.onUpdateRoom",
      {
        userId: session?.user?.id,
      },
    ],
    {
      onNext: () => {
        refetchRooms();
      },
    }
  );
  return (
    <Context.Provider
      value={{
        dataRooms,
        isLoadingRooms,
        refetchRooms,
        // State to open the add room modal
        openNewRoomModal,
        setOpenNewRoomModal,
        messageToReply,
        setMessageToReply,
        focusInput,
        setFocusInput,
        openToast,
        setOpenToast,
        toastContent,
        setToastContent,
      }}
    >
      {children}
    </Context.Provider>
  );
};
