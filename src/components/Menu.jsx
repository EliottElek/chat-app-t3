import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function MenuComp({ defaultItem, children }) {
  return (
    <Menu as="div" className="relative flex items-center">
      <div>
        <Menu.Button className="flex items-center">{defaultItem}</Menu.Button>
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
        <Menu.Items className="z-50 absolute -left-1/2 top-8 flex items-center divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {children &&
            children?.map((child, i) => <Menu.Item key={i}>{child}</Menu.Item>)}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
