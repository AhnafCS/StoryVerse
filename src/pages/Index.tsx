import { useState, useEffect } from "react";
import StoryVerseLogo from "@/pages/StoryVerseLogo";
import AuthForm from "@/pages/AuthForm";
import Sparkles from "@/pages/Sparkles";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Initial logo zoom-in effect
    const logoTimer = setTimeout(() => setLogoLoaded(true), 100);
    // Start auth transition after logo loads
    const authTimer = setTimeout(() => setShowAuth(true), 800);
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(authTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Sparkles />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-lavender/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cream/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        {/* Logo - starts centered, then slides left */}
        <div
          className={`absolute flex items-center justify-center transition-all duration-1000 ease-out ${
            showAuth 
              ? 'scale-200 -translate-x-48' 
              : logoLoaded 
                ? 'scale-800 translate-x-0' 
                : 'scale-0 translate-x-0'
          } opacity-100`}
          style={{ transitionDuration: '1000ms' }}
        >
          <StoryVerseLogo />
        </div>

        {/* Auth form container - appears after logo moves */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full max-w-5xl">
          {/* Spacer for logo when it moves left */}
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            {/* This div maintains the layout structure */}
          </div>

          {/* Divider */}
          <div
            className={`hidden lg:block w-px h-80 bg-gradient-to-b from-transparent via-lavender/40 to-transparent origin-top transition-all duration-400 ease-out ${
              showAuth ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
            }`}
            style={{ transitionDuration: '400ms', transitionDelay: showAuth ? '800ms' : '0ms' }}
          />

          {/* Auth side */}
          <div
            className={`flex-1 flex items-center justify-center lg:justify-start w-full transition-all duration-500 ease-out ${
              showAuth ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
            style={{ transitionDuration: '500ms', transitionDelay: showAuth ? '900ms' : '0ms' }}
          >
            <AuthForm />
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div
        className={`absolute bottom-6 left-0 right-0 text-center transition-opacity duration-500 ${
          showAuth ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDuration: '500ms', transitionDelay: showAuth ? '1500ms' : '0ms' }}
      >
        <p className="text-xs text-muted-foreground/50 font-body tracking-widest">
          © 2026 StoryVerse · Developed by Group7
        </p>
      </div>
    </div>
  );
};

export default Index;
