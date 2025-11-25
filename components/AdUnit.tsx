import React from 'react';

interface AdUnitProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ format = 'horizontal', className = '' }) => {
  // Dimensions based on standard IAB ad sizes
  // Horizontal: Leaderboard (728x90) / Mobile Banner (320x50)
  // Rectangle: Medium Rectangle (300x250)
  // Vertical: Wide Skyscraper (160x600)
  
  const sizeClasses = {
    horizontal: 'w-full h-[90px] md:h-[90px] max-w-[728px]',
    rectangle: 'w-full h-[250px] max-w-[300px]',
    vertical: 'w-full h-[600px] max-w-[160px]'
  };

  return (
    <div className={`flex justify-center items-center my-4 mx-auto ${className}`}>
      {/* 
        Container for the Ad 
        Replace the content of this div with your AdSense/Ad network code later.
      */}
      <div className={`
        ${sizeClasses[format]} 
        bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg 
        flex flex-col items-center justify-center text-slate-400
        transition-colors hover:bg-slate-50 hover:border-slate-400
      `}>
        <span className="text-xs font-bold uppercase tracking-widest mb-1">Advertisement</span>
        <span className="text-[10px] opacity-70">Space Reserved</span>
        
        {/* Example: <ins className="adsbygoogle" ... ></ins> */}
      </div>
    </div>
  );
};