import React from "react";
import logo from "../assets/logo.png"; 
import {Link} from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center bg-black text-white h-screen px-12">
      <img src={logo} alt="Logo" className="mx-auto mb-8" style={{ maxWidth: 180 }} />
      <h1 className="text-36 sm:text-60 font-bold mb-4">404</h1>
      <p className="text-16 sm:text-20 mb-8 p-10">Oops! The page you are looking for does not exist.</p>
      <Link to={"/"}>
        <button
        className="bg-brand-teal text-white px-16 py-8 rounded-full font-bold border-none cursor-pointer transition-colors hover:bg-[#437e79]">
          Go Back Home
        </button>
      </Link>

    </div>
  );
}
