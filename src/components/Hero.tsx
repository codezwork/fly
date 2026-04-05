export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-brand-black">
      
      {/* Background Video Engine */}
      {/* The 'grayscale' and 'opacity-80' classes instantly mute standard footage into our editorial aesthetic */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
      >
        <source 
          src="https://assets.mixkit.co/videos/4000/4000-720.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* The Scroll Prompt */}
      {/* A delicate, architectural detail at the bottom center of the screen */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-white text-[10px] tracking-[0.3em] uppercase font-body opacity-70">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          {/* This inner div creates a subtle, endless dripping animation downward */}
          <div className="w-full h-full bg-white origin-top animate-[spin_3s_linear_infinite] opacity-50" style={{ animationName: 'scroll-drip', animationDuration: '2s' }}></div>
        </div>
      </div>

    </section>
  );
}