import React, { useState, useEffect } from 'react';

interface AdUnitProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

// Curated list of "Cute, Japanese, Animals, Aesthetic" themed images
// Stored here in the client-side code.
// Note: These are external URLs from Unsplash. If they fail, the component handles it gracefully.
const PLACEHOLDER_IMAGES = [
  // --- Animals (Shiba, Cats, Deer, Rabbits) ---
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80", // Cute Shiba Inu
  "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80", // Cat staring out window
  "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?auto=format&fit=crop&w=800&q=80", // Cute Rabbit
  "https://images.unsplash.com/photo-1559214369-a6b1d7919865?auto=format&fit=crop&w=800&q=80", // Nara Deer
  "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80", // Happy Dog
  "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=800&q=80", // Cherry Blossoms & Cat
  "https://images.unsplash.com/photo-1541364983156-5b9226d585b0?auto=format&fit=crop&w=800&q=80", // Shiba Inu smiling
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80", // Cat close up
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80", // Cat in Japanese street
  "https://images.unsplash.com/photo-1491485880348-188e0631f202?auto=format&fit=crop&w=800&q=80", // Cat silhouette
  "https://images.unsplash.com/photo-1529778873920-4da4926a7071?auto=format&fit=crop&w=800&q=80", // Cute Kitten
  
  // --- Japanese Culture & Streets ---
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80", // Japanese School Girl (Aesthetic/Back)
  "https://images.unsplash.com/photo-1528164344705-475430296531?auto=format&fit=crop&w=800&q=80", // Kyoto Kimono Vibe
  "https://images.unsplash.com/photo-1574621100236-d25a64a43471?auto=format&fit=crop&w=800&q=80", // Origami Cranes
  "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80", // Woman in Kimono (Detail)
  "https://images.unsplash.com/photo-1516205651411-a85a4a55cbc9?auto=format&fit=crop&w=800&q=80", // Aesthetic Lanterns
  "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=800&q=80", // Tea Ceremony
  "https://images.unsplash.com/photo-1545912452-8ea1d64fd6d8?auto=format&fit=crop&w=800&q=80", // Anime store vibe (Akihabara)
  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", // Tokyo Neon Street
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", // Rainy Tokyo Night
  "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?auto=format&fit=crop&w=800&q=80", // Red Lanterns
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", // Torii Gate Mist
  "https://images.unsplash.com/photo-1558862107-d49ef2dd04d8?auto=format&fit=crop&w=800&q=80", // Japanese Umbrella
  "https://images.unsplash.com/photo-1581067756885-b1790432c252?auto=format&fit=crop&w=800&q=80", // Old Bookstore

  // --- Food & Sweets ---
  "https://images.unsplash.com/photo-1623945025704-585642d200ce?auto=format&fit=crop&w=800&q=80", // Japanese Sweets (Wagashi)
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80", // Ramen Bowl
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80", // Sushi Platter
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80", // Matcha Latte
  "https://images.unsplash.com/photo-1579888944880-d98341245702?auto=format&fit=crop&w=800&q=80", // Taiyaki

  // --- Nature & Scenery (Fuji, Sakura) ---
  "https://images.unsplash.com/photo-1490633874781-1c63cc424610?auto=format&fit=crop&w=800&q=80", // Sakura Rain
  "https://images.unsplash.com/photo-1490806843928-2666d6b42671?auto=format&fit=crop&w=800&q=80", // Mt Fuji Sunset
  "https://images.unsplash.com/photo-1522383225653-ed3e1c4c4e2d?auto=format&fit=crop&w=800&q=80", // Pink Sakura
  "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80", // Bamboo Forest
  "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80", // Autumn Leaves Kyoto
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80", // Girl in Field (Aesthetic)
  "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=800&q=80", // Night Sakura
  "https://images.unsplash.com/photo-1557409518-691ebcd96038?auto=format&fit=crop&w=800&q=80", // Hydrangea Japan
  
  // --- Aesthetic & Abstract ---
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80", // Retro Vending Machine
  "https://images.unsplash.com/photo-1590250639906-8d197600cb81?auto=format&fit=crop&w=800&q=80", // Paper Fan
  "https://images.unsplash.com/photo-1515595914614-7a4216839a89?auto=format&fit=crop&w=800&q=80", // Minimalist Japan
  "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?auto=format&fit=crop&w=800&q=80", // White Pagoda
  "https://images.unsplash.com/photo-1624254252668-7c8702c2db2c?auto=format&fit=crop&w=800&q=80", // Glass Wind Chime
];

export const AdUnit: React.FC<AdUnitProps> = ({ format = 'horizontal', className = '' }) => {
  const [bgImage, setBgImage] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Select a random image on mount to ensure rotation
    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
    setBgImage(PLACEHOLDER_IMAGES[randomIndex]);
    setImageError(false);
  }, []);

  // Dimensions based on standard IAB ad sizes
  const sizeClasses = {
    horizontal: 'w-full h-[90px] md:h-[90px] max-w-[728px]',
    rectangle: 'w-full h-[250px] max-w-[300px]',
    vertical: 'w-full h-[600px] max-w-[160px]'
  };

  return (
    <div className={`flex justify-center items-center my-4 mx-auto ${className}`}>
      {/* 
        Container for the Ad 
        Added "photo frame" styling: white border + shadow + rounded
      */}
      <div className={`
        ${sizeClasses[format]} 
        bg-white border-4 border-white shadow-md rounded-xl ring-1 ring-slate-200
        flex flex-col items-center justify-center text-slate-400
        relative overflow-hidden group transition-all duration-300
      `}>
        {bgImage && !imageError ? (
          <img 
            src={bgImage} 
            alt="Decoration" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback pattern if image fails to load
          <div 
            className="absolute inset-0 flex items-center justify-center" 
            style={{ 
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
              backgroundSize: '16px 16px',
              backgroundColor: '#f1f5f9'
            }}
          >
             <div className="flex flex-col items-center gap-2 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">TriLingua</span>
             </div>
          </div>
        )}
        
        {/* Small "AD" label kept minimal to not obscure the image */}
        <div className="absolute bottom-1 right-1 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100">Ad</span>
        </div>
      </div>
    </div>
  );
};