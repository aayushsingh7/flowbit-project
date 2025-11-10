"use client";

import VannaEmbedded from "@/layouts/VannaEmbedded";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { BiExpandVertical } from "react-icons/bi";
import { IoMdMore } from "react-icons/io";

interface LayoutProps {
  children: ReactNode;
}

const dashboardOptions = [
  { name: "Dashboard", path: "/dashboard", icon: "/home.png", disabled: false },
  {
    name: "Invoice",
    path: "/dashboard/invoices",
    icon: "/bill.png",
    disabled: false,
  },
  {
    name: "Other files",
    path: "/dashboard/other-files",
    icon: "/user.png",
    disabled: true,
  },
  {
    name: "Departments",
    path: "/dashboard/departments",
    icon: "/department.png",
    disabled: true,
  },
  {
    name: "Users",
    path: "/dashboard/users",
    icon: "/user.png",
    disabled: true,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: "/setting.png",
    disabled: true,
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentPath = usePathname();

  return (
    <>
      <VannaEmbedded />
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0  border-r border-gray-300"
        aria-label="Sidebar"
      >
        <div className="h-full overflow-y-auto">
          <div className="p-3 border-b border-gray-300 flex items-center ">
            <img
              src="https://img.freepik.com/premium-photo/abstract-purple-bird-logo-design_1060494-78199.jpg?semt=ais_hybrid&w=740&q=80"
              alt=""
              className="w-[45px] h-[45px] rounded"
            />
            <div className="ml-[15px]">
              <h3 className="font-bold">Buchhaltung</h3>
              <p className="text-gray-500 text-sm">12 members</p>
            </div>

            <BiExpandVertical className="text-[20px] ml-[35px] cursor-pointer" />
          </div>
          <div className="p-3 flex flex-col justify-between h-[90%]">
            <div className="flex-1 h-[100%]">
              <span className="mt-[10px] text-xs mb-[10px] block font-bold tracking-wide">
                GENERAL
              </span>
              <ul className="font-medium">
                {dashboardOptions.map(({ name, path, icon, disabled }) => (
                  <li key={path}>
                    {!disabled ? (
                      <Link
                        href={path}
                        className={`flex items-center p-[15px] rounded-lg group ${
                          currentPath === path
                            ? "bg-gray-200 text-blue-900 font-bold"
                            : "text-gray-500 hover:bg-gray-100 "
                        }`}
                      >
                        <img
                          src={icon}
                          alt={`${name} icon`}
                          className="w-5 h-5"
                        />
                        <span className="ms-3 text-md">{name}</span>
                        {name.startsWith("Chat") && (
                          <span className="text-center text-xs bg-blue-500 text-white px-[10px] py-[3px] rounded-[5px] ml-[10px]">
                            NEW
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div
                        className={`flex items-center p-[15px] rounded-lg group cursor-pointer text-gray-500 hover:bg-gray-100`}
                      >
                        <img
                          src={icon}
                          alt={`${name} icon`}
                          className="w-5 h-5"
                        />
                        <span className="ms-3 text-md">{name}</span>
                        {name.startsWith("Chat") && (
                          <span className="text-center text-xs bg-blue-500 text-white px-[10px] py-[3px] rounded-[5px] ml-[10px]">
                            NEW
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center p-[15px]">
              <img src="logo.png" alt="logo" className="w-[25px] h-[25px] mr-[10px]"/>
              <h3 className="font-bold text-xl">Flowbit AI</h3>
            </div>
          </div>
        </div>
      </aside>

      <div className="sm:ml-64">
        <header className="p-3 px-6 border-b border-gray-300 flex items-center justify-between">
          <h3 className="font-bold">Dashboard</h3>
          <div className="flex items-center ">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLA994hpL3PMmq0scCuWOu0LGsjef49dyXVg&s"
              alt=""
              className="w-[45px] h-[45px] rounded-[50%] object-cover"
            />
            <div className="ml-[15px]">
              <h3 className="font-bold">Amit Jadhav</h3>
              <p className="text-gray-500 text-sm">Admin</p>
            </div>
            <IoMdMore className="text-[25px] ml-[20px] cursor-pointer" />
          </div>
        </header>

        <main className="p-5">{children}</main>
      </div>
    </>
  );
};

export default Layout;
