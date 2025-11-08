'use client';

import { usePathname } from 'next/navigation';

export default function CosmicBackground() {
  const pathname = usePathname();
  const isIntro = pathname === '/intro' || pathname === '/intro/' || pathname.startsWith('/intro');
  const containerClass = `cosmic-bg fixed inset-0 pointer-events-none ${isIntro ? 'intro-bg z-0' : 'z-0'}`;

  return (
    <div className={containerClass} aria-hidden="true">
      <div className="stars stars-1 absolute inset-0" />
      <div className="stars stars-2 absolute inset-0" />
      <div className="stars stars-3 absolute inset-0" />
      {isIntro && (
        <>
          <div className="stars stars-4 absolute inset-0" />
          <div className="stars stars-5 absolute inset-0" />
          <div className="stars stars-6 absolute inset-0" />
        </>
      )}
    </div>
  );
}
