import { useState, useRef } from "react";

const RoomSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setExpanded(false);
      }
    }, 100);
  };

  return (
  <div className="flex items-center justify-center m-0 p-0">
      <div className={`relative flex items-center justify-center transition-all duration-200 ${expanded ? 'w-80' : 'w-12'} bg-white bg-opacity-10 border border-[#539D98] rounded-full shadow-sm`} style={{ minWidth: expanded ? '320px' : '48px', maxWidth: '320px', cursor: expanded ? 'auto' : 'pointer', minHeight: '48px', padding: expanded ? '0.5rem 0.5rem' : '0.75rem 0.5rem' }}>
        <button
          type="button"
          aria-label="Expand search"
          className="focus:outline-none"
          onClick={handleExpand}
          tabIndex={0}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-[#539D98]  transition-all duration-200 ${expanded ? 'mr-2' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </button>
        {expanded && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a room..."
            className="bg-transparent text-gray-900 placeholder-[#539D98] focus:outline-none w-full text-base px-2 py-1 rounded-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            onBlur={handleBlur}
          />
        )}
      </div>
    </div>
  );
};

export default RoomSearchBar;
