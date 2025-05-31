import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-white px-6 py-10 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Home</h4>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Movies</h4>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Shows</h4>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Live Games</h4>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Connect With Us</h4>
          <div className="flex gap-3 mt-2">
            <a
              href="#"
              aria-label="Facebook"
              className="bg-[#1F1F1F] p-2 rounded text-white hover:bg-[#333]"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="bg-[#1F1F1F] p-2 rounded text-white hover:bg-[#333]"
            >
              <FaTwitter size={16} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="bg-[#1F1F1F] p-2 rounded text-white hover:bg-[#333]"
            >
              <FaLinkedinIn size={16} />
            </a>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-800 max-w-6xl mx-auto" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <span>©2025 Oasis+</span>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:underline">
            Terms of Use
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
