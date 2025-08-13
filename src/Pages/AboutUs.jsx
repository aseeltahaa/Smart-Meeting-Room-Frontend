import React from "react";
import SplitText from "../Components/SplitText";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import bgImage from "../assets/AboutUs.png";
import "../App.css";
import SpotlightCard from "../Components/SpotlightCard";
import { FaCalendarCheck, FaSyncAlt, FaBan, FaRegSmile } from "react-icons/fa";

function AboutUs() {
  function handleAnimationComplete() {
    console.log("Animation complete!");
  }

  return (
    <>
      <Header />

      <section
        className="relative md:h-[689px] h-[450px] w-full"
        style={{ overflow: "hidden", top: "-140px" }}
      >
        <div className="absolute inset-0 md:h-[689px] h-[450px] w-full">
          <div className="bg-black inset-0 absolute z-10 opacity-50"></div>
          <img
            src={bgImage}
            alt="Modern Meeting Room"
            className="w-full object-cover h-full"
          />
        </div>

        <div
          className="relative z-20 pt-24 md:pt-50 px-6 flex flex-col items-center w-full space-y-2"
          style={{ margin: "0 auto", overflowX: "visible" }}
        >
          <SplitText
            text="Your Meetings, Streamlined"
            className="text-brand-teal text-white text-36 sm:text-60 font-bold leading-none text-center w-full"
            onLetterAnimationComplete={handleAnimationComplete}
          />

          <SplitText
            text="Skip the Chaos"
            className="text-white text-36 sm:text-60 font-bold leading-none text-center w-full"
            delay={0.05}
          />

          <SplitText
            text="Avoid Double Bookings"
            className="text-white text-36 sm:text-60 font-bold leading-none text-center w-full"
            delay={0.1}
          />

          <SplitText
            text="Stay On Schedule"
            className="text-white text-36 sm:text-60 font-bold leading-none text-center w-full"
            delay={0.2}
          />
        </div>
      </section>

  {/* Our Mission Section */}
  <section className="max-w-4xl mx-auto px-6 py-16">
  <h2 className="text-5xl sm:text-6xl font-extrabold text-center text-brand-teal mb-14">Our Mission</h2>
  <p className="text-xl sm:text-2xl text-center text-neutral-900 mb-6">
      We aim to revolutionize the way meetings are managed by providing a seamless, intuitive, and efficient platform that eliminates scheduling chaos, prevents double bookings, and keeps everyone on track.
    </p>
  <p className="text-lg sm:text-xl text-center text-neutral-500">
      Empowering teams for smarter, stress-free meetings.
    </p>
  </section>

  <section className="max-w-6xl mx-auto px-6 py-20">
    <h2 className="text-5xl sm:text-6xl font-extrabold text-center text-brand-teal mb-14">Key Features</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 spotlight-section">
        <SpotlightCard
          className="spotlight-card"
          icon={<FaCalendarCheck />}
          title="Easy Scheduling"
          description="Quickly book meetings without any hassle or confusion."
        />

        <SpotlightCard
          className="spotlight-card"
          icon={<FaSyncAlt />}
          title="Real-Time Updates"
          description="Stay informed with live notifications about meeting changes."
        />

        <SpotlightCard
          className="spotlight-card"
          icon={<FaBan />}
          title="Conflict-Free Booking"
          description="Avoid double bookings and overlapping schedules with smart conflict detection."
        />

        <SpotlightCard
          className="spotlight-card"
          icon={<FaRegSmile />}
          title="User-Friendly Interface"
          description="Navigate effortlessly with an intuitive and clean design."
        />
    </div>
      </section>

      <Footer />
    </>
  );
}

export default AboutUs;
