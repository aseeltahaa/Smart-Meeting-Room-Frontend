import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import RoomForm from "./RoomForm";

function RoomRegister() {
  return (
    <>
      <Header showGradient={false} />
      <div className="room-page min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold mb-6">Register Room</h2>

        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <RoomForm />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RoomRegister;
