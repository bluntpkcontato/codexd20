/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookOpen, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Dev mode bypass: em localhost, usa mock auth direto
      const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      if (isLocalDev) {
        const mockUser = { 
          id: 'dev-user-001', 
          email: email.trim(), 
          user_metadata: { username: email.split('@')[0] } 
        };
        localStorage.setItem('codex_mock_user', JSON.stringify(mockUser));
        router.push("/dashboard");
        return;
      }

      if (isSignUp) {
        const allowedEmailsEnv = process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "";
        const allowedEmails = allowedEmailsEnv.split(",").map(e => e.trim().toLowerCase());
        
        if (allowedEmailsEnv && !allowedEmails.includes(email.trim().toLowerCase())) {
          throw new Error("Acesso restrito. Seu email não possui um convite para o Códice.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        
        if (data?.session) {
          router.push("/dashboard");
          return;
        }
        
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError) {
          router.push("/dashboard");
          return;
        }
        
        alert("Pacto selado! Verifique seu email para confirmar a conta, ou tente fazer login.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "A magia falhou. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 text-[#d4c8a3] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(212,200,163,0.3)]" />
          <h1 className="text-4xl font-serif text-[#d4c8a3] uppercase tracking-widest mb-2">CODEX D20</h1>
          <p className="text-sm text-[#8a8a93]">O Códice aguarda a assinatura de uma nova alma.</p>
        </div>

        <div className="bg-[#111113] border border-[#2a2a30] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-[#8a8a93] uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18181b] border border-[#2a2a30] rounded-lg px-4 py-3 text-[#d4c8a3] placeholder-zinc-700 outline-none focus:border-purple-900/50 transition-colors"
                placeholder="aventureiro@faerun.com"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-[#8a8a93] uppercase tracking-widest block mb-2">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#18181b] border border-[#2a2a30] rounded-lg px-4 py-3 text-[#d4c8a3] placeholder-zinc-700 outline-none focus:border-purple-900/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#991b1b] hover:bg-[#b91c1c] text-white text-base font-bold py-3 px-4 rounded-lg transition-colors border border-red-900/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{isSignUp ? "Selar Pacto (Criar Conta)" : "Abrir Códice (Entrar)"}</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2a2a30] text-center">
            <p className="text-sm text-[#8a8a93]">
              {isSignUp ? "Já tem um pacto assinado?" : "Sua lenda ainda não começou?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#d4c8a3] hover:underline font-bold transition-colors"
              >
                {isSignUp ? "Entre no Códice" : "Crie uma Conta"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
