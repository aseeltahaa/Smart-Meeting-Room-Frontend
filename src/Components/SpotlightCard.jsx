import { useRef, useState } from "react";

const SpotlightCard = ({ 
  children, 
  className = "", 
  spotlightColor = "#647EFF",
  icon,
  title,
  description 
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
  className={`relative rounded-3xl border border-neutral-800 overflow-hidden p-8 ${className}`}
  style={{ backgroundColor: '#353839' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      
      {/* Content area - either use props or children */}
      <div className="relative z-10">
        {icon || title || description ? (
          <div className="text-center">
            {icon && (
              <div className="text-4xl text-white mb-4 flex justify-center">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-xl font-semibold text-white mb-3">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-neutral-300 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SpotlightCard;