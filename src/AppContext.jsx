import { useState, createContext } from "react";
import { trpc } from "./utils/trpc";
export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const {
    data: dataRooms,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = trpc.useQuery(["room.get-rooms"]);
  const [openNewRoomModal, setOpenNewRoomModal] = useState(false);
  const [messageToReply, setMessageToReply] = useState(null);
  const [focusInput, setFocusInput] = useState(false);

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
      }}
    >
      {children}
    </Context.Provider>
  );
};
