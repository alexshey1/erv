"use client";

import ErvaBotChatSuspense from "@/components/erva-bot-chat";

export default function ErvinhoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-700 mb-2 text-center drop-shadow-lg">
        Ervinho - Seu assistente de cultivo da ErvApp
      </h1>
      <p className="text-green-900 text-base sm:text-lg mb-8 text-center max-w-xl">
        Tire dúvidas, peça dicas e receba orientações técnicas sobre cannabicultura com o Ervinho, o mestre cultivador digital da ErvApp.
      </p>
      <div className="w-full max-w-md">
        <ErvaBotChatSuspense />
      </div>
    </div>
  );
}