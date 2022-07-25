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

  return (
    <Context.Provider
      value={{
        dataRooms,
        isLoadingRooms,
        refetchRooms,
        // State to open the add room modal
        openNewRoomModal,
        setOpenNewRoomModal,
      }}
    >
      {children}
    </Context.Provider>
  );
};
