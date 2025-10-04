import { useEffect, useState } from 'react';
import loadImage from '../../images/assets/load.png';

const DesktopOnlyWarning = ({ children }: { children: React.ReactNode }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024; // Less than 1024px is considered non-desktop

      setIsDesktop(!isMobile && !isTablet && !isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradient Layer */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(135deg, hsl(85 100% 60% / 0.1) 0%, hsl(280 100% 70% / 0.1) 100%)'
          }}
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 animate-pulse-subtle"
            style={{ background: 'radial-gradient(circle, hsl(85 100% 60%) 0%, transparent 70%)' }}
          />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 animate-pulse-subtle animation-delay-1000"
            style={{ background: 'radial-gradient(circle, hsl(280 100% 70%) 0%, transparent 70%)' }}
          />
        </div>

        <div className="max-w-md mx-auto text-center relative z-10 animate-slideUp">
          {/* Glass Card */}
          <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-glass-border/30 p-8 shadow-elevated">

            {/* Logo Section */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto mb-4 loading-logo">
                <img
                  src={loadImage}
                  alt="HiBeats Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                hibeats
              </h1>
              <p className="text-primary text-lg font-medium">
                Now Available in Desktop Mode
              </p>
            </div>

            {/* Content Section */}
            <div className="space-y-6 text-muted-foreground">
              <p className="text-sm leading-relaxed">
                For the best experience with music creation and blockchain features,
                please access HiBeats from a desktop computer.
              </p>

              {/* Features Card */}
              <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Why Desktop?
                </h3>
                <ul className="text-xs space-y-2 text-left text-muted-foreground/90">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    Better audio processing performance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    Enhanced wallet connectivity
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    Optimized music creation tools
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    Full feature accessibility
                  </li>
                </ul>
              </div>

              {/* Coming Soon Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-medium text-accent">
                  Mobile version coming soon!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DesktopOnlyWarning;
