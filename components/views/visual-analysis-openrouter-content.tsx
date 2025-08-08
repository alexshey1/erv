"use client";
import React from 'react';
import PlantVisualAnalysisOpenRouter from '@/components/plant-visual-analysis-openrouter';
import TopBar from '@/components/layout/topbar';

export default function VisualAnalysisOpenRouterContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-grow pt-6 pb-12">
        <PlantVisualAnalysisOpenRouter />
      </main>
    </div>
  );
}
