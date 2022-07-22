import { Fragment, useRef, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuAlt2Icon, XIcon } from "@heroicons/react/outline";
import Modal from "../components/Modal";
import { Props } from "next/script";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Layout: React.FC<Props> = ({ title, children }) => {
  const { data: session } = useSession();
  const [roomName, setRoomName] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const { mutateAsync: createNewRoom } = trpc.useMutation([
    "room.create-new-room",
  ]);

  async function createRoom() {
    const newRoom = await createNewRoom({
      roomName,
    });
    if (newRoom) router.push(`/rooms/${newRoom.id}`);
    else alert("Could not create channel.");
  }
  const router = useRouter();
  const roomId = router.query.roomId as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading } = trpc.useQuery(["room.get-rooms"]);
  return (
    <>
      <div>
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
                <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800">
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
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                      alt="Workflow"
                    />
                  </div>
                  <div className="mt-5 flex-1 h-0 overflow-y-auto">
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <nav className="px-2 space-y-1">
                        {data?.map((item) => (
                          <Link key={item.id} href={`/rooms/${item.id}`}>
                            <a
                              className={classNames(
                                roomId === item.id
                                  ? "bg-gray-700 text-white"
                                  : "bg-transparent text-gray-300",
                                "hover:bg-gray-700 hover:text-white",
                                "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                              )}
                            >
                              {item.name}
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
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
              {/* <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                alt="Workflow"
              /> */}
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <nav className="flex-1 px-2 py-4 space-y-1 w-full">
                  <div className="flex w-full items-center justify-center">
                    <button
                      onClick={() => setOpen(true)}
                      type="button"
                      className="mt-3 flex grow flex-1 justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm"
                    >
                      New chat room
                    </button>
                  </div>
                  {data?.map((item) => (
                    <Link key={item.id} href={`/rooms/${item.id}`}>
                      <a
                        className={classNames(
                          roomId === item.id
                            ? "bg-gray-700 text-white"
                            : "bg-transparent text-gray-300",
                          "hover:bg-gray-700 hover:text-white",
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                        )}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>
        <div className="md:pl-64 flex flex-col h-screen flex-1">
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <h1 className={"h-full text-xl flex items-center"}>{title}</h1>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open user menu</span>
                      {session?.user?.image ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={session.user.image}
                          alt=""
                        />
                      ) : (
                        <span className="h-10 w-10 uppercase rounded-full bg-slate-200 flex items-center justify-center">
                          {session?.user?.name ? session?.user?.name[0] : "?"}
                        </span>
                      )}
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
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              {item.name}
                            </a>
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
        open={open}
        setOpen={setOpen}
        onSuccess={createRoom}
        focusRef={inputRef}
        successBtnContent={"Create channel"}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
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
            className="focus:ring-indigo-500 border focus:border-indigo-500 block w-full p-4 mt-4 sm:text-sm border-gray-300 rounded-md"
            placeholder="The name of the chat room..."
          />
        </div>
      </Modal>
    </>
  );
};
export default Layout;
