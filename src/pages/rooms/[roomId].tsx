import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import { Message, Room } from "../../constants/schemas";
import Layout from "../../layout";
import { trpc } from "../../utils/trpc";
import MessageForm from "../../layout/MessageForm";
import SlideOver from "../../components/SlideOver";
import { Context } from "../../AppContext";
import Modal from "../../components/Modal";
import UserSelect from "../../layout/UserSelect";
import Image from "next/image";
import {
  EmojiHappyIcon,
  ReplyIcon,
  DotsVerticalIcon,
  CheckCircleIcon as Pending,
} from "@heroicons/react/outline";
import { CheckCircleIcon as Sent } from "@heroicons/react/solid";
import { useTimeoutFn } from "react-use";
import { Dialog, Transition, Menu } from "@headlessui/react";
import MenuComp from "../../components/Menu";
import Avatar from "../../components/Avatar";
import computeReactions from "../../utils/computeReactions";
function MessageItem({
  message,
  session,
  room,
  last,
  refetchMessages,
  //Boolean to know if previous message is from the same sender
  isFollowed,
}: {
  message: Message;
  session: Session;
  room: Room;
  last: boolean;
  isFollowed: boolean;
  refetchMessages: any;
}) {
  const {
    setMessageToReply,
    setFocusInput,
    setToastContent,
    setOpenToast,
    messageStatus,
  } = useContext(Context);
  let [isShowing, setIsShowing] = useState(true);
  const [messageToReplyRef, setMessageToReplyRef] =
    useState<null | HTMLElement>(null);
  let [, , resetIsShowing] = useTimeoutFn(() => setIsShowing(true), 100);
  const { mutateAsync: reactToMessage } = trpc.useMutation([
    "message.add-reaction-message",
  ]);
  const baseStyles =
    "text-md max-w-[60%] p-2 border border-gray-200 rounded-lg shadow-sm text-gray-600 relative ";

  const reactions = [
    { label: "hearted-eyes", reaction: "😍" },
    { label: "red-heart", reaction: "❤️" },
    { label: "funny-tear-eyes", reaction: "😂" },
    { label: "star-eyes", reaction: "🤩" },
  ];
  const liStyles =
    message.sender?.id === session?.user?.id
      ? baseStyles.concat("bg-green-200")
      : baseStyles.concat("self-end bg-white rounded-lg");

  const handleAnswerMessage = () => {
    setMessageToReply(message);
    setTimeout(() => setFocusInput(true), 200);
  };
  const scrollToReply = () => {
    if (!messageToReplyRef) return;
    messageToReplyRef.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleReactToMessage = async (react: any) => {
    await reactToMessage({ messageId: message.id, reaction: react });
    // refetchMessages();
    message.reactions.push({
      messageId: message.id,
      reaction: react.reaction,
      label: react.label,
      user: session.user,
    });
    setIsShowing(false);
    resetIsShowing();
  };
  trpc.useSubscription(
    [
      "message.onMessageReact",
      {
        messageId: message.id,
      },
    ],
    {
      onNext: (reaction) => {
        if (session.user && reaction.user.id !== session.user.id) {
          setToastContent({
            title: `${reaction?.user?.name} reacted : "${reaction.reaction}"`,
            image: message?.room?.image
              ? message?.room?.image
              : reaction?.user?.image,
            content: `to :"${message.message}"`,
            messageToReply: message,
          });
          setOpenToast(true);
          setIsShowing(false);
          resetIsShowing();
        }
        refetchMessages();
      },
    }
  );
  return (
    <>
      {message.messageToAnswer && (
        <div
          className={[
            "flex w-full",
            message.sender?.id === session?.user?.id &&
              "self-end flex-row-reverse",
          ].join(" ")}
        >
          <button
            onClick={scrollToReply}
            className={[
              "relative truncate max-w-md p-1 pl-6 translate-y-[6px] rounded-md bg-slate-300 bg-opacity-50 text-gray-500",
              message.sender?.id === session?.user?.id
                ? "-translate-x-[3rem]"
                : "translate-x-[3rem]",
            ].join(" ")}
          >
            <ReplyIcon className="left-1 top-[50%] -translate-y-1/2 absolute h-4 w-4 rotate-180 text-gray-500" />
            {message.messageToAnswer.message}
          </button>
        </div>
      )}

      <div
        className={[
          "flex gap-1 w-full relative group",
          message.sender?.id === session?.user?.id &&
            "self-end flex-row-reverse",
        ].join(" ")}
      >
        <div
          className={isFollowed ? "opacity-0 h-9 w-9" : "opacity-100 h-9 w-9"}
        >
          <Avatar src={message.sender.image} size={"semi-small"} />
        </div>
        <li className={liStyles}>
          {message.message}
          {message?.reactions?.length !== 0 && (
            <Menu as="div" className="">
              <Menu.Button
                className={[
                  "cursor-pointer absolute z-[1]  px-1 gap-1 items-center bg-opacity-40 bg-gray-400 rounded-full",
                  message.sender?.id === session?.user?.id
                    ? "right-0"
                    : "left-0",
                ].join(" ")}
              >
                <span className="flex gap-2">
                  {computeReactions(message)?.map(
                    (
                      react: {
                        reaction: string;
                        label: string;
                        reactors: [{ name: string }];
                      },
                      i
                    ) => (
                      <Transition
                        key={i}
                        as={Fragment}
                        show={isShowing}
                        enter="transform transition duration-[400ms]"
                        enterFrom="opacity-0 rotate-[-120deg] scale-[3.7]"
                        enterTo="opacity-100 rotate-0 scale-100"
                        leave="transform duration-200 transition ease-in-out"
                        leaveFrom="opacity-100 rotate-0 scale-100 "
                        leaveTo="opacity-0 scale-95 "
                      >
                        <span className="text-gray-500 flex ">
                          {/* {react.reactors.length > 1 && react.reactors.length} */}
                          {react.reaction}
                        </span>
                      </Transition>
                    )
                  )}
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="z-50 p-2 absolute flex flex-col gap-2 -left-1/2 top-8 divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {computeReactions(message)?.map(
                    (
                      react: {
                        reaction: string;
                        label: string;
                        reactors: [{ name: string }];
                      },
                      i
                    ) => (
                      <Menu.Item key={i}>
                        <p className="cursor-default">
                          {react.reaction}:
                          <span className="truncate">
                            {react.reactors
                              .map((reactor) => reactor.name)
                              .join(", ")}
                          </span>
                        </p>
                      </Menu.Item>
                    )
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </li>
        <span className="text-[0.6rem] text-slate-400 self-end">
          {message?.sentAt?.toLocaleTimeString("en-AU", {
            timeStyle: "short",
          })}
        </span>
        <div
          className={[
            "opacity-0 p-1  flex items-center gap-3 rounded-full  bg-gray-100 text-gray-400 group-hover:opacity-100 transition-all delay-75 self-center -mt-4",
            ,
            message.sender?.id === session?.user?.id
              ? "-mr-10"
              : "-ml-10 flex-row-reverse",
          ].join(" ")}
        >
          <button onClick={handleAnswerMessage}>
            <ReplyIcon className="h-7 w-7 rounded-full border p-1" />
          </button>
          <MenuComp
            defaultItem={
              <div>
                <EmojiHappyIcon className="h-7 w-7 rounded-full border p-1" />
              </div>
            }
          >
            {reactions.map((react, i) => (
              <button
                key={i}
                onClick={() => handleReactToMessage(react)}
                className="h10 w-10 text-2xl p-0 m-0"
              >
                {react.reaction}
              </button>
            ))}
          </MenuComp>
          <button>
            <DotsVerticalIcon className="h-7 w-7 rounded-full border p-1" />
          </button>
        </div>
        {last && message.sender?.id === session?.user?.id && (
          <span className="absolute -bottom-2 right-6">
            {messageStatus === "sent" && (
              <Sent className="h-4 w-4 text-blue-500" />
            )}
            {messageStatus === "sending" && (
              <Pending className="h-4 w-4 text-blue-500" />
            )}
            {messageStatus === "seen" && (
              <span className="flex translate-y-2">
                {room?.readMembers
                  .filter((reader: any) => reader.id !== session?.user?.id)
                  .map((reader: any) => (
                    <Avatar key={reader.id} src={reader.image} size={"small"} />
                  ))}
              </span>
            )}
          </span>
        )}
      </div>
    </>
  );
}

function RoomPage() {
  const router = useRouter();
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const roomId = router.query.roomId as string;
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [openSlide, setOpenSlide] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { refetchRooms, setOpenToast, setToastContent, setMessageStatus } =
    useContext(Context);
  const [openModal, setOpenModal] = useState(false);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [modifMode, setModifMode] = useState("image");
  const [selected, setSelected] = useState<any[]>([]);
  const { mutateAsync: readRoomMutation } = trpc.useMutation([
    "room.read-room",
  ]);
  const { data, isLoading, refetch } = trpc.useQuery([
    "room.get-room",
    {
      roomId,
    },
  ]);
  const {
    data: messagesData,
    isLoading: isLoadingMessagesData,
    refetch: refetchMessages,
  } = trpc.useQuery([
    "room.get-messages",
    {
      roomId,
    },
  ]);
  useEffect(() => {
    if (data) {
      setImageUrl(data?.image || "");
      setNameInput(data?.name || "");
    }
  }, [data, setNameInput, setImageUrl, data?.image, data?.name]);
  useEffect(() => {
    if (data && data?.readMembers?.length > 1) {
      setMessageStatus("seen");
    }
  }, [data, data?.readMembers]);
  useEffect(() => {
    if (messagesData && !isLoadingMessagesData) {
      setMessages(messagesData);
    }
  }, [setMessages, messagesData, isLoadingMessagesData]);

  if (!isLoading && !data && typeof window !== "undefined") router.push("/404");
  const { mutateAsync: sendMessageMutation } = trpc.useMutation([
    "room.send-message",
  ]);
  const { mutateAsync: changeRoomImageMutation } = trpc.useMutation([
    "room.change-image-room",
  ]);
  const { mutateAsync: changeRoomNameMutation } = trpc.useMutation([
    "room.change-name-room",
  ]);
  const { mutateAsync: addMemberMutation } = trpc.useMutation([
    "room.add-members-room",
  ]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const readRoom = async () => {
    await readRoomMutation({ roomId: roomId });
    refetchRooms();
  };
  trpc.useSubscription(
    [
      "room.onSendMessage",
      {
        roomId,
      },
    ],
    {
      onNext: (message) => {
        if (session?.user && message.sender.id !== session?.user.id) {
          setMessages((m) => {
            return [...m, message];
          });
          setToastContent({
            title: message?.room?.name,
            image: message?.room?.image
              ? message?.room?.image
              : message?.sender?.image,
            content: `${message?.sender?.name}: "${message?.message}"`,
            messageToReply: message,
          });
          setOpenToast(true);
        } else {
          setMessageStatus("sent");
        }
        refetchRooms();
      },
    }
  );
  trpc.useSubscription(
    [
      "room.onReadRoom",
      {
        roomId,
      },
    ],
    {
      onNext: (room) => {
        if (room.readMembers.length > 1) setMessageStatus("seen");
        refetchRooms();
      },
    }
  );
  const handleChangeImage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (imageUrl === "" || !data) return;
    await changeRoomImageMutation({
      roomId: data?.id,
      image: imageUrl,
    });
    setOpenModal(false);
    refetchRooms();
    refetch();
  };
  const handleChangeName = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (nameInput === "" || !data) return;
    await changeRoomNameMutation({
      roomId: data?.id,
      name: nameInput,
    });
    setOpenModal(false);
    refetchRooms();
    refetch();
  };
  const handleAddMembers = async () => {
    if (!data || !selected || selected.length === 0) return;
    await addMemberMutation({
      roomId: data?.id,
      memberIds: selected?.map((sel) => sel.id),
    });
    console.log(selected);
    setOpenAddMemberModal(false);
    refetchRooms();
    refetch();
  };
  interface Props {
    date?: String;
  }
  const inputRef = useRef(null);
  const DateDivider = ({ date }: Props) => (
    <div className="relative mb-2">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-2 py-0 bg-gray-200 text-xs  border text-gray-400 rounded-xl">
          {date}
        </span>
      </div>
    </div>
  );
  if (!session && status !== "loading" && typeof window !== "undefined")
    signIn();
  return (
    <Layout room={data} setOpenSlide={setOpenSlide} slider>
      {session && (
        <div className="flex flex-col flex-1 h-full ">
          <ul className="flex flex-col p-4 flex-1 overflow-auto gap-2">
            {messages.map((m, i) => (
              <div key={m.id} id={`#${m.id}`}>
                {messages[i - 1] &&
                  (m.sentAt - messages[i - 1].sentAt) / 6000 > 100 && (
                    <DateDivider
                      date={m.sentAt.toLocaleTimeString("en-AU", {
                        timeStyle: "short",
                      })}
                    />
                  )}
                <MessageItem
                  key={m.id}
                  refetchMessages={refetchMessages}
                  isFollowed={messages[i - 1]?.sender?.id === m.sender.id}
                  last={i === messages.length - 1}
                  room={data}
                  message={m}
                  session={session}
                />
              </div>
            ))}
            <div ref={bottomRef} />
          </ul>
          <MessageForm
            user={session.user}
            messages={messages}
            setMessages={setMessages}
            onFocus={readRoom}
            sendMessageMutation={sendMessageMutation}
            roomId={roomId}
            message={message}
            setMessage={setMessage}
          />
        </div>
      )}
      <SlideOver open={openSlide} setOpen={setOpenSlide}>
        <div className="flex flex-col items-center gap-1">
          <Avatar src={data?.image} size="large" />
          <h1 className="text-2xl mb-4">{data?.name}</h1>
          <button
            onClick={() => {
              setOpenModal(true);
              setModifMode("image");
            }}
            type="button"
            className="mt-3 flex w-full grow flex-1 justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
          >
            {data?.image ? "Change room picture" : "Add a room image"}
          </button>
          <button
            onClick={() => {
              setOpenModal(true);
              setModifMode("name");
            }}
            type="button"
            className="mt-3 w-full flex grow flex-1 justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
          >
            Change room name
          </button>
          <button
            onClick={() => {
              setOpenAddMemberModal(true);
            }}
            type="button"
            className="mt-3 w-full flex grow flex-1 justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
          >
            Add a new member
          </button>
          <h3 className="text-left w-full mt-3">Members</h3>
          <div className="w-full flex flex-col gap-1">
            {data?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 border w-full rounded-md p-1"
              >
                <Avatar src={member.image} size={"medium"} />
                <span>{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </SlideOver>
      <Modal
        open={openModal}
        setOpen={setOpenModal}
        onSuccess={modifMode === "image" ? handleChangeImage : handleChangeName}
        focusRef={inputRef}
        successBtnContent={"Go"}
      >
        <form
          className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg"
          onSubmit={
            modifMode === "image" ? handleChangeImage : handleChangeName
          }
        >
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                {modifMode === "image"
                  ? "Change room image"
                  : "Change room name"}
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You are about to{" "}
                  {modifMode === "image"
                    ? "change the room picture."
                    : "change the room name."}
                </p>
                <p className="text-sm text-gray-500">
                  {modifMode === "image"
                    ? "Enter the url of the image below."
                    : "Enter the new name below."}
                </p>
              </div>
            </div>
          </div>
          <input
            type="text"
            autoFocus
            ref={inputRef}
            value={modifMode === "image" ? imageUrl : nameInput}
            onChange={
              modifMode === "image"
                ? (e) => setImageUrl(e.target.value)
                : (e) => setNameInput(e.target.value)
            }
            className="focus:ring-indigo-500 border focus:border-indigo-500 block w-full p-4 mt-4 sm:text-sm border-gray-300 rounded-md"
            placeholder={
              modifMode === "image" ? "New image url..." : "New name..."
            }
          />
        </form>
      </Modal>
      <Modal
        open={openAddMemberModal}
        setOpen={setOpenAddMemberModal}
        onSuccess={handleAddMembers}
        focusRef={inputRef}
        successBtnContent={"Add member"}
      >
        <form
          className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg"
          onSubmit={handleAddMembers}
        >
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Add a new member
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You are about to add a new member
                </p>
                <p className="text-sm text-gray-500">Select the new member</p>
              </div>
            </div>
          </div>
          <UserSelect selected={selected} setSelected={setSelected} />
        </form>
      </Modal>
    </Layout>
  );
}
export default RoomPage;
