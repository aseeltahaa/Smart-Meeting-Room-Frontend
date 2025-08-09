import { useEffect, useRef, useState } from 'react';

function DigitReel({ digit, delay, isActive }) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => {
        setPosition(digit);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [digit, delay, isActive]);

  return (
    <div className="h-10 w-6 overflow-hidden inline-block">
      <div
        className="transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${position * 2.5}rem)` }}
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-10 text-4xl font-bold text-white flex justify-center items-center"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NumberFlip({ value }) {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const digits = value.toString().padStart(4, '0').split('').map(Number);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current); // run once
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex justify-center">
      {digits.map((digit, idx) => (
        <DigitReel key={idx} digit={digit} delay={idx * 100} isActive={isVisible} />
      ))}
    </div>
  );
}
