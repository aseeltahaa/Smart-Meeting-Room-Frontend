// Code from React Bits: https://reactbits.dev/text-animations/split-text
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

const SplitText = ({
  text,
  className = "",
  delay = 0.025,
  duration = 0.22,
  ease = "power3.out",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  onLetterAnimationComplete,
  textAlign = "center",
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Select all letter spans inside the container
    const letters = containerRef.current.querySelectorAll(".letter");

    // Initial state
    gsap.set(letters, from);

    // Animate letters with stagger
    gsap.to(letters, {
      ...to,
      duration,
      ease,
      stagger: delay,
      onComplete: onLetterAnimationComplete,
    });

    return () => {
      gsap.killTweensOf(letters);
    };
  }, [text, delay, duration, ease, from, to, onLetterAnimationComplete]);

  return (
    <p
      ref={containerRef}
      className={`inline-block whitespace-normal overflow-hidden ${className}`}
      style={{ textAlign }}
    >
      {text.split(" ").map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="word"
          style={{ whiteSpace: "nowrap", display: "inline-block", marginRight: "0.25em" }}
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="letter"
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
};

export default SplitText;
