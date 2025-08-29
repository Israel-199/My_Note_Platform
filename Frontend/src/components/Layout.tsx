import React from 'react';
import RightImage from '../assets/note11.avif'; 
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
  showWave?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showWave = true }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      
      {/* Right side - Wave background */}
{showWave && (
  <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
    <div className="absolute inset-0">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${RightImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/50" />
    </div>

    {/* Headline + Paragraph */}
    <div className="relative z-10 w-full text-center pt-[202px] px-4">
      {/* Headline */}
      <motion.h1
        className="text-white text-5xl font-bold"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        Capture Your Ideas, Anywhere.
      </motion.h1>

      {/* Paragraph */}
      <motion.p
        className="text-white/80 text-lg mt-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      >
        Stay organized, capture ideas instantly, and keep your notes with you everywhere. Fast, simple, and always reliable.
      </motion.p>
    </div>
  </div>
)}
    </div>
  );
};

export default Layout;