import { Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { useContext, Fragment } from "react";
import { Context } from "../AppContext";
import Avatar from "./Avatar";
export default function Toast() {
  const {
    openToast,
    setOpenToast,
    toastContent,
    setMessageToReply,
    setFocusInput,
  } = useContext(Context);
  const router = useRouter();
  if (!toastContent) return null;
  // useEffect(() => {
  //   let timer;
  //   if (openToast) {
  //     timer = setTimeout(() => setOpenToast(false), 3000);
  //   }
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [openToast]);
  const handleReply = () => {
    if (!toastContent.messageToReply) return;
    setMessageToReply(toastContent.messageToReply);
    router.push(`/rooms/${toastContent.messageToReply.room.id}`);
    setFocusInput(true);
  };
  return (
    <Transition.Root
      show={openToast}
      as={Fragment}
      enter="duration-200 ease-in"
      enterFrom="opacity-0 translate-x-[100%]"
      enterTo="opacity-100 translate-x-[0%]"
      leave="duration-200 ease-out"
      leaveFrom="opacity-100 translate-x-[0%]"
      leaveTo="opacity-0 translate-x-[100%]"
    >
      <div
        className={
          "w-80 fixed top-5 right-5 z-50 bg-white shadow-lg rounded-md  text-slate-500 flex"
        }
      >
        <div className="p-2 w-[70%] flex items-center gap-2">
          <div>
            <Avatar src={toastContent?.image} />
          </div>
          <div className="truncate">
            <p className="font-semibold truncate">{toastContent?.title}</p>
            {toastContent?.content}
          </div>
        </div>
        <div className="flex flex-col flex-1 justify-between h-full border-l">
          <button
            onClick={handleReply}
            className="border-b py-2 px-4 text-white bg-green-500 rounded-tr-md"
          >
            Reply
          </button>
          <button onClick={() => setOpenToast(false)} className="py-2 px-4">
            Close
          </button>
        </div>
      </div>
    </Transition.Root>
  );
}
