import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import UpdateRoomForm from '../Components/UpdateRoomForm';

function UpdateRoomPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold mb-6">Update Room</h2>
        <UpdateRoomForm />
      </div>
      <Footer />
    </>
  );
}

export default UpdateRoomPage;
