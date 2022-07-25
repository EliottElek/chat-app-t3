import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { Message, Room } from "../../constants/schemas";
import Layout from "../../layout";
import { trpc } from "../../utils/trpc";
import MessageForm from "../../layout/MessageForm";
import SlideOver from "../../components/SlideOver";
import { Context } from "../../AppContext";
import Modal from "../../components/Modal";
import UserSelect from "../../layout/UserSelect";
import {
  CheckIcon,
  EmojiHappyIcon,
  ReplyIcon,
  DotsVerticalIcon,
} from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import Avatar from "../../components/Avatar";
function MessageItem({
  message,
  session,
  room,
  last,
}: {
  message: Message;
  session: Session;
  room: Room;
  last: boolean;
}) {
  const { setMessageToReply, setFocusInput } = useContext(Context);
  const baseStyles =
    "text-md max-w-[60%] p-2 border border-gray-200 rounded-lg shadow-sm text-gray-600 ";

  const liStyles =
    message.sender?.id === session?.user?.id
      ? baseStyles.concat("bg-green-200")
      : baseStyles.concat("self-end bg-white rounded-lg");

  const handleAnswerMessage = () => {
    setMessageToReply(message);
    setTimeout(() => setFocusInput(true), 200);
  };
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
          <span
            className={[
              "relative truncate max-w-md p-1 pl-6 translate-y-[6px] rounded-md bg-slate-300 bg-opacity-50 text-gray-500",
              message.sender?.id === session?.user?.id
                ? "-translate-x-[3rem]"
                : "translate-x-[3rem]",
            ].join(" ")}
          >
            <ReplyIcon className="left-1 top-[50%] -translate-y-1/2 absolute h-4 w-4 rotate-180 text-gray-500" />
            {message.messageToAnswer.message}
          </span>
        </div>
      )}

      <div
        className={[
          "flex gap-1 w-full relative group",
          message.sender?.id === session?.user?.id &&
            "self-end flex-row-reverse",
        ].join(" ")}
      >
        <Avatar user={message.sender} size="8" />
        <li className={liStyles}>{message.message}</li>
        <span className="text-[0.6rem] text-slate-400 self-end">
          {message.sentAt.toLocaleTimeString("en-AU", {
            timeStyle: "short",
          })}
        </span>
        {last &&
          message.sender?.id === session?.user?.id &&
          room?.readMembers.length > 1 && (
            <span className="flex -gap-4 absolute -bottom-2 right-2 text-sky-500">
              <CheckIcon className="h-4 w-4" />
              <CheckIcon className="-ml-2 h-4 w-4" />
            </span>
          )}
        <div
          className={[
            "opacity-0 p-2 py-4 flex h-7 items-center gap-3 rounded-xl  bg-white text-gray-400 group-hover:opacity-100 transition-all delay-75 self-center -mt-4",
            ,
            message.sender?.id === session?.user?.id
              ? "-mr-10"
              : "-ml-10 flex-row-reverse",
          ].join(" ")}
        >
          <button onClick={handleAnswerMessage}>
            <ReplyIcon className="h-7 w-7 rounded-full border p-1" />
          </button>
          <button>
            <EmojiHappyIcon className="h-7 w-7 rounded-full border p-1" />
          </button>
          <button>
            <DotsVerticalIcon className="h-7 w-7 rounded-full border p-1" />
          </button>
        </div>
      </div>
    </>
  );
}

function RoomPage() {
  const router = useRouter();
  const roomId = router.query.roomId as string;
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [openSlide, setOpenSlide] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { refetchRooms } = useContext(Context);
  const [openModal, setOpenModal] = useState(false);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [modifMode, setModifMode] = useState("image");
  const [selected, setSelected] = useState<any>(null);
  const { mutateAsync: readRoomMutation } = trpc.useMutation([
    "room.read-room",
  ]);
  const { data, isLoading, refetch } = trpc.useQuery([
    "room.get-room",
    {
      roomId,
    },
  ]);
  const { data: messagesData, isLoading: isLoadingMessagesData } =
    trpc.useQuery([
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
    "room.add-member-room",
  ]);
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
        setMessages((m) => {
          return [...m, message];
        });
        refetchRooms();
      },
    }
  );
  const handleChangeImage = async () => {
    if (imageUrl === "" || !data) return;
    await changeRoomImageMutation({
      roomId: data?.id,
      image: imageUrl,
    });
    setOpenModal(false);
    refetchRooms();
    refetch();
  };
  const handleChangeName = async () => {
    if (nameInput === "" || !data) return;
    await changeRoomNameMutation({
      roomId: data?.id,
      name: nameInput,
    });
    setOpenModal(false);
    refetchRooms();
    refetch();
  };
  const handleAddMember = async () => {
    if (!data || !selected) return;
    await addMemberMutation({
      roomId: data?.id,
      memberId: selected.id,
    });
    setOpenAddMemberModal(false);
    refetchRooms();
    refetch();
  };
  const NewMessageDivider = () => (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-red-400" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-2 py-0 bg-white text-sm border-red-400  border text-red-400 rounded-xl">
          New message !
        </span>
      </div>
    </div>
  );
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
        <span className="px-2 py-0 bg-white text-xs  border text-gray-400 rounded-xl">
          {date}
        </span>
      </div>
    </div>
  );
  if (!session && status !== "loading" && typeof window !== "undefined")
    signIn();
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <Layout room={data} setOpenSlide={setOpenSlide}>
      {session && (
        <div className="flex flex-col flex-1 h-full ">
          <ul className="flex flex-col p-4 flex-1 overflow-auto gap-4">
            {messages.map((m, i) => (
              <div key={m.id}>
                {messages[i - 1] &&
                  (m.sentAt - messages[i - 1].sentAt) / 6000 > 100 && (
                    <DateDivider
                      date={m.sentAt.toLocaleTimeString("en-AU", {
                        timeStyle: "short",
                      })}
                    />
                  )}
                <MessageItem
                  last={i === messages.length - 1}
                  room={data}
                  message={m}
                  session={session}
                />
              </div>
            ))}
          </ul>
          <MessageForm
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
          {data?.image ? (
            <div>
              <img
                className="h-[150px] object-cover border w-[150px] rounded-full"
                src={data.image}
                alt=""
              />
            </div>
          ) : (
            <div>
              <div className="h-[150px] border w-[150px] text-[4rem] uppercase rounded-full bg-slate-200 flex items-center gap-2 justify-center">
                {data?.name ? data?.name[0] : "?"}
              </div>
            </div>
          )}
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
                className="flex items-center bg-slate-100 w-full rounded-md p-1"
              >
                <Avatar user={member} size="6" />
                <span
                  className={classNames(
                    selected ? "font-semibold" : "font-normal",
                    "ml-3 block truncate"
                  )}
                >
                  {member.name}
                </span>
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
        onSuccess={handleAddMember}
        focusRef={inputRef}
        successBtnContent={"Add member"}
      >
        <form
          className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg"
          onSubmit={handleAddMember}
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
