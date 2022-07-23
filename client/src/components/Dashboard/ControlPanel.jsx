import React from "react";
import { useContext } from "react";
import { GlobalContext } from "../../context/GlobalState";
// import { FaRegUser } from "react-icons/fa";
import {
  RiDashboardLine,
  RiAccountBoxLine,
  RiLogoutBoxLine,
} from "react-icons/ri";

export default function ControlPanel() {
  const { logoutUser } = useContext(GlobalContext);

  const controlBars = [
    // {
    //   text: "Profile",
    //   icon: <FaRegUser className="icon" />,
    // },
    {
      text: "My Tracks",
      icon: <RiDashboardLine className="icon" />,
    },
    {
      text: "My Profile",
      icon: <RiAccountBoxLine className="icon" />,
    },
  ];
  return (
    <div className="control-panel all-center-column flex-sm-column flex-row-reverse justify-content-start">
      <div className="control-bars d-sm-block all-center-column flex-sm-column flex-row w-100">
        {controlBars.map((controlBar, index) => (
          <div
            className="control-bar text-white bold all-center justify-content-sm-start d-sm-flex d-none"
            role="button"
            key={index}
          >
            {controlBar.icon}
            <span className="mb-0 ml-3 d-lg-inline d-none">
              {controlBar.text}
            </span>
          </div>
        ))}
        <div
          style={{
            // Keep at bottom of screen
            position: "fixed",
            bottom: 0,
            display: "block",
            width: "15%",
          }}
          className="control-bar text-white bold all-center justify-content-sm-start d-sm-flex d-none"
          role="button"
          onClick={logoutUser}
        >
          <RiLogoutBoxLine className="icon" />
          <span className="mb-0 ml-4 d-lg-inline d-none">Logout</span>
        </div>
      </div>
    </div>
  );
}
