import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClass?: string;
}

const Section: React.FC<SectionProps> = ({ children, id, className = '', containerClass = '' }) => {
  return (
    <section id={id} className={`py-16 md:py-24 lg:py-32 relative overflow-hidden ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${containerClass}`}>
        {children}
      </div>
    </section>
  );
};

export default Section;