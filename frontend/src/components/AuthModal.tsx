"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await signup(name, email, password, isHost);
        toast.success("Welcome to Airbnb!");
      }
      closeAuthModal();
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={authModalOpen} onClose={closeAuthModal} title="Log in or sign up">
      <div className="p-6">
        <h2 className="mb-5 text-[22px] font-semibold">Welcome to Airbnb</h2>

        <div className="mb-5 flex rounded-lg border border-gray-border p-1 text-sm font-medium">
          <button
            className={`flex-1 rounded-md py-2 ${mode === "login" ? "bg-gray-dark text-white" : ""}`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={`flex-1 rounded-md py-2 ${mode === "signup" ? "bg-gray-dark text-white" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              className="w-full rounded-lg border border-gray-border px-4 py-3 outline-none focus:border-gray-dark"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="w-full rounded-lg border border-gray-border px-4 py-3 outline-none focus:border-gray-dark"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-lg border border-gray-border px-4 py-3 outline-none focus:border-gray-dark"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
          {mode === "signup" && (
            <label className="flex items-center gap-2 text-sm text-gray-text">
              <input
                type="checkbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
                className="h-4 w-4 accent-gray-dark"
              />
              I want to host my place on Airbnb
            </label>
          )}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] py-3 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Continue"}
          </button>
        </form>

        <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs text-gray-text">
          <p className="font-semibold text-gray-dark">Demo accounts</p>
          <p>Guest — guest@demo.com / password</p>
          <p>Host — host@demo.com / password</p>
        </div>
      </div>
    </Modal>
  );
}
