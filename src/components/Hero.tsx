import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 shadow-xl">
      <div className="absolute inset-0 gradient-fun opacity-90" />
      <img 
        src={heroBanner} 
        alt="Welcome to KidSpace" 
        className="w-full h-48 object-cover mix-blend-overlay"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-4xl font-bold mb-2 text-center drop-shadow-lg">
          Welcome to KidSpace! 🌈
        </h2>
        <p className="text-lg text-center drop-shadow-md max-w-2xl">
          A safe and fun place to share, make friends, and be creative! ✨
        </p>
      </div>
    </div>
  );
};

export default Hero;
