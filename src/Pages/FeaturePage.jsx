import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import FeatureForm from "../Components/FeatureForm";

function FeaturePage() {
  return (
    <>
      <Header />
      <div className="feature-page min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold mb-6">Register Room Feature</h2>

        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <FeatureForm />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FeaturePage;
