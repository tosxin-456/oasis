import React from "react";
import background_image from "../assets/backgrounds/footer_image.png";

function Publication() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center text-white py-16 px-6 mx-4 my-12 rounded-md bg-cover bg-center"
      style={{ backgroundImage: `url(${background_image})` }}
    >
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="md:text-left text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Become a part of our community
          </h1>
          <p className="mb-6 text-lg max-w-md">
            We’re the ones who truly get movies—because we’re obsessed with
            them. Join the Oasis Plus family.
          </p>
        </div>
        <button className="bg-[#21A9A9] hover:bg-[#1a8686] text-white font-semibold py-2.5 px-6 rounded transition duration-300">
          Join Whatsapp Community
        </button>
      </div>
    </div>
  );
}

export default Publication;
