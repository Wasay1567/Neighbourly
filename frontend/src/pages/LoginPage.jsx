import React from "react";
import Login from "../components/Login";
import { CheckCircle2 } from "lucide-react"; // npm install lucide-react if missing

const LoginPage = () => {
  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE: Visuals & Trust (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-900 overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 to-emerald-900/80 z-10" />
        
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2084&q=80"
          alt="Community collaboration"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <span className="font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold tracking-wide">Neighbourly</span>
          </div>

          {/* Main Copy */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Your neighborhood, <span className="text-teal-300">connected.</span>
            </h1>
            <p className="text-teal-100 text-lg leading-relaxed mb-8">
              Join the platform where trust meets convenience. Find local experts, 
              book services securely, and build a stronger community.
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                "Verified Providers & Seekers",
                "Secure Payments & Escrow",
                "Real-time Geo-location Search"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-teal-50 font-medium">
                  <CheckCircle2 className="text-teal-400" size={20} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Footer/Testimonial */}
          <div className="flex items-center gap-4 text-sm text-teal-200/80">
            <div className="flex -space-x-2">
               {/* Mock Avatars */}
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full bg-teal-800 border-2 border-teal-900" />
               ))}
            </div>
            <p>Trusted by 10,000+ neighbors</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
           {/* Mobile Logo (Visible only on small screens) */}
           <div className="lg:hidden text-center mb-8">
             <h1 className="text-3xl font-bold text-teal-900">Neighbourly</h1>
           </div>
           
           <Login />
        </div>
      </div>

    </div>
  );
};

export default LoginPage;