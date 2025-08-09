import React from "react";
import Logo from "../assets/logo.png";

function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-300 py-16">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-start gap-10">
        {/* Logo */}
        <div className="flex justify-center md:justify-start">
          <img src={Logo} alt="Logo" className="h-16 w-auto" />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-white mb-2">SOCIALS</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-white">Email</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">SUPPORT</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-white">Forum</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">TRANSPARENCY</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">LEGAL</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-700 mt-12 mb-6" />

      {/* Bottom Text */}
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-gray-500 text-xs leading-relaxed">
          Providing the lift to your development space<br />
          © 2025 Smart Space. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
export default Footer;