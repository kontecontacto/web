import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function ProjectGallery({ project }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [project.mainImg, ...project.thumbs];
  const src = (file) => encodeURI(`/img/${project.folder}/${file.replace(/\.png$/, '.webp')}`);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'ArrowLeft') prevImage(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="w-full mt-auto space-y-3 relative z-20">
      {/* Main Image */}
      <div 
        className="rounded-2xl border border-gray-700 overflow-hidden shadow-2xl bg-[#0a0a0a] relative group cursor-pointer"
        onClick={() => openLightbox(0)}
      >
        <div className="h-8 bg-[#1a1a1a] border-b border-gray-800 flex items-center px-4 gap-2 w-full">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <img 
          src={src(project.mainImg)}
          alt={`Captura del sistema ${project.title}`}
          loading="lazy"
          decoding="async"
          width="1600"
          height="780" 
          className="w-full h-[220px] sm:h-[280px] object-cover object-top project-image group-hover:opacity-70 transition-opacity" 
        />
        <div className="absolute inset-x-0 top-1/2 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest shadow-xl border border-gray-800 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,1)]">VER GALERÍA</span>
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className={`grid gap-3 ${project.thumbs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {project.thumbs.map((thumb, idx) => (
          <img 
            key={idx}
            src={src(thumb)}
            alt={`${project.title}: pantalla ${idx + 2}`}
            loading="lazy"
            decoding="async"
            width="400"
            height="300" 
            className="w-full aspect-square md:aspect-[4/3] object-cover object-top rounded-2xl border border-gray-700 project-image cursor-pointer hover:border-lightAccent dark:hover:border-darkAccent transition-colors shadow-lg"
            onClick={() => openLightbox(idx + 1)} 
          />
        ))}
      </div>

      {/* Lightbox Modal rendered via Portal */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md"
              onClick={closeLightbox}
            >
              {/* Close Button */}
              <button 
                className="absolute top-6 right-6 text-white hover:text-lightAccent dark:hover:text-darkAccent z-[110] transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm"
                onClick={closeLightbox}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {/* Prev Button */}
              <button 
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-lightAccent dark:hover:text-darkAccent z-[110] transition-colors p-2 md:p-4 bg-black/40 hover:bg-black/80 rounded-full"
                onClick={prevImage}
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>

              {/* Main Lightbox Image */}
              <div className="relative w-full max-w-7xl max-h-[100vh] flex items-center justify-center px-4 md:px-12" onClick={(e) => e.stopPropagation()}>
                <motion.img 
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={src(images[currentIndex])}
                  alt={`${project.title}: pantalla ${currentIndex + 1}`}
                  className="w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-1 ring-white/20"
                />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/80 font-bold text-sm tracking-widest bg-black/40 px-4 py-1 rounded-full backdrop-blur-md">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>

              {/* Next Button */}
              <button 
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-lightAccent dark:hover:text-darkAccent z-[110] transition-colors p-2 md:p-4 bg-black/40 hover:bg-black/80 rounded-full"
                onClick={nextImage}
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
