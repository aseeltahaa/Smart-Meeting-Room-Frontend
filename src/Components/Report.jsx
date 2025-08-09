import '../App.css';
import NumberFlip from './NumberFlip';

function Report() {
  return (
    <section className="px-6 relative" style={{ top: '-100px' }}>
      <div style={{ top: '-100px' }} className="relative z-20">
        <div className="bg-brand-teal rounded-lg relative z-20 md:flex md:mx-auto md:max-w-[878px] md:divide-x md:divide-white">
          <div className="text-center py-10 border-b border-solid border-white md:w-1/3 md:border-b-0">
            <NumberFlip value={84} />
            <p className="text-white text-lg">Meetings</p>
          </div>

          <div className="text-center py-10 border-b border-solid border-white md:w-1/3 md:border-b-0">
            <NumberFlip value={29} />
            <p className="text-white text-lg">Rooms</p>
          </div>

          <div className="text-center py-10 md:w-1/3">
            <NumberFlip value={5095} />
            <p className="text-gray-300 text-lg">Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Report;
