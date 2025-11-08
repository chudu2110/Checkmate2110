"use client";

import dynamic from 'next/dynamic';
import SkeletonChessboard from '@/components/intro/skeletonChessboard';
import IntroButton from '@/components/intro/button';
import IntroAstronaut from '@/components/intro/astronaut-fiber';

const IntroChessboard = dynamic(() => import('@/components/intro/chessboard'), {
  ssr: false,
  loading: () => <SkeletonChessboard />,
});

export default function IntroPage() {
  return (
    <main className="fixed inset-0 z-10 overflow-hidden pt-16">
      <IntroAstronaut />
      <IntroChessboard />
      <IntroButton />
    </main>
  );
}
