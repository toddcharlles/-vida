"use client";

import { useEffect, useState } from "react";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", cpf: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [message, setMessage] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    fetch("/api/customer/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.customer) {
          setProfile(d.customer);
          setForm({
            name: d.customer.name,
            phone: d.customer.phone || "",
            cpf: d.customer.cpf || "",
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const res = await fetch("/api/customer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Perfil atualizado com sucesso!");
      setProfile(data.customer);
    } else {
      setError(data.error || "Erro ao atualizar");
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    setPwMessage("");
    setPwError("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("As senhas nao coincidem");
      setSavingPw(false);
      return;
    }

    if (pwForm.newPassword.length < 6) {
      setPwError("A nova senha deve ter pelo menos 6 caracteres");
      setSavingPw(false);
      return;
    }

    const res = await fetch("/api/customer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setPwMessage("Senha alterada com sucesso!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPwError(data.error || "Erro ao alterar senha");
    }
    setSavingPw(false);
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

      {/* Dados do perfil */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="font-bold text-gray-700 mb-4">Dados Pessoais</h2>

        {message && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{message}</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">O email nao pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder="000.000.000-00"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Alteracoes"}
          </button>
        </div>
      </form>

      {/* Alterar senha */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-bold text-gray-700 mb-4">Alterar Senha</h2>

        {pwMessage && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{pwMessage}</div>}
        {pwError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{pwError}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={savingPw}
            className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-medium text-sm hover:bg-gray-900 transition disabled:opacity-50"
          >
            {savingPw ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </form>
    </div>
  );
}
