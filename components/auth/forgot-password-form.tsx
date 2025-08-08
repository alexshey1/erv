"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';

type ForgotFormValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState, reset } = useForm<ForgotFormValues>({ mode: "onTouched" });
  const { errors } = formState;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: ForgotFormValues) {
    setError('');
    setSuccess(false);
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        reset();
      } else {
        setError(result.error || 'Erro ao recuperar senha.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mb-2">
          <Image src="/ervapplogo.png" alt="ErvApp Logo" width={64} height={64} className="mb-2 h-auto" />
          <h1 className="text-2xl font-bold text-green-600">Email enviado!</h1>
          <p className="text-center text-gray-600">
            Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          Verifique sua caixa de entrada e spam. O link expira em 1 hora.
        </div>
        <div className="flex justify-center mt-2">
          <Link href="/auth/login" className="text-green-700 hover:underline text-sm font-medium">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <Image src="/ervapplogo.png" alt="ErvApp Logo" width={64} height={64} className="mb-2 h-auto" />
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="text-muted-foreground">Receba um link para redefinir sua senha.</p>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
        <input id="email" type="email" {...register("email", { required: true })} autoComplete="email"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.email && <span className="text-red-600 text-xs">E-mail obrigatório</span>}
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
            Enviando...
          </>
        ) : (
          'Enviar link'
        )}
      </button>
      <div className="flex justify-center mt-2">
        <Link href="/auth/login" className="text-green-700 hover:underline text-sm font-medium">Voltar ao login</Link>
      </div>
    </form>
  );
} 