import React from "react";
import { AiOutlineMail } from "react-icons/ai";

const Footer = () => (
  <footer className="footer all-center text-center">
    <div className="my-lg-3 my-sm-2 my-3 all-center flex-md-row flex-column">
      <span className="mb-md-0 mb-2">
        <span className="bold">Trackify</span> &copy; All Rights Reserved
      </span>
      <a
        className="report-problem all-center m-0 mr-md-4 text-decoration-none text-dark"
        role="button"
        href="mailto:test@gmail.com"
      >
        <small className="m-0">
          <AiOutlineMail className="mr-1" /> Report Problem
        </small>
      </a>
    </div>
  </footer>
);

export default Footer;
