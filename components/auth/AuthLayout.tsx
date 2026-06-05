import { Shield, Sparkles } from 'lucide-react';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, icon, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="flex-shrink-0 w-[42%] bg-[#7B2D00] flex flex-col justify-between p-10">
        <div className="space-y-6">
          {/* Logo Row */}
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-full bg-white/18 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[17px] font-playfair font-bold text-white leading-none">
              SafeGround
            </h1>
          </div>
          
          {/* Headline */}
          <h2 className="text-[26px] font-playfair font-bold text-white leading-[1.2]">
            {title}
          </h2>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-[13.5px] text-white/72 leading-[1.6] max-w-[200px]">
              {subtitle}
            </p>
          )}
          
          {/* Feature List */}
          <div className="space-y-4">
            {/* Features will be passed via children */}
          </div>
          
          {/* Testimonial Card */}
          <div className="bg-white/10 rounded-[12px] p-6 mt-auto">
            <p className="text-[13px] italic text-white/88 leading-[1.6]">
              &ldquo;SafeGround gave me a space where I didn't have to explain myself. That privacy changed everything.&rdquo;
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[11.5px] text-white/55">Student, Addis Ababa University</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(() => (
                  <span key="star" className="w-3 h-3 text-[10px] text-[#F5A623]">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="flex-1 bg-[#F5F2EE] flex items-center justify-center p-10">
        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  );
}