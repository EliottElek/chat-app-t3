import { PaperAirplaneIcon, ReplyIcon, XIcon } from "@heroicons/react/outline";
import { useContext } from "react";
import { Context } from "../AppContext";
import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { v4 as uuidv4 } from "uuid";
import dynamic from "react-dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import renderHtml from "../utils/renderHtml";
const bindings = {
  enter: {
    key: 13,
    shiftKey: null,
    handler: () => {
      document.getElementById("send-message").click();
    },
  },
};
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
          <span className="text-gray-500 p-2 flex">
            "{renderHtml(messageToReply?.message)}"
          </span>
        </div>
      </Transition.Child>
    </Transition.Root>
  );
};
const MessageForm = ({
  sendMessageMutation,
  room,
  message,
  setMessage,
  setMessages,
  messages,
  user,
}) => {
  const { messageToReply, setMessageToReply, setMessageStatus } =
    useContext(Context);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message === "<p></p>") return;
    const messageItem = {
      id: uuidv4(),
      sentAt: new Date(),
      roomId: room.id,
      message: message,
      messageToReplyId: messageToReply ? messageToReply.id : "",
    };
    sendMessageMutation(messageItem);
    if (messageToReply) {
      messageItem.messageToAnswer = messageToReply;
      messageItem.messageToAnswerId = messageToReply.id;
    }
    messageItem.sender = user;
    setMessages([...messages, messageItem]);
    setMessageToReply(null);
    setMessageStatus("sending");
    setMessage("");
  };

  return (
    <>
      <ReplyPanel />
      <div className="p-3 pt-0 flex gap-4 items-center bg-transparent">
        <form
          className="flex flex-1 bg-transparent relative"
          onSubmit={handleSubmit}
        >
          <ReactQuill
            placeholder={"Send a message at @" + room?.name}
            id="quill-editor"
            value={message}
            onChange={setMessage}
            theme={"snow"}
            modules={{
              keyboard: { bindings: bindings },
            }}
          />
          <button
            id={"send-message"}
            className="flex-1 rounded-full text-gray-500 p-3.5 absolute bottom-0 right-1"
            onClick={handleSubmit}
          >
            <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageForm;
