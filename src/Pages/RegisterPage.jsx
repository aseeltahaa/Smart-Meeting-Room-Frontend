import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import RegisterForm from "../Components/RegisterForm";

function RegisterPage() {
  return (
    <>
      <Header />
      <div className="register-page min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold mb-6">Register</h2>

        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <RegisterForm />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RegisterPage;
