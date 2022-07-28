import { Fragment, useContext, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import {
  BellIcon,
  MenuAlt2Icon,
  XIcon,
  InformationCircleIcon,
  CogIcon,
} from "@heroicons/react/outline";
import Modal from "../components/Modal";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
const userNavigation = [
  { name: "Your Profile", href: "/profile" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];
import Avatar from "../components/Avatar";
import { Context } from "../AppContext";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Layout = ({ room, children, setOpenSlide, slider }) => {
  const { data: session } = useSession();
  const [roomName, setRoomName] = useState("");
  const [emptyMessage, setEmptyMessage] = useState("");
  const {
    dataRooms,
    isLoadingRooms,
    refetchRooms,
    openNewRoomModal,
    setOpenNewRoomModal,
  } = useContext(Context);
  const { mutateAsync: readRoomMutation } = trpc.useMutation([
    "room.read-room",
  ]);
  useEffect(() => {
    if (refetchRooms) trpc.refetchRooms = refetchRooms;
  }, [refetchRooms, trpc]);
  const inputRef = useRef(null);

  const { mutateAsync: createNewRoom } = trpc.useMutation([
    "room.create-new-room",
  ]);

  const readRoom = async (roomId) => {
    await readRoomMutation({ roomId: roomId });
    refetchRooms();
  };
  async function createRoom(e) {
    e.preventDefault();
    if (roomName === "") {
      setEmptyMessage("The name cannot be empty.");
      setTimeout(() => {
        setEmptyMessage("");
      }, 3000);
      return;
    }
    const newRoom = await createNewRoom({
      roomName,
    });
    if (newRoom) router.push(`/rooms/${newRoom.id}`);
    else alert("Could not create channel.");
    refetchRooms();
    setRoomName("");
    setOpenNewRoomModal(false);
  }
  const router = useRouter();
  const roomId = router.query.roomId;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Head>
        <title>{room ? `${room.name} | Whazzup` : `Whazzup`}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-200 bg-contain">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 flex z-40">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-100">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex-shrink-0 flex items-center px-4">
                    <Link href="/rooms">
                      <a>
                        <img
                          className="h-11 w-auto brightness-95"
                          src={"/logo.png"}
                          alt="Workflow"
                        />
                      </a>
                    </Link>
                  </div>
                  <div className="mt-5 flex-1 h-0 overflow-y-auto">
                    {isLoadingRooms ? (
                      <p>Loading...</p>
                    ) : (
                      <nav className="flex-1  py-4 space-y-1 w-full">
                        <div className="flex w-full items-center justify-center sticky top-0 bg-white opacity-100 z-50 rounded-md">
                          <button
                            onClick={() => setOpenNewRoomModal(true)}
                            type="button"
                            className="mt-3 flex grow flex-1 justify-center rounded-md border border-gray-300 px-4 py-2  text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
                          >
                            New chat room
                          </button>
                        </div>
                        {dataRooms?.map((item) => (
                          <Link key={item.id} href={`/rooms/${item.id}`}>
                            <a
                              onClick={() => readRoom(item.id)}
                              className={classNames(
                                roomId === item.id
                                  ? "bg-white text-gray-700"
                                  : "bg-transparent text-gray-700",
                                "hover:bg-white hover:text-gray-700",
                                "group flex items-center justify-between px-4 py-2 text-base font-medium w-full gap-3 relative"
                              )}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Avatar user={item} size={"medium"} />
                                <span className="flex truncate flex-col max-w-full">
                                  <span
                                    className={[
                                      "truncate max-w-full",
                                      item.readMembers.findIndex(
                                        (i) => i.id === session?.user?.id
                                      ) === -1
                                        ? "font-bold"
                                        : "font-normal",
                                    ].join(" ")}
                                  >
                                    {item.name}
                                  </span>
                                  {item.messages[0] && (
                                    <span
                                      className={[
                                        "flex items-center gap-2 w-full truncate",
                                        item.readMembers.findIndex(
                                          (i) => i.id === session?.user?.id
                                        ) === -1
                                          ? "font-bold"
                                          : "font-normal text-slate-400",
                                      ].join(" ")}
                                    >
                                      <span className="text-sm truncate  max-w-full">
                                        {
                                          item.messages[0]?.sender?.name.split(
                                            "."
                                          )[0]
                                        }{" "}
                                        : {item.messages[0]?.message}
                                      </span>
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="text-xs absolute self-end	text-slate-400 font-light top-3 right-4">
                                {item?.lastModified?.toLocaleTimeString(
                                  "en-AU",
                                  {
                                    timeStyle: "short",
                                  }
                                )}
                              </span>
                            </a>
                          </Link>
                        ))}
                      </nav>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="flex-shrink-0 w-14" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-0 bg-white bg-opacity-20 backdrop-blur-lg border-r">
            <div className="flex items-center h-16 flex-shrink-0 px-4">
              <Link href="/rooms">
                <a>
                  <img
                    className="h-11 w-auto brightness-95"
                    src={"/logo.png"}
                    alt="Workflow"
                  />
                </a>
              </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              {isLoadingRooms ? (
                <p>Loading...</p>
              ) : (
                <nav className="flex-1  py-4 space-y-1 w-full">
                  <div className="flex w-full items-center justify-center sticky top-0 bg-white opacity-100 z-50 rounded-md">
                    <button
                      onClick={() => setOpenNewRoomModal(true)}
                      type="button"
                      className="mt-3 flex grow flex-1 justify-center rounded-md border border-gray-300 px-4 py-2  text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
                    >
                      New chat room
                    </button>
                  </div>
                  {dataRooms?.map((item) => (
                    <Link key={item.id} href={`/rooms/${item.id}`}>
                      <a
                        onClick={() => readRoom(item.id)}
                        className={classNames(
                          roomId === item.id
                            ? "bg-white text-gray-700"
                            : "bg-transparent text-gray-700",
                          "hover:bg-white hover:text-gray-700",
                          "group flex items-center justify-between px-4 py-2 text-base font-medium w-full gap-3 relative"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Avatar user={item} size={"medium"} />
                          <span className="flex truncate flex-col max-w-full">
                            <span
                              className={[
                                "truncate max-w-full",
                                item.readMembers.findIndex(
                                  (i) => i.id === session?.user?.id
                                ) === -1
                                  ? "font-bold"
                                  : "font-normal",
                              ].join(" ")}
                            >
                              {item.name}
                            </span>
                            {item.messages[0] && (
                              <span
                                className={[
                                  "flex items-center gap-2 w-full truncate",
                                  item.readMembers.findIndex(
                                    (i) => i.id === session?.user?.id
                                  ) === -1
                                    ? "font-bold"
                                    : "font-normal text-slate-400",
                                ].join(" ")}
                              >
                                <span className="text-sm truncate  max-w-full">
                                  {item.messages[0]?.sender?.name.split(".")[0]}{" "}
                                  : {item.messages[0]?.message}
                                </span>
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-xs absolute self-end	text-slate-400 font-light top-3 right-4">
                          {item?.lastModified?.toLocaleTimeString("en-AU", {
                            timeStyle: "short",
                          })}
                        </span>
                      </a>
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>
        <div className="md:pl-72 flex flex-col h-screen flex-1">
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 bg-white bg-opacity-20 backdrop-blur-lg border-b">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <h1
                  className={"h-full text-xl font-semibold flex items-center"}
                >
                  {room?.name}
                </h1>
                <ul className="flex ml-2 items-center pt-1 truncate max-w-full">
                  {room?.members?.map((member, i) => (
                    <li key={member.id} className="text-xs text-gray-400">
                      {member.name}
                      {i !== room.members.length - 1 && <span>,&nbsp;</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ml-4 flex items-center md:ml-6 gap-2">
                <button
                  type="button"
                  className=" p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className=" p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">View infos</span>
                  <InformationCircleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </button>
                {slider && (
                  <button
                    type="button"
                    onClick={() => setOpenSlide(true)}
                    className=" p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Open slide-over</span>
                    <CogIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}
                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative z-50">
                  <div>
                    <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open user menu</span>
                      <Avatar src={session?.user?.image} size={"medium"} />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right z-50 absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link href={item.href}>
                              <a
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                {item.name}
                              </a>
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          <main className="flex w-full flex-1 overflow-auto">{children}</main>
        </div>
      </div>
      <Modal
        open={openNewRoomModal}
        setOpen={setOpenNewRoomModal}
        onSuccess={createRoom}
        focusRef={inputRef}
        successBtnContent={"Create channel"}
      >
        <form
          className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg"
          onSubmit={createRoom}
        >
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Create a new chat room
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You are about to create a new chat room.
                </p>
                <p className="text-sm text-gray-500">
                  What name do you want to give it ?
                </p>
              </div>
            </div>
          </div>
          <input
            type="text"
            autoFocus
            ref={inputRef}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="focus:ring-green-400 border focus:border-green-400 block w-full p-4 mt-4 sm:text-sm border-gray-300 rounded-md"
            placeholder="The name of the chat room..."
          />
          {emptyMessage !== "" && (
            <span className="text-xs text-red-500 pl-1">{emptyMessage}</span>
          )}
        </form>
      </Modal>
    </>
  );
};
export default Layout;
