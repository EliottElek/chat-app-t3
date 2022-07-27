import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import Layout from "../layout";
import { Dialog, Tab } from "@headlessui/react";
import Modal from "../components/Modal";
import Image from "next/image";
import { trpc } from "../utils/trpc";
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
const ProfileTabs = ({ user, session }: any) => {
  return (
    <div className="w-full sm:px-0">
      <Tab.Group>
        <Tab.List className="flex space-x-1  bg-gray-200  rounded-tl-lg  rounded-tr-lg">
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-tl-lg  py-2.5 text-sm font-medium leading-5",
                selected
                  ? "bg-white"
                  : "border-b text-slate-400 hover:bg-white/[0.12] hover:text-slate-500"
              )
            }
          >
            Profile
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full  py-2.5 text-sm font-medium leading-5",
                selected
                  ? "bg-white"
                  : "border-b text-slate-400 hover:bg-white/[0.12] hover:text-slate-500"
              )
            }
          >
            Settings
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full  py-2.5 rounded-tr-lg text-sm font-medium leading-5",
                selected
                  ? "bg-white"
                  : "border-b text-slate-400 hover:bg-white/[0.12] hover:text-slate-500"
              )
            }
          >
            Contacts
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <ProfileTab user={user} session={session} />
          <Tab.Panel
            className={classNames("rounded-lg bg-white p-3", "ring-white")}
          >
            content 2
          </Tab.Panel>
          <Tab.Panel
            className={classNames("rounded-lg bg-white p-3", "ring-white")}
          >
            content 3
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
const ProfileTab = ({ user, session }: any) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const inputRef = useRef(null);
  const { mutateAsync: updateInfos } = trpc.useMutation(["user.update-infos"]);

  const handleSaveChanges = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (name === user.name && email === user.email && image === user.image)
      return;
    const res = await updateInfos({
      id: user.id,
      name: name,
      email: email,
      image: image,
    });
    setOpen(false);
    session.user.name = name;
    session.user.email = email;
    session.user.image = image;
  };

  useEffect(() => {
    if (user) {
      setName(user?.name);
      setEmail(user?.email);
      setImage(user?.image || "");
    }
  }, [setName, setEmail, setImage, user, user?.name, user?.email, user?.image]);
  return (
    <Tab.Panel className={classNames("rounded-lg bg-white p-3", "ring-white")}>
      <div className="p-4 flex gap-4 flex-1">
        <div>
          {user?.image ? (
            <div className="border rounded-full object-cover">
              <Image
                height="140"
                width="140"
                className={`rounded-full`}
                src={user?.image}
                alt=""
              />
            </div>
          ) : (
            <div className="h-32 w-32">
              <div
                className={`h-32 w-32 uppercase text-4xl rounded-full bg-slate-200 flex items-center gap-2 justify-center border`}
              >
                {user?.name ? user?.name[0] : "?"}
              </div>
            </div>
          )}
        </div>
        <div className="ml-4">
          <h1 className="text-2xl">{user?.name}</h1>
          <h4 className="text-md text-slate-400">{user?.email}</h4>
          <div className="mt-4">
            <button
              onClick={() => setOpen(true)}
              className="flex grow flex-1 justify-center rounded-md border border-gray-300 px-4 py-1  text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:text-sm"
            >
              Modify infos
            </button>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        setOpen={setOpen}
        onSuccess={handleSaveChanges}
        focusRef={inputRef}
        successBtnContent={"Update infos"}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Update your infos
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You are about to update your infos.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              ref={inputRef}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus:ring-green-400 border focus:border-green-400 block w-full p-2 mb-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Your name..."
            />
          </div>
          <div className="mt-4">
            <label htmlFor="name">Email</label>
            <input
              type="text"
              name="name"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-green-400 border focus:border-green-400 block w-full p-2 mb-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Your email..."
            />
          </div>
          <div className="mt-4">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              autoFocus
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="focus:ring-green-400 border focus:border-green-400 block w-full p-2 mb-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Url of your image..."
            />
          </div>
        </div>
      </Modal>
    </Tab.Panel>
  );
};
const Profile = () => {
  const { data: session, status } = useSession();

  return (
    <Layout room={null} setOpenSlide={undefined} slider={false}>
      <div className="h-[80%] w-[80%] rounded-lg bg-white m-auto shadow-sm border">
        <ProfileTabs user={session?.user} session={session} />
      </div>
    </Layout>
  );
};

export default Profile;
