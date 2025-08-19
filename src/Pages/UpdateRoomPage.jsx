import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import UpdateRoomForm from '../Components/UpdateRoomForm';

function UpdateRoomPage() {
  return (
    <>
      <Header showGradient={false}/>
      <div className="min-h-screen flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold mb-6">Update Room</h2>
        <UpdateRoomForm />
      </div>
      <Footer />
    </>
  );
}

export default UpdateRoomPage;
