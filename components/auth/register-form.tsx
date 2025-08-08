"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { z } from "zod"
import { CheckCircle, XCircle } from "phosphor-react";

const passwordSchema = z.string()
  .min(6, "A senha deve ter pelo menos 6 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export function RegisterForm() {
  const { register, handleSubmit, formState, reset, watch, setValue, getValues } = useForm<RegisterFormValues>({ mode: "onTouched" });
  const { errors } = formState;
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordRules = [
    {
      label: "Pelo menos 6 caracteres",
      test: (pwd: string) => pwd.length >= 6,
    },
    {
      label: "Pelo menos uma letra maiúscula",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: "Pelo menos um número",
      test: (pwd: string) => /[0-9]/.test(pwd),
    },
    {
      label: "Pelo menos um caractere especial",
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  async function onSubmit(data: RegisterFormValues) {
    setError('');
    setPasswordErrors([]);
    setIsLoading(true);

    // Validação de senha forte
    const pwdCheck = passwordSchema.safeParse(data.password)
    if (!pwdCheck.success) {
      const allErrors = pwdCheck.error.errors.map(e => e.message)
      setPasswordErrors(allErrors)
      setIsLoading(false)
      return
    }
    if (data.password !== data.confirmPassword) {
      setError('As senhas não coincidem.')
      setIsLoading(false)
      return
    }
    if (!data.acceptTerms) {
      setError('Você deve aceitar os termos de uso para continuar.');
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/auth/supabase/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        reset();
        router.push('/auth/login');
      } else {
        setError(result.error || 'Erro ao registrar.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const passwordValue = watch("password") || "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <Image src="/ervapplogo.png" alt="ErvApp Logo" width={120} height={60} className="mb-4 h-auto" />
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-muted-foreground">Registre-se para acessar o painel.</p>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
        <input id="name" type="text" {...register("name", { required: true })} autoComplete="name"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.name && <span className="text-red-600 text-xs">Nome obrigatório</span>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
        <input id="email" type="email" {...register("email", { required: true })} autoComplete="email"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.email && <span className="text-red-600 text-xs">E-mail obrigatório</span>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
        <input id="password" type="password" {...register("password", { required: true })} autoComplete="new-password"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.password && <span className="text-red-600 text-xs">Senha obrigatória</span>}
        {/* Regras de senha em tempo real */}
        <ul className="mt-2 space-y-1">
          {passwordRules.map((rule, i) => {
            const passed = rule.test(passwordValue);
            return (
              <li key={i} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-600' : 'text-red-600'}`}> 
                {passed ? (
                  <CheckCircle size={16} weight="bold" />
                ) : (
                  <XCircle size={16} weight="bold" />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirmar Senha</label>
        <input id="confirmPassword" type="password" {...register("confirmPassword", { required: true })} autoComplete="new-password"
          className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {errors.confirmPassword && <span className="text-red-600 text-xs">Confirmação obrigatória</span>}
      </div>
      
      {/* Aceitação de Termos */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          checked={watch("acceptTerms")}
          onCheckedChange={(checked) => setValue("acceptTerms", checked as boolean)}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label 
            htmlFor="acceptTerms" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Li e aceito os{" "}
            <Link 
              href="/terms" 
              target="_blank"
              className="text-green-700 hover:underline inline-flex items-center space-x-1"
            >
              <span>Termos de Uso</span>
            </Link>
            <span className="text-red-500">*</span>
          </Label>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • Concordo em usar a aplicação apenas para fins legais e educacionais
            </p>
            <p>
              • Entendo que sou responsável por verificar a conformidade legal
            </p>
            <p>
              • Aceito que os desenvolvedores não se responsabilizam pelo uso incorreto
            </p>
          </div>
        </div>
      </div>
      {/* Exibir erro global apenas se não for erro de senha */}
      {error && !error.toLowerCase().includes('senha') && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </button>
      <div className="flex justify-center mt-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Já tem uma conta?</span>
          <Link href="/auth/login" className="text-green-700 hover:underline font-medium">Entrar</Link>
        </div>
      </div>
    </form>
  );
} 