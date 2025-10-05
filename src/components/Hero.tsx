import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-4 md:mb-8 shadow-xl mx-0 w-full max-w-full">
      <div className="absolute inset-0 gradient-fun opacity-90" />
      <img 
        src={heroBanner} 
        alt="Welcome to KidSpace" 
        className="w-full h-32 md:h-48 object-cover mix-blend-overlay"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 md:p-6">
        <h2 className="text-xl md:text-4xl font-bold mb-1 md:mb-2 text-center drop-shadow-lg">
          Welcome to KidSpace! 🌈
        </h2>
        <p className="text-sm md:text-lg text-center drop-shadow-md max-w-2xl px-2">
          A safe and fun place to share, make friends, and be creative! ✨
        </p>
      </div>
    </div>
  );
};

export default Hero;
