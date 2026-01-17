import { Link } from "react-router";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-50 flex w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 lg:border-b-0">
      <div className="flex items-center justify-between w-full px-4 py-3 lg:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle BTN */}
          <button
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="block p-1.5 border border-gray-200 rounded-sm bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:hidden"
          >
            <span className="relative block w-5.5 h-5.5 cursor-pointer">
              <span className="block absolute right-0 w-full h-full">
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "w-full! delay-300"
                  }`}
                ></span>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "delay-400 w-full!"
                  }`}
                ></span>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "w-full! delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 w-full h-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "h-0! delay-[0]!"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "h-0! delay-200!"
                  }`}
                ></span>
              </span>
            </span>
          </button>

          <Link to="/" className="block shrink-0 lg:hidden">
            <img
              src="/images/logo/logo.svg"
              alt="Logo"
              className="w-8 h-8"
            />
          </Link>
        </div>

        <div className="hidden sm:block">
          {/* Add Search Form or Breadcrumb here if needed */}
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Dark Mode Toggler */}
            <li>
              <ThemeToggleButton />
            </li>
          </ul>

          {/* User Area */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
