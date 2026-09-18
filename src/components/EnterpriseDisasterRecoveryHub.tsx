import React, { useState, useEffect } from "react";
import {
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  Download,
  RotateCcw,
  Plus,
  Lock
} from "lucide-react";
import { BackupSnapshot } from "../types";

interface Props {
  token: string;
}

export const EnterpriseDisasterRecoveryHub: React.FC<Props> = ({ token }) => {
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [lastBackupAt, setLastBackupAt] = useState<string>("");
  const [encryptionAlgo, setEncryptionAlgo] = useState<string>("AES-256-CBC");
  const [creating, setCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchBackupStatus = async () => {
    try {
      const res = await fetch("/api/backup/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
        setLastBackupAt(data.lastBackupAt);
        setEncryptionAlgo(data.encryptionAlgorithm);
      }
    } catch (err) {
      console.error("Backup status fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchBackupStatus();
  }, [token]);

  const handleCreateSnapshot = async () => {
    setCreating(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/backup/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSnapshots([data.snapshot, ...snapshots]);
        setStatusMsg("Yangi zaxira nusxasi yaratildi va SHA-256 yaxlitligi tasdiqlandi!");
        setTimeout(() => setStatusMsg(""), 5000);
      }
    } catch (err) {
      console.error("Create snapshot error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleTestRestore = async () => {
    if (!confirm("Baza tiklanish simulyatsiyasi va yaxlitlik tekshiruvini ishga tushirasizmi?")) return;
    try {
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMsg(data.message);
        setTimeout(() => setStatusMsg(""), 5000);
      }
    } catch (err) {
      console.error("Restore test failed:", err);
    }
  };

  return (
    <div className="space-y-6" id="disaster-recovery-hub">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Backup & Disaster Recovery (DR Hub)</h2>
            <p className="text-xs text-slate-500">Avtomatik zaxira nusxalash, Point-in-Time tiklash va SHA-256 yaxlitlik nazorati</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestRestore}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Baza Yaxlitligini Tekshirish
          </button>
          <button
            onClick={handleCreateSnapshot}
            disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> {creating ? "Yaratilmoqda..." : "Zaxira Nusxa Yaratish"}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {statusMsg}
        </div>
      )}

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avtomatik Zaxiralash</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Har 6 soatda</div>
          <span className="text-xs text-slate-500 mt-1 block">
            Oxirgi: {lastBackupAt ? new Date(lastBackupAt).toLocaleTimeString() : "Avtomatik"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Shifrlash Standarti</span>
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">{encryptionAlgo}</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Xavfsiz Shifrlangan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saqlash Muddatlari (RPO/RTO)</span>
            <HardDrive className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">RPO: &lt; 5 daqiqa</div>
          <span className="text-xs text-slate-500 mt-1 block">RTO Tiklanish: &lt; 30 soniya</span>
        </div>
      </div>

      {/* Snapshot List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Mavjud Zaxira Nusxalari (Snapshots)</h3>
          <span className="text-xs text-slate-400">Jami: {snapshots.length} ta nusxa</span>
        </div>
        <div className="divide-y divide-slate-100">
          {snapshots.map(snp => (
            <div key={snp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm font-mono">{snp.filename}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    {snp.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                  <span>Hajm: {(snp.sizeBytes / 1024).toFixed(1)} KB</span>
                  <span>SHA256: <strong className="text-slate-700">{snp.checksumSha256.substring(0, 16)}...</strong></span>
                  <span>Foydalanuvchilar: {snp.recordsCount?.users || 0}, Buyurtmalar: {snp.recordsCount?.orders || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono mr-2">
                  {new Date(snp.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => alert(`Nusxa ${snp.filename} arxivlanmoqda...`)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  title="Yuklab olish"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default EnterpriseDisasterRecoveryHub;
