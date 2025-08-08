"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { register, handleSubmit, formState, reset } = useForm<LoginFormValues>({ mode: "onTouched" });
  const { errors } = formState;
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(data: LoginFormValues) {
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/supabase/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        reset();
        window.location.href = '/';
      } else {
        setError(result.error || 'Erro ao entrar.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-0 min-h-[220px] justify-center">
      <div className="flex flex-col items-center gap-2 mb-2">
        <Image src="/ervapplogo.png" alt="ErvApp Logo" width={120} height={60} className="mb-4 h-auto" />
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-muted-foreground">Acesse sua conta para continuar.</p>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
        <input 
          id="email" 
          type="email" 
          {...register("email", { required: true })} 
          autoComplete="email"
          suppressHydrationWarning
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" 
        />
        <div className="h-4 mt-0 mb-0">
          {errors.email
            ? <span className="text-red-600 text-xs">E-mail obrigatório</span>
            : <span className="invisible text-xs">placeholder</span>
          }
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
        <input 
          id="password" 
          type="password" 
          {...register("password", { required: true })} 
          autoComplete="current-password"
          suppressHydrationWarning
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" 
        />
        <div className="h-4 mt-0 mb-0">
          {errors.password
            ? <span className="text-red-600 text-xs">Senha obrigatória</span>
            : <span className="invisible text-xs">placeholder</span>
          }
        </div>
      </div>
      {/* Espaço reservado para mensagem de erro */}
      <div className="h-4 text-center mb-0">
        {error ? (
          <span className="text-red-600 text-sm">{error}</span>
        ) : (
          <span className="invisible">placeholder</span>
        )}
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2 mt-1"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </button>
      <div className="flex flex-col items-center gap-2 mt-2">
        <Link href="/auth/forgot" className="text-green-700 hover:underline text-sm font-medium">Esqueci minha senha</Link>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Ainda não tem uma conta?</span>
          <Link href="/auth/register" className="text-green-700 hover:underline font-medium">Registre-se</Link>
        </div>
      </div>
    </form>
  );
} 