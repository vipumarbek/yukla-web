import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  Database,
  Radio,
  Server,
  Terminal,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers
} from "lucide-react";
import { ObservabilityStats, BackgroundJob } from "../types";

interface Props {
  token: string;
}

export const EnterpriseObservabilityHub: React.FC<Props> = ({ token }) => {
  const [stats, setStats] = useState<ObservabilityStats>({
    uptimeSeconds: 84200,
    cpuUsagePct: 18.5,
    memoryUsedMb: 142,
    memoryTotalMb: 1024,
    heapUsedMb: 88,
    eventLoopLagMs: 2.1,
    totalRequestsCount: 14820,
    requestsPerSecond: 28,
    errorRatePct: 0.02,
    p50LatencyMs: 8,
    p95LatencyMs: 24,
    p99LatencyMs: 42,
    activeSocketsCount: 4,
    activeQueueJobsCount: 1,
    sentryStatus: "connected",
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [activeTab, setActiveTab] = useState<"telemetry" | "logs" | "jobs" | "prometheus">("telemetry");
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/observability/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }

      const logsRes = await fetch("/api/observability/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }

      const jobsRes = await fetch("/api/observability/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRetryJob = async (id: string) => {
    try {
      await fetch(`/api/observability/jobs/${id}/retry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTelemetry();
    } catch (err) {
      console.error("Retry job error:", err);
    }
  };

  const formatUptime = (sec: number) => {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${d > 0 ? `${d}k ` : ""}${h}s ${m}d ${s}son`;
  };

  return (
    <div className="space-y-6" id="observability-hub">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">System Observability & APM Telemetry</h2>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 font-mono rounded-full border border-emerald-500/30">
                PROMETHEUS + SENTRY
              </span>
            </div>
            <p className="text-xs text-slate-400">Ishlash vaqti: <strong className="text-slate-200 font-mono">{formatUptime(stats.uptimeSeconds)}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "telemetry" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Telemetriya
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "logs" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Loglar
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "jobs" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Fon Vazifalari ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab("prometheus")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "prometheus" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              /metrics
            </button>
          </div>
          <button
            onClick={fetchTelemetry}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tab: Telemetry Gauges */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">CPU & Event Loop</span>
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.cpuUsagePct}%</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>Lag: <strong className="font-mono text-slate-800">{stats.eventLoopLagMs}ms</strong></span>
                <span className="text-emerald-600 font-semibold">Normal</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">V8 Heap Xotira</span>
                <Server className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.memoryUsedMb} MB</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>Heap: <strong className="font-mono text-slate-800">{stats.heapUsedMb} MB</strong></span>
                <span className="text-slate-400">/ 1024 MB</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kechikish (Latency)</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono">{stats.p50LatencyMs} ms</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>P95: <strong className="font-mono text-slate-800">{stats.p95LatencyMs}ms</strong></span>
                <span>P99: <strong className="font-mono text-slate-800">{stats.p99LatencyMs}ms</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">So'rovlar & Xatolik</span>
                <Radio className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.requestsPerSecond} req/s</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>Jami: <strong className="font-mono text-slate-800">{stats.totalRequestsCount}</strong></span>
                <span className="text-emerald-600 font-semibold">{stats.errorRatePct}% xatolik</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Dastur Arxitekturasi & Xavfsizlik Statusi
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Cloud Run Konteyner Muhiti</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Sog'lom (Port 3000)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Sentry APM & Crash Reporting</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Ulangan</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Real-time WebSocket Klientlar</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.activeSocketsCount} ta faol ulanish</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Navbat & Fon Workerlari Telemetriyasi
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Eskrou Hisob-Kitob Workeri</span>
                  <span className="font-bold text-emerald-700">100% Bajarildi</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">IoT Sensor Ingestion Worker</span>
                  <span className="font-bold text-blue-700">Aktiv (75% tsikl)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Didox E-TTN Sinxronizatsiya</span>
                  <span className="font-bold text-emerald-700">Sinxronlangan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === "logs" && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-5 font-mono text-xs shadow-2xl space-y-2 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-2 font-bold text-white">
              <Terminal className="w-4 h-4 text-emerald-400" /> Real-time System Stream
            </span>
            <span className="text-[11px]">Avtomatik yangilanmoqda</span>
          </div>
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-3 py-1 hover:bg-slate-900/60 px-2 rounded">
              <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`uppercase font-bold px-1.5 rounded text-[10px] shrink-0 ${
                log.level === "info" ? "bg-blue-500/20 text-blue-300" : log.level === "debug" ? "bg-slate-700 text-slate-300" : "bg-rose-500/20 text-rose-300"
              }`}>
                {log.source || log.level}
              </span>
              <span className="text-slate-300 flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Background Jobs */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Fon Navbati Vazifalari (Queue Workers)</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {jobs.map(job => (
              <div key={job.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{job.name}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      job.status === "completed" ? "bg-emerald-100 text-emerald-700" : job.status === "running" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Navbat: <strong>{job.queue}</strong> • Urinishlar: {job.attempts}/{job.maxAttempts}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {job.status === "running" && (
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${job.progressPct}%` }}></div>
                    </div>
                  )}
                  {job.status === "failed" && (
                    <button
                      onClick={() => handleRetryJob(job.id)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg text-xs hover:bg-blue-100"
                    >
                      Qayta urinish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Prometheus Exposition */}
      {activeTab === "prometheus" && (
        <div className="bg-slate-950 text-emerald-400 p-5 rounded-2xl font-mono text-xs border border-slate-800 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400">
            <span className="font-bold text-white">Prometheus Metrics Endpoint: /metrics</span>
            <a
              href="/metrics"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              To'g'ridan-to'g'ri ko'rish ↗
            </a>
          </div>
          <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{`# HELP yukla_uptime_seconds Total runtime in seconds
# TYPE yukla_uptime_seconds counter
yukla_uptime_seconds ${stats.uptimeSeconds}

# HELP yukla_http_requests_total Total number of HTTP requests
# TYPE yukla_http_requests_total counter
yukla_http_requests_total ${stats.totalRequestsCount}

# HELP yukla_event_loop_lag_ms Node.js event loop lag
# TYPE yukla_event_loop_lag_ms gauge
yukla_event_loop_lag_ms ${stats.eventLoopLagMs}

# HELP yukla_memory_heap_used_bytes V8 Heap memory used
# TYPE yukla_memory_heap_used_bytes gauge
yukla_memory_heap_used_bytes ${stats.heapUsedMb * 1024 * 1024}`}
          </pre>
        </div>
      )}
    </div>
  );
};
export default EnterpriseObservabilityHub;
