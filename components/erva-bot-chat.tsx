"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Loader2, Smile, CheckCircle2, Send, RefreshCw } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

// Constantes de segurança
const MAX_INPUT_LENGTH = 500;
const MAX_MESSAGES = 50;

// Constantes definidas fora do componente
const ERVINHO_PERSONA = `Olá! Eu sou o Ervinho, seu mestre cultivador digital e copiloto do ErvApp. Posso falar abertamente sobre cannabis, cultivo, técnicas e dúvidas, sempre de forma educativa, responsável e nunca para fins ilegais. Minhas respostas são diretas, objetivas e baseadas em uma base de dados extensa, mas sempre respeitando as leis. Pergunte o que quiser sobre cannabicultura! 🌱`;

// Tipos com IDs únicos
type MessageType = {
  id: string;
  from: "user" | "bot";
  text: string;
  timestamp?: number;
};

// Função de sanitização segura
const sanitizeInput = (input: string): string => {
  if (typeof window === "undefined") {
    // No servidor, apenas remove caracteres perigosos básicos
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .slice(0, MAX_INPUT_LENGTH);
  }

  // No cliente, usa DOMPurify
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).slice(0, MAX_INPUT_LENGTH);
};

// Hook customizado para localStorage simplificado
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Função utilitária para gerar IDs únicos (determinística no servidor)
const generateMessageId = (from: "user" | "bot") => {
  if (typeof window === "undefined") {
    // No servidor, retorna um ID determinístico baseado no tipo
    return `${from}-server-static`;
  }

  // No cliente, gera ID único
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const uuid = crypto.randomUUID ? crypto.randomUUID() : `${timestamp}-${random}`;
  return `${from}-${uuid}`;
};

// Função para garantir que todas as mensagens tenham IDs únicos
const ensureMessageIds = (messages: MessageType[]): MessageType[] => {
  return messages.map((msg) => {
    if (!msg.id || msg.id === "") {
      return {
        ...msg,
        id: generateMessageId(msg.from),
        timestamp: msg.timestamp || (typeof window !== "undefined" ? Date.now() : 0),
      };
    }
    return msg;
  });
};

// Componente Message otimizado com React.memo
const Message = React.memo(function Message({
  from,
  text,
}: Omit<MessageType, "id" | "timestamp">) {
  return (
    <div
      className={`flex w-full ${
        from === "user" ? "justify-end" : "justify-start"
      } mb-3`}
    >
      {from === "bot" && (
        <div className="flex items-end gap-2">
          <Avatar className="w-12 h-12 shadow-xl border-4 border-green-200 bg-white/80">
            <AvatarImage
              src="/Gemini_Generated_Image_hfvslzhfvslzhfvs.png"
              alt="Ervinho"
            />
            <AvatarFallback className="bg-green-500 text-white font-bold">
              E
            </AvatarFallback>
          </Avatar>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col"
          >
            <div className="rounded-3xl rounded-bl-md bg-white/60 backdrop-blur-md text-gray-900 px-6 py-4 shadow-2xl max-w-xs sm:max-w-md text-base font-normal border border-green-100">
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-green-700" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-2" {...props} />
                  ),
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  code: ({ node, ...props }) => (
                    <code className="bg-green-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-green-300 pl-4 italic text-gray-700" {...props} />
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
            <span className="text-xs text-green-700 font-semibold mt-1 ml-1 flex items-center gap-1">
              Ervinho
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </span>
          </motion.div>
        </div>
      )}
      {from === "user" && (
        <div className="flex items-end gap-2 flex-row-reverse">
          <Avatar className="w-10 h-10 bg-gradient-to-br from-green-200 via-green-100 to-white text-green-700 font-bold flex items-center justify-center border-2 border-green-300 shadow-lg">
            U
          </Avatar>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-end"
          >
            <div className="rounded-3xl rounded-br-md bg-green-500/80 text-white px-6 py-4 shadow-xl max-w-xs sm:max-w-md text-base font-normal border border-green-200 backdrop-blur-md">
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-green-100" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-2" {...props} />
                  ),
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  code: ({ node, ...props }) => (
                    <code className="bg-green-600/50 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
});

export function ErvinhoChat() {
  // Estado inicial estático para evitar hidratação
  const initialMessage: MessageType = {
    id: "bot-initial",
    from: "bot",
    text: ERVINHO_PERSONA,
    timestamp: 0,
  };

  const [messages, setMessages] = useLocalStorage<MessageType[]>(
    "ervinho-chat-history",
    [initialMessage]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Garantir que todas as mensagens tenham IDs únicos ao carregar (apenas no cliente)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const messagesWithIds = ensureMessageIds(messages);
    if (
      messagesWithIds.length !== messages.length ||
      messagesWithIds.some((msg, i) => msg.id !== messages[i]?.id)
    ) {
      setMessages(messagesWithIds);
    }
  }, [messages, setMessages]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current && typeof window !== "undefined") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Função de sanitização de entrada
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeInput(e.target.value);
      setInput(sanitizedValue);
    },
    []
  );

  // Função otimizada para enviar mensagens (sem dependência de messages)
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || typeof window === "undefined") return;

    const sanitizedInput = sanitizeInput(input.trim());
    if (!sanitizedInput) return;

    const userMessage: MessageType = {
      id: generateMessageId("user"),
      from: "user",
      text: sanitizedInput,
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => {
      // Limitar número de mensagens para evitar sobrecarga
      const limitedMessages = prevMessages.slice(-MAX_MESSAGES + 1);
      const newMessages = [...limitedMessages, userMessage];

      // Enviar mensagem para IA
      const sendToAI = async () => {
        setLoading(true);

        try {
          const isFirstMessage = newMessages.length === 2;
          const res = await fetch("/api/ai/gemini-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: newMessages.map(({ from, text }) => ({ from, text })),
              isFirstMessage,
            }),
          });

          const data = await res.json();

          if (data.success) {
            const botMessage: MessageType = {
              id: generateMessageId("bot"),
              from: "bot",
              text: data.message,
              timestamp: Date.now(),
            };
            setMessages((msgs) => {
              const limitedMsgs = msgs.slice(-MAX_MESSAGES + 1);
              return [...limitedMsgs, botMessage];
            });
          } else {
            const errorMessage: MessageType = {
              id: generateMessageId("bot"),
              from: "bot",
              text: "Desculpe, não consegui responder agora. Tente novamente em instantes.",
              timestamp: Date.now(),
            };
            setMessages((msgs) => {
              const limitedMsgs = msgs.slice(-MAX_MESSAGES + 1);
              return [...limitedMsgs, errorMessage];
            });
          }
        } catch (e) {
          const errorMessage: MessageType = {
            id: generateMessageId("bot"),
            from: "bot",
            text: "Erro ao consultar IA. Tente novamente.",
            timestamp: Date.now(),
          };
          setMessages((msgs) => {
            const limitedMsgs = msgs.slice(-MAX_MESSAGES + 1);
            return [...limitedMsgs, errorMessage];
          });
        } finally {
          setLoading(false);
        }
      };

      sendToAI();
      return newMessages;
    });

    setInput("");
  }, [input, loading, setMessages]);

  // Função otimizada para lidar com tecla Enter
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Função para limpar o histórico
  const handleClearHistory = useCallback(() => {
    if (typeof window === "undefined") return;

    const initialMessage: MessageType = {
      id: generateMessageId("bot"),
      from: "bot",
      text: ERVINHO_PERSONA,
      timestamp: 0, // Use a static timestamp to avoid hydration mismatch
    };
    setMessages([initialMessage]);
  }, [setMessages]);

  // Filtrar mensagens com IDs válidos
  const validMessages = messages.filter(
    (msg) => msg && msg.id && typeof msg.id === "string" && msg.id.trim() !== ""
  );

  // Renderizar skeleton durante hidratação
  if (typeof window === "undefined") {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl rounded-3xl flex flex-col h-[70vh] min-h-[420px] bg-gradient-to-br from-green-200 via-white to-green-100 border-2 border-green-200 relative">
        <CardHeader className="bg-green-100/80 rounded-t-3xl p-6 border-b border-green-200">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-3/4 ml-auto" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <div className="p-4 border-t border-green-200 bg-green-50/80">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-12 rounded-full" />
            <Skeleton className="w-24 h-12 rounded-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-2xl rounded-3xl flex flex-col h-[70vh] min-h-[420px] bg-gradient-to-br from-green-200 via-white to-green-100 border-2 border-green-200 relative">
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="absolute top-4 right-4 z-20 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            title="Nova conversa"
            aria-label="Nova conversa"
            type="button"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}

        <CardHeader className="bg-green-100/80 rounded-t-3xl p-6 border-b border-green-200">
          <div
            className="flex items-center gap-3"
          >
            <Avatar className="w-14 h-14 shadow-md border-2 border-white">
              <AvatarImage src="/ervinho-avatar.png" alt="Ervinho" />
              <AvatarFallback className="text-xl bg-green-200 text-green-800">E</AvatarFallback>
            </Avatar>
            <h2 className="tracking-tight text-green-700 text-2xl font-bold drop-shadow">
              Ervinho
            </h2>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto px-4 py-6 bg-transparent">
          <div className="flex flex-col gap-1">
            {validMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Message from={msg.from} text={msg.text} />
              </motion.div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-green-700 text-sm mt-2 animate-pulse">
                <Loader2 className="animate-spin w-4 h-4" />
                Ervinho está digitando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <div className="p-4 border-t border-green-200 bg-green-50/80 flex gap-2 items-center rounded-b-3xl">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Digite sua dúvida sobre cultivo..."
              className="w-full bg-white/80 border border-green-200 focus:ring-green-500 focus:border-green-500 rounded-full text-base px-5 py-3 shadow-md font-medium pr-12"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              maxLength={MAX_INPUT_LENGTH}
              aria-label="Digite sua mensagem"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
              <Smile className="w-5 h-5" />
            </span>
            {/* Contador de caracteres */}
            {input.length > MAX_INPUT_LENGTH * 0.8 && (
              <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
                {input.length}/{MAX_INPUT_LENGTH}
              </div>
            )}
          </div>
          <Button
            className="bg-gradient-to-br from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-semibold px-7 py-3 rounded-full shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center gap-2"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="w-5 h-5" /> Perguntar
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="w-full max-w-md mx-auto text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-b-2xl px-4 py-2 text-center mt-2">
        <strong>Aviso:</strong> As respostas do Ervinho são apenas para fins informativos e educacionais. Elas{" "}
        <b>não substituem a orientação de profissionais habilitados</b> (agrônomos, médicos, advogados, etc). Sempre consulte um especialista antes de tomar decisões importantes sobre cultivo, saúde ou questões legais.
      </div>
    </>
  );
}

import { Suspense } from "react";

export default function ErvinhoChatSuspense() {
  return (
    <Suspense
      fallback={
        <Skeleton className="w-full max-w-md h-[420px] mx-auto rounded-2xl bg-green-50" />
      }
    >
      <ErvinhoChat />
    </Suspense>
  );
}