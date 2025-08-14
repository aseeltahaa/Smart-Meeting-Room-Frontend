import Header from '../Components/Header';
import Card from '../Components/Card';
import RoomImage from '../assets/room.png';
import Footer from '../Components/Footer';

function Booking(){
  return (
    <>
      <Header showSearchBar={true} showGradient={false}/>
       <section className="mt-[-60px] mb-16 sm:mb-24 lg:mb-32">
        <div className="p-4 sm:p-8 flex items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />

            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />

            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />

            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />

            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />

            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />

            <Card 
              title="Room 101"
              description="A spacious room equipped with the latest technology for your meetings."
              imageSrc={RoomImage}
              imageAlt="Smart meeting room with equipment"
            />
            
          </div>
        </div>
      </section>

      <Footer/>
    </>
  );
}
export default Booking;