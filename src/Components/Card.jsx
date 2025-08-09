import React from "react";

const Card = ({ 
  title = "", 
  description = "",
  imageSrc = null,
  imageAlt = ""
}) => {
  return (
    <div className="
      w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-xs 
      bg-[#1F2937]         /* card bg: dark gray-blue */
      border border-[#2C394B]  /* subtle border: darker blue-gray */
      rounded-xl shadow-lg overflow-hidden 
      mx-auto 
      hover:shadow-xl hover:border-[#3B82F6]  /* accent blue on hover */
      transition-all duration-300 ease-in-out
    ">

      {imageSrc && (
        <div className="h-40 sm:h-48 bg-[#121826] overflow-hidden">
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4 sm:p-5">
        <h5 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold tracking-tight text-[#F9FAFB]">
          {title}
        </h5>
        <p className="text-[#9CA3AF] text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Card;