import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.jsx";
import { Container } from "./Container.jsx";
import { useStore } from "../utils/stores.js";
import { useEffect } from "react";
import { Signout } from "../utils/Signout.js";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { setUser } = useStore();
  const data = localStorage.getItem("user");
  const user = JSON.parse(data);
  const navigate = useNavigate();

  const navItems = [
    {
      name: "لوحة التحكم",
      href: "#",
      current: true,
    },
    {
      name: "المستخدمين",
      href: "/team",
      current: true,
    },
    {
      name: "التقارير",
      href: "#",
      current: true,
    },
    {
      name: "الاعدادات",
      href: "#",
      current: true,
    },
  ];

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <Disclosure as="nav" className="bg-white shadow">
      <Container>
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <Link to="/home">
                <Logo className="w-[80px] h-[80px]" color="rgb(55 48 163)" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:gap-1 sm:mr-6 sm:flex ">
              {navItems
                .filter((item) => item.current === true)
                .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center justify-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-indigo-800 hover:text-gray-700"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
          <div className="hidden sm:mr-6 sm:flex sm:items-center">
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:ring-offset-2"
            >
              <span className="absolute -inset-1.5" />
              <BellIcon aria-hidden="true" className="size-6" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative mr-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:ring-offset-2">
                  <div className="relative flex items-center gap-2">
                    <span className="absolute -inset-1.5" />
                    <span>{user?.name || "User"}</span>
                    <img
                      alt=""
                      src={user?.image || "https://i.pravatar.cc/150"}
                      className="size-8 rounded-full"
                    />
                  </div>
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute left-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-md shadow-[#3730A3] ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                  >
                    تغيير كلمة المرور
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    onClick={() => Signout({ setUser, navigate })}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none cursor-pointer"
                  >
                    تسجيل الخروج
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-indigo-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-800">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
        </div>
      </Container>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {/* Current: "bg-indigo-50 border-indigo-800 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
          {navItems
            .filter((item) => item.current === true)
            .map((item, index) => (
              <DisclosureButton
                key={index}
                as="a"
                href="#"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-gray-700"
              >
                {item.name}
              </DisclosureButton>
            ))}
        </div>
        <div className="border-t border-gray-200 pb-3 pt-4">
          <div className="flex items-center px-4">
            <div className="shrink-0">
              <img
                alt=""
                src={user?.image || ""}
                className="size-10 rounded-full"
              />
            </div>
            <div className="mr-3">
              <div className="text-base font-medium text-gray-800">
                {user?.name || ""}
              </div>
            </div>
            <button
              type="button"
              className="relative mr-auto shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:ring-offset-2"
            >
              <span className="absolute -inset-1.5" />
              <BellIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-3 space-y-1">
            <DisclosureButton
              as="a"
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-indigo-100 hover:text-gray-800"
            >
              Your Profile
            </DisclosureButton>
            <DisclosureButton
              as="a"
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-indigo-100 hover:text-gray-800"
            >
              Settings
            </DisclosureButton>
            <DisclosureButton
              as="a"
              onClick={() => Signout({ setUser, navigate })}
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-indigo-100 hover:text-gray-800"
            >
              Sign out
            </DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
