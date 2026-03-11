"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ADMIN_EMAIL = "niel.garcia@volenday.com";

const ASSET_TYPES = [
  { label: "Laptop", value: "Laptop" },
  { label: "Desktop", value: "Desktop" },
  { label: "Phone", value: "Phone" },
  { label: "Computer Component", value: "Computer Component" },
];

const DEFECT_TYPES = [
  { label: "Aesthetic Damage", value: "Aesthetic Damage" },
  { label: "Performance Issues", value: "Performance Issues" },
  { label: "Hardware Malfunction", value: "Hardware Malfunction" },
];

function getDefectColor(type: string) {
  if (type === "Aesthetic Damage") return "text-blue-300 bg-blue-500/10 border-blue-500/20";
  if (type === "Performance Issues") return "text-amber-200 bg-amber-500/10 border-amber-500/20";
  if (type === "Hardware Malfunction") return "text-purple-300 bg-purple-500/10 border-purple-500/20";
  return "text-gray-300 bg-gray-500/10 border-gray-500/20";
}

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#a855f7", "#6b7280"];

// ─── Filter Dropdown (reused from main page) ──────────────────────────────────

function AdminFilterDropdown({ activeFilters, onApply, modelOptions }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(activeFilters);

  useEffect(() => { if (isOpen) setDraft(activeFilters); }, [isOpen, activeFilters]);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const activeCount = activeFilters.models.length + activeFilters.defects.length;
  const label = activeCount > 0 ? `Filters (${activeCount})` : "Filter";

  return (
    <div ref={ref} className="relative text-sm z-20">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 min-w-[120px] bg-[#1e1f20] border text-gray-200 rounded-lg px-4 py-2.5 hover:bg-[#2a2b2f] transition ${activeCount > 0 ? "border-gray-500" : "border-[#2a2b2f]"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        <span className="font-medium">{label}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" className={`ml-auto text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}><path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#1e1f20] border border-[#28282c] shadow-2xl rounded-xl p-5 z-[100] max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Models</p>
            <div className="flex flex-col gap-3">
              {modelOptions.map((m: string) => (
                <label key={m} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={draft.models.includes(m)} onChange={() => setDraft((p: any) => ({ ...p, models: p.models.includes(m) ? p.models.filter((x: string) => x !== m) : [...p.models, m] }))} className="w-4 h-4 rounded border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition leading-tight">{m}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Defect Type</p>
            <div className="flex flex-col gap-3">
              {["Aesthetic Damage", "Performance Issues", "Hardware Malfunction"].map(d => (
                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={draft.defects.includes(d)} onChange={() => setDraft((p: any) => ({ ...p, defects: p.defects.includes(d) ? p.defects.filter((x: string) => x !== d) : [...p.defects, d] }))} className="w-4 h-4 rounded border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition">{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-2 pt-5 border-t border-[#2a2b2f]">
            <button onClick={() => { const cleared = { models: [] as string[], defects: [] as string[] }; setDraft(cleared); onApply(cleared); setIsOpen(false); }} className="flex-[2] py-2.5 rounded-lg bg-[#131314] text-gray-400 hover:text-white hover:bg-[#2a2b2f] transition text-xs font-bold uppercase tracking-wider">Clear</button>
            <button onClick={() => { onApply(draft); setIsOpen(false); }} className="flex-[3] py-2.5 rounded-lg bg-gray-200 text-black hover:bg-white transition text-xs font-bold uppercase tracking-wider shadow-lg">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────

function DashboardView({ assets, bids }: { assets: any[]; bids: any[] }) {
  const totalLaptops = assets.length;
  const totalActiveBids = bids.length;
  const totalProjectedRevenue = assets.reduce((sum, a) => sum + Number(a.current_bid || 0), 0);

  const mostViewedUnit = assets.length > 0
    ? assets.reduce((top, a) => (a.views_count > (top.views_count || 0) ? a : top), assets[0])
    : null;

  const highestBidUnit = assets.length > 0
    ? assets.reduce((top, a) => (Number(a.current_bid) > Number(top.current_bid) ? a : top), assets[0])
    : null;

  const defectCounts: Record<string, number> = {};
  assets.forEach((a) => {
    const key = a.defect_type || "Unknown";
    defectCounts[key] = (defectCounts[key] || 0) + 1;
  });
  const pieData = Object.entries(defectCounts).map(([name, value]) => ({ name, value }));

  const top5Viewed = [...assets]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map((a) => ({ name: a.model_type?.length > 18 ? a.model_type.slice(0, 18) + "…" : a.model_type, views: a.views_count || 0 }));

  const kpis = [
    { label: "Total Laptops for Sale", value: totalLaptops, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>), color: "text-blue-400" },
    { label: "Total Active Bids", value: totalActiveBids, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>), color: "text-emerald-400" },
    { label: "Total Projected Revenue", value: `₱${totalProjectedRevenue.toLocaleString()}`, icon: (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>), color: "text-amber-400" },
    { label: "Most Viewed Unit", value: mostViewedUnit ? mostViewedUnit.model_type : "—", sub: mostViewedUnit ? `${mostViewedUnit.views_count || 0} views` : "", icon: (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>), color: "text-purple-400" },
    { label: "Highest Bid Unit", value: highestBidUnit ? highestBidUnit.model_type : "—", sub: highestBidUnit ? `₱${Number(highestBidUnit.current_bid).toLocaleString()}` : "", icon: (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>), color: "text-yellow-400" },
  ];

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-lg px-3 py-2 text-xs shadow-xl">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-gray-400">{payload[0].value} unit{payload[0].value !== 1 ? "s" : ""}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-lg px-3 py-2 text-xs shadow-xl">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-gray-400">{payload[0].value} views</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#1e1f20] border border-[#2a2b2f] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold leading-tight">{kpi.label}</span>
              <span className={kpi.color}>{kpi.icon}</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white leading-none truncate block">{kpi.value}</span>
              {kpi.sub && <span className="text-xs text-gray-500 mt-0.5 block">{kpi.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie: Defect Types */}
        <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Defect Type Breakdown</h3>
          {pieData.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center">No data available</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPie />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 min-w-[130px]">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-300 truncate">{d.name}</span>
                    <span className="text-gray-500 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar: Top 5 Most Viewed */}
        <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Top 5 Most Viewed Laptops</h3>
          {top5Viewed.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top5Viewed} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#d1d5db", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="views" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [assets, setAssets] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState({ models: [] as string[], defects: [] as string[] });
  const [activeTab, setActiveTab] = useState<"dashboard" | "items">("dashboard");

  // Context menu
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editBidAsset, setEditBidAsset] = useState<any>(null);
  const [deleteAsset, setDeleteAsset] = useState<any>(null);

  // Edit bid form
  const [editBidAmount, setEditBidAmount] = useState("");

  // Add asset form
  const emptyForm = { assetType: "Laptop", modelName: "", serialNumber: "", defectType: "Aesthetic Damage", imageUrl: "", startingBid: "", cpu: "", ram: "", storage: "", os: "" };
  const [addForm, setAddForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Auth Guard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setAuthChecked(true);
    });
  }, [router]);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    setIsLoading(true);
    const [laptopRes, bidRes] = await Promise.all([
      supabase.from("laptops").select("*").order("id", { ascending: true }),
      supabase.from("bids").select("*").order("amount", { ascending: false }),
    ]);

    if (laptopRes.data) setAssets(laptopRes.data);
    if (bidRes.data) setBids(bidRes.data);
    setIsLoading(false);
  };

  useEffect(() => { if (authChecked) fetchData(); }, [authChecked]);

  // ─── Close context menu on outside click ─────────────────────────────────────

  useEffect(() => {
    if (menuOpenId === null) return;
    const handler = (e: any) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpenId(null); };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [menuOpenId]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  const getHighestBid = (laptopId: number) => {
    const assetBids = bids.filter(b => b.laptop_id === laptopId);
    if (assetBids.length === 0) return null;
    return assetBids.reduce((top, b) => (b.amount > top.amount ? b : top), assetBids[0]);
  };

  const modelOptions = [...new Set(assets.map(a => a.model_type))];

  let processed = [...assets];
  if (activeFilters.models.length > 0) processed = processed.filter(a => activeFilters.models.includes(a.model_type));
  if (activeFilters.defects.length > 0) processed = processed.filter(a => activeFilters.defects.includes(a.defect_type));

  // ─── Delete Handler ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteAsset) return;

    const assetBids = bids.filter(b => b.laptop_id === deleteAsset.id);
    const bidderEmails = [...new Set(assetBids.map(b => b.email).filter(Boolean))] as string[];

    if (bidderEmails.length > 0) {
      fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cancellation",
          emails: bidderEmails,
          laptopModel: deleteAsset.model_type,
        }),
      }).catch(err => console.error("Failed to send cancellation emails", err));
    }

    await supabase.from("bids").delete().eq("laptop_id", deleteAsset.id);
    await supabase.from("laptops").delete().eq("id", deleteAsset.id);
    setDeleteAsset(null);
    fetchData();
  };

  // ─── Edit Bid Handler ─────────────────────────────────────────────────────────

  const handleEditBid = async () => {
    if (!editBidAsset || !editBidAmount) return;
    const newAmount = Number(editBidAmount);

    const topBid = getHighestBid(editBidAsset.id);
    if (topBid && newAmount > topBid.amount && topBid.email) {
      fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "outbid",
          emails: [topBid.email],
          laptopModel: editBidAsset.model_type,
          newBidAmount: newAmount,
        }),
      }).catch(err => console.error("Failed to send outbid email", err));
    }

    await supabase.from("laptops").update({ current_bid: newAmount }).eq("id", editBidAsset.id);
    setEditBidAsset(null);
    setEditBidAmount("");
    fetchData();
  };

  // ─── Add Asset Handler ────────────────────────────────────────────────────────

  const isAddFormValid = addForm.modelName && addForm.serialNumber && addForm.startingBid && addForm.cpu && addForm.ram && addForm.storage && addForm.os;

  const handleAddAsset = async () => {
    if (!isAddFormValid) return;
    setIsSubmitting(true);

    try {
      const existingModels = [...new Set(assets.map(a => a.model_type))];
      const normalizeRes = await fetch("/api/admin/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newModelName: addForm.modelName, existingModels }),
      });
      const { normalized } = await normalizeRes.json();
      const finalModelName = normalized || addForm.modelName;

      const specs = { cpu: addForm.cpu, ram: addForm.ram, storage: addForm.storage, os: addForm.os };

      const fallbackImage = `https://api.dicebear.com/7.x/icons/svg?seed=${encodeURIComponent(finalModelName)}&icon=laptop&backgroundColor=131314`;
      const imageList = addForm.imageUrl ? [addForm.imageUrl] : [fallbackImage];

      await supabase.from("laptops").insert({
        model_type: finalModelName,
        serial_number: addForm.serialNumber,
        defect_type: addForm.defectType,
        images: imageList,
        description: `${addForm.defectType} - Added via Admin Console`,
        specs,
        current_bid: Number(addForm.startingBid),
        bids_count: 0,
        views_count: 0,
      });

      setAddForm(emptyForm);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Add asset error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render Guard ─────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#101112] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#101112] text-white flex">

      {/* ══ LEFT SIDEBAR ══ */}
      <aside className="w-16 sm:w-56 shrink-0 bg-[#131314] border-r border-[#2a2b2f] flex flex-col sticky top-0 h-screen z-40">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-3 sm:px-5 py-5 border-b border-[#2a2b2f]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg border border-blue-400/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <span className="hidden sm:block text-sm font-bold text-white">Admin Console</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-2 sm:p-3 mt-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "dashboard" ? "bg-[#1e1f20] text-white" : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1f20]/50"}`}
          >
            {/* Dashboard icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span className="hidden sm:block">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "items" ? "bg-[#1e1f20] text-white" : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1f20]/50"}`}
          >
            {/* Scroll / list icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>
            <span className="hidden sm:block">Item List</span>
          </button>
        </nav>

        {/* Bottom: back to home */}
        <div className="mt-auto p-2 sm:p-3 border-t border-[#2a2b2f]">
          <button onClick={() => router.push("/")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-[#1e1f20]/50 transition w-full font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            <span className="hidden sm:block">Back to Home</span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ══ HEADER ══ */}
        <header className="sticky top-0 z-30 bg-[#101112]/90 backdrop-blur-xl border-b border-[#2a2b2f]/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold truncate">
              {activeTab === "dashboard" ? "Dashboard" : "Item List"}
            </h1>
            {activeTab === "items" && (
              <div className="flex items-center gap-3">
                <AdminFilterDropdown activeFilters={activeFilters} onApply={setActiveFilters} modelOptions={modelOptions} />
                <button onClick={() => { setAddForm(emptyForm); setIsAddModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-lg shadow-blue-600/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span className="hidden sm:inline">Add New Asset</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ══ PAGE CONTENT ══ */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "dashboard" ? (
            <DashboardView assets={assets} bids={bids} />
          ) : (
            /* ══ ITEM LIST TAB ══ */
            processed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <p className="text-sm">No assets found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {processed.map((asset) => {
                  const topBid = getHighestBid(asset.id);
                  return (
                    <div key={asset.id} className="relative bg-[#1e1f20] border border-[#2a2b2f] rounded-xl p-4 flex items-center gap-4 hover:border-[#3a3b3f] transition group">

                      {/* Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#131314] border border-[#2a2b2f] overflow-hidden shrink-0">
                        {asset.images && asset.images.length > 0 ? (
                          <img src={asset.images[0]} alt={asset.model_type} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                      </div>

                      {/* Model + Serial */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm sm:text-base font-bold text-white truncate">{asset.model_type}</span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">{asset.serial_number}</span>
                      </div>

                      {/* Defect Tag */}
                      <div className="hidden md:flex items-center shrink-0">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getDefectColor(asset.defect_type)}`}>
                          {asset.defect_type}
                        </span>
                      </div>

                      {/* Bid Info */}
                      <div className="hidden sm:flex flex-col items-end text-right min-w-[180px] shrink-0 pr-8">
                        {topBid ? (
                          <>
                            <span className="text-xs text-gray-400">Latest Bidder: <span className="text-gray-200 font-medium">{topBid.full_name}</span></span>
                            <span className="text-sm font-bold text-green-400 mt-0.5">₱{Number(topBid.amount).toLocaleString()}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-500">No bids yet</span>
                            <span className="text-sm font-bold text-gray-300 mt-0.5">Starting at ₱{Number(asset.current_bid).toLocaleString()}</span>
                          </>
                        )}
                      </div>

                      {/* Context Menu Trigger */}
                      <div className="absolute top-2.5 right-2.5">
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === asset.id ? null : asset.id); }} className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:bg-red-500/10 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>

                        {menuOpenId === asset.id && (
                          <div ref={menuRef} className="absolute right-0 mt-1 w-44 bg-[#1e1f20] border border-[#28282c] shadow-2xl rounded-xl py-1.5 z-50 text-sm">
                            <button onClick={() => { setEditBidAsset(asset); setEditBidAmount(String(asset.current_bid)); setMenuOpenId(null); }} className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#2a2b2f] transition flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                              Edit Bid Amount
                            </button>
                            <button onClick={() => { setDeleteAsset(asset); setMenuOpenId(null); }} className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              Delete Listing
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>

      {/* ══ DELETE CONFIRMATION MODAL ══ */}
      {deleteAsset && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteAsset(null)}>
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Listing</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">{deleteAsset.model_type}</span> ({deleteAsset.serial_number})?
              All associated bids will also be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteAsset(null)} className="flex-1 py-2.5 rounded-lg bg-[#131314] text-gray-400 hover:text-white hover:bg-[#2a2b2f] transition text-sm font-semibold">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition text-sm font-semibold shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT BID AMOUNT MODAL ══ */}
      {editBidAsset && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditBidAsset(null)}>
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white mb-1">Edit Bid Amount</h3>
            <p className="text-xs text-gray-500 mb-5">{editBidAsset.model_type} — {editBidAsset.serial_number}</p>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">New Current Bid (₱)</label>
            <input type="number" step={100} value={editBidAmount} onChange={(e) => setEditBidAmount(e.target.value)} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g. 3000" />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditBidAsset(null)} className="flex-1 py-2.5 rounded-lg bg-[#131314] text-gray-400 hover:text-white hover:bg-[#2a2b2f] transition text-sm font-semibold">Cancel</button>
              <button onClick={handleEditBid} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition text-sm font-semibold shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD NEW ASSET MODAL ══ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Add New Asset</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#131314] hover:bg-[#2a2b2f] flex items-center justify-center text-gray-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Asset Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Asset Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select value={addForm.assetType} onChange={(e) => setAddForm({ ...addForm, assetType: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-gray-200 rounded-lg px-3 py-3 pr-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none cursor-pointer">
                    {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              {/* Model Name */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Model Name <span className="text-red-400">*</span></label>
                <input type="text" required value={addForm.modelName} onChange={(e) => setAddForm({ ...addForm, modelName: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g. Lenovo Thinkpad E480" />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Serial Number <span className="text-red-400">*</span></label>
                <input type="text" required value={addForm.serialNumber} onChange={(e) => setAddForm({ ...addForm, serialNumber: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g. SN-2024-0001" />
              </div>

              {/* Defect Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Defect Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select value={addForm.defectType} onChange={(e) => setAddForm({ ...addForm, defectType: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-gray-200 rounded-lg px-3 py-3 pr-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none cursor-pointer">
                    {DEFECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Image URL <span className="text-gray-600 text-[10px] ml-1">(optional — auto-generated if empty)</span></label>
                <input type="text" value={addForm.imageUrl} onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="https://example.com/image.jpg" />
              </div>

              {/* Starting Bid */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Starting Bid Amount (₱) <span className="text-red-400">*</span></label>
                <input type="number" step={100} required value={addForm.startingBid} onChange={(e) => setAddForm({ ...addForm, startingBid: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g. 2000" />
              </div>

              {/* Specs Section */}
              <div className="pt-2 border-t border-[#2a2b2f]">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Specifications <span className="text-red-400">*</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">CPU <span className="text-red-400">*</span></label>
                    <input type="text" required value={addForm.cpu} onChange={(e) => setAddForm({ ...addForm, cpu: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="i5-8250U" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">RAM <span className="text-red-400">*</span></label>
                    <input type="text" required value={addForm.ram} onChange={(e) => setAddForm({ ...addForm, ram: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="8GB DDR4" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Storage <span className="text-red-400">*</span></label>
                    <input type="text" required value={addForm.storage} onChange={(e) => setAddForm({ ...addForm, storage: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="256GB SSD" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">OS <span className="text-red-400">*</span></label>
                    <input type="text" required value={addForm.os} onChange={(e) => setAddForm({ ...addForm, os: e.target.value })} className="w-full bg-[#131314] border border-[#2a2b2f] text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Windows 10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-[#2a2b2f]">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 rounded-lg bg-[#131314] text-gray-400 hover:text-white hover:bg-[#2a2b2f] transition text-sm font-semibold">Cancel</button>
              <button onClick={handleAddAsset} disabled={isSubmitting || !isAddFormValid} className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition text-sm font-semibold shadow-lg flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
                ) : (
                  "Add Asset"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
