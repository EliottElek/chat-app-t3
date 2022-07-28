import {
  FolderOpenIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  ReplyIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useContext, useRef, useEffect } from "react";
import { Context } from "../AppContext";
import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { v4 as uuidv4 } from "uuid";

const ReplyPanel = () => {
  const { messageToReply, setMessageToReply, setFocusInput } =
    useContext(Context);
  const open = Boolean(messageToReply);
  return (
    <Transition.Root show={open} as={Fragment}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-100"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div className="flex p-2 pt-8 border items-center bg-gray-100 bg-opacity-50 relative">
          <ReplyIcon className="h-7 w-7 absolute top-3 left-3 rotate-180 text-gray-400" />
          <button
            onClick={() => {
              setMessageToReply(null);
              setFocusInput(false);
            }}
            className="absolute top-3 right-3"
          >
            <XIcon className="h-6 w-6" />
          </button>
          <span className="text-gray-500 p-2">"{messageToReply?.message}"</span>
        </div>
      </Transition.Child>
    </Transition.Root>
  );
};
const MessageForm = ({
  onFocus,
  sendMessageMutation,
  roomId,
  message,
  setMessage,
  setMessages,
  messages,
  user,
}) => {
  const { messageToReply, setMessageToReply, focusInput, setMessageStatus } =
    useContext(Context);
  const inputReference = useRef(null);
  useEffect(() => {
    if (focusInput) inputReference.current.focus();
  }, [focusInput, inputReference]);
  return (
    <>
      <ReplyPanel />
      <div className="p-3 pt-0 flex gap-4 items-center bg-transparent">
        <button className="text-gray-500">
          <FolderOpenIcon className="h-6 w-6" />
        </button>
        <button className="text-gray-500">
          <PaperClipIcon className="h-6 w-6" />
        </button>
        <form
          className="flex flex-1 bg-transparent"
          onSubmit={(e) => {
            e.preventDefault();
            if (message === "") return;
            const messageItem = {
              id: uuidv4(),
              sentAt: new Date(),
              roomId: roomId,
              message: message,
              messageToReplyId: messageToReply ? messageToReply.id : "",
            };
            sendMessageMutation(messageItem);
            messageItem.sender = user;
            setMessages([...messages, messageItem]);
            setMessageToReply(null);
            setMessageStatus("sending");
            setMessage("");
          }}
        >
          <input
            ref={inputReference}
            onFocus={onFocus}
            className="black rounded-full p-2.5 pl-3 w-full h-auto text-gray-500 bg-gray-50 border border-gray-200 focus:outline-green-500 focus:outline-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Aa"
          />
          <button
            className="flex-1 rounded-full text-gray-500 p-3.5"
            type="submit"
          >
            <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageForm;
