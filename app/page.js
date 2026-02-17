"use client";

import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
      setLoading(false);
    }
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        window.location.origin;

      const redirectTo = new URL("/auth/callback", baseUrl).toString();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      alert(
        error && error.message
          ? error.message
          : "Google sign-in failed"
      );
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">

      {/* Neon Glow Background */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-xl px-8 py-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,243,255,0.2)] text-center"
      >

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-neon-blue/20 border border-neon-blue/40 shadow-[0_0_20px_rgba(0,243,255,0.5)]">
            <Zap className="text-neon-pink" size={32} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold mb-4">
          Smart Bookmark App
        </h1>

        <p className="text-gray-300 mb-8">
          Save, organize and access your links in real-time.
          Private and secure with Google authentication.
        </p>

        {/* Google Login Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 25px rgba(0,243,255,0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="w-full group relative inline-flex items-center justify-center gap-3 rounded-xl bg-white/10 px-6 py-4 font-semibold border border-white/20 hover:bg-white/20 hover:border-neon-blue transition-all duration-300 disabled:opacity-60"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

          <span className="relative z-10">
            Continue with Google
          </span>

          {authLoading ? (
            <div className="relative z-10 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
          )}
        </motion.button>

        {/* Feature Icons */}
        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <Globe className="text-neon-blue mb-2" />
            <span className="text-sm text-gray-300">Realtime Sync</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="text-neon-pink mb-2" />
            <span className="text-sm text-gray-300">Fast Access</span>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="text-neon-purple mb-2" />
            <span className="text-sm text-gray-300">Private & Secure</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
