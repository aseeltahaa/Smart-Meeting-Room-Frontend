import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import RoomForm from "../Components/RoomForm";

function RoomRegister() {
  return (
    <>
      <Header />
      <div className="room-page min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
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
