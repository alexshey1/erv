'use client';

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative flex items-center justify-center mb-6">
        <span className="absolute inline-flex h-20 w-20 rounded-full bg-green-100 opacity-75 animate-ping"></span>
        <span className="relative inline-flex rounded-full h-20 w-20 border-4 border-green-500 border-t-transparent animate-spin shadow-lg"></span>
        <img
          src="/cannabis11414267.png"
          alt="Loading"
          className="absolute h-16 w-16 object-contain"
        />
      </div>
      <span className="text-green-700 text-lg font-semibold tracking-wide animate-pulse">Carregando...</span>
    </div>
  );
}