"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from 'next/image';

type ResetFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function ResetPasswordForm() {
  const { register, handleSubmit, formState, reset } = useForm<ResetFormValues>({ mode: "onTouched" });
  const { errors } = formState;
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: ResetFormValues) {
    setError('');
    if (data.password !== data.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (result.success) {
        reset();
      } else {
        setError(result.error || 'Erro ao redefinir senha.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <Image src="/ervapplogo.png" alt="ErvApp Logo" width={64} height={64} className="mb-2 h-auto" />
        <h1 className="text-2xl font-bold">Redefinir senha</h1>
        <p className="text-muted-foreground">Defina uma nova senha para sua conta.</p>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
        <input id="email" type="email" {...register("email", { required: true })} autoComplete="email"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.email && <span className="text-red-600 text-xs">E-mail obrigatório</span>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Nova senha</label>
        <input id="password" type="password" {...register("password", { required: true })} autoComplete="new-password"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.password && <span className="text-red-600 text-xs">Senha obrigatória</span>}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirmar nova senha</label>
        <input id="confirmPassword" type="password" {...register("confirmPassword", { required: true })} autoComplete="new-password"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.confirmPassword && <span className="text-red-600 text-xs">Confirmação obrigatória</span>}
      </div>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Redefinindo...
          </>
        ) : (
          'Redefinir senha'
        )}
      </button>
    </form>
  );
} 