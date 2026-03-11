"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LaptopCard } from "../components/LaptopCard";
import { supabase } from "../lib/supabase"; // THE BRIDGE TO YOUR DATABASE

// ----------------- COMPONENTS -----------------

function CustomDropdown({ value, onChange, options, fullWidth = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: any) { if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false); }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={selectRef} className={`relative text-sm z-20 ${fullWidth ? 'w-full' : ''}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full bg-[#1e1f20] border border-[#2a2b2f] text-gray-200 rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#2a2b2f] transition"
      >
        <span className="truncate">{options.find((o: any) => o.value === value)?.label || "Select Option"}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" className={`ml-2 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}><path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {isOpen && (
        <ul className="absolute left-0 right-0 mt-2 bg-[#1e1f20] border border-[#28282c] shadow-2xl rounded-lg py-1.5 z-[100] max-h-[250px] overflow-y-auto custom-scrollbar">
          {options.map((o: any) => (
            <li key={o.value}>
              <button 
                type="button"
                onClick={() => { onChange(o.value); setIsOpen(false); }} 
                className={`w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2a2b2f] transition ${o.value === value ? "bg-[#2a2b2f] text-white font-medium" : ""}`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterSortDropdown({ activeFilters, onApply }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(activeFilters);

  useEffect(() => { if (isOpen) setDraft(activeFilters); }, [isOpen, activeFilters]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: any) { if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false); }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleApply = () => { onApply(draft); setIsOpen(false); };
  const handleClear = () => {
    const cleared = { models: [], defects: [], sortBy: "default" };
    setDraft(cleared); onApply(cleared); setIsOpen(false);
  };

  const toggleModel = (m: string) => {
    setDraft((prev: any) => ({ ...prev, models: prev.models.includes(m) ? prev.models.filter((x: string) => x !== m) : [...prev.models, m] }));
  };

  const toggleDefect = (d: string) => {
    setDraft((prev: any) => ({ ...prev, defects: prev.defects.includes(d) ? prev.defects.filter((x: string) => x !== d) : [...prev.defects, d] }));
  };

  const activeCount = activeFilters.models.length + activeFilters.defects.length;
  let label = "Filter";
  if (activeCount > 0 || activeFilters.sortBy !== "default") {
    label = `Filters (${activeCount})`;
  }

  return (
    <div ref={selectRef} className="relative text-sm z-20">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between min-w-[100px] sm:min-w-[140px] bg-[#1e1f20] border text-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-[#2a2b2f] transition ${activeCount > 0 || activeFilters.sortBy !== "default" ? 'border-gray-500' : 'border-[#2a2b2f]'}`}>
        <span className="font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{activeCount > 0 ? `(${activeCount})` : 'Filter'}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" className={`ml-2 sm:ml-3 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}><path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#1e1f20] border border-[#28282c] shadow-2xl rounded-xl p-4 sm:p-5 z-[100] max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Sort By</p>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={draft.sortBy === "default"} onChange={() => setDraft({...draft, sortBy: "default"})} className="w-4 h-4 rounded-full border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
                <span className="text-sm text-gray-300 group-hover:text-white transition">Default</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={draft.sortBy === "mostBids"} onChange={() => setDraft({...draft, sortBy: "mostBids"})} className="w-4 h-4 rounded-full border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
                <span className="text-sm text-gray-300 group-hover:text-white transition">Most Bids</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={draft.sortBy === "mostViewed"} onChange={() => setDraft({...draft, sortBy: "mostViewed"})} className="w-4 h-4 rounded-full border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
                <span className="text-sm text-gray-300 group-hover:text-white transition">Most Viewed</span>
              </label>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Models</p>
            <div className="flex flex-col gap-3">
              {["Lenovo Thinkpad E480", "Lenovo Thinkpad E490", "HP Elitebook 840G2", "Asus PRO P1440FA"].map(m => (
                <label key={m} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={draft.models.includes(m)} onChange={() => toggleModel(m)} className="w-4 h-4 rounded border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
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
                  <input type="checkbox" checked={draft.defects.includes(d)} onChange={() => toggleDefect(d)} className="w-4 h-4 rounded border-[#2a2b2f] bg-[#131314] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1e1f20] cursor-pointer" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition">{d}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2 pt-5 border-t border-[#2a2b2f]">
            <button onClick={handleClear} className="flex-[2] py-2.5 rounded-lg bg-[#131314] text-gray-400 hover:text-white hover:bg-[#2a2b2f] transition text-xs font-bold uppercase tracking-wider">Clear</button>
            <button onClick={handleApply} className="flex-[3] py-2.5 rounded-lg bg-gray-200 text-black hover:bg-white transition text-xs font-bold uppercase tracking-wider shadow-lg">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ user, myBidsCount, onLoginClick, onMyBidsClick, onLogOutClick }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user.email === "niel.garcia@volenday.com";

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: any) { if (profileRef.current && !profileRef.current.contains(e.target)) setIsOpen(false); }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={profileRef} className="relative z-20">
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2a2b2f] border border-[#3a3b3f] flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-gray-500 transition focus:outline-none shrink-0">
          {isLoggedIn ? (
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" className="w-full h-full object-cover bg-[#1e1f20]" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          )}
        </button>
        
        {isLoggedIn && myBidsCount > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-[#101112] shadow-sm pointer-events-none">
            {myBidsCount}
          </span>
        )}
      </div>

      {isOpen && (
        <ul className="absolute right-0 mt-3 w-48 bg-[#1e1f20] border border-[#28282c] shadow-2xl rounded-xl py-2 z-50 text-sm">
          {isLoggedIn && (
            <li className="px-4 py-2 border-b border-[#2a2b2f] mb-1">
              <p className="text-gray-200 font-medium truncate">Logged in as</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </li>
          )}
          <li>
            <button 
              onClick={() => { onMyBidsClick(); setIsOpen(false); }}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-gray-300 hover:bg-[#2a2b2f] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              My Bids 
              {myBidsCount > 0 && <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{myBidsCount}</span>}
            </button>
          </li>
          {isAdmin && (
            <li>
              <button 
                onClick={() => { router.push('/admin'); setIsOpen(false); }}
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-gray-300 hover:bg-[#2a2b2f] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Admin Console
              </button>
            </li>
          )}
          <li>
            <button 
              onClick={() => { 
                if(isLoggedIn) { onLogOutClick(); } 
                else { onLoginClick(); }
                setIsOpen(false); 
              }}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-gray-300 hover:bg-[#2a2b2f] transition"
            >
              {isLoggedIn ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Log Out</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> Log In</>
              )}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

// ----------------- MAIN PAGE -----------------

export default function Home() {
  
  // ---------------- STATE ----------------
  const [laptops, setLaptops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLaptop, setSelectedLaptop] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState({ models: [] as string[], defects: [] as string[], sortBy: "default" });
  const [visibleCount, setVisibleCount] = useState(6);
  
  // UI Interaction States
  const [imgIdx, setImgIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Mobile specific modal state for the left preview pane
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Modal & Drawer States
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSignUpSuccessOpen, setIsSignUpSuccessOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMyBidsOpen, setIsMyBidsOpen] = useState(false);
  const [activeCartItem, setActiveCartItem] = useState<number | null>(null);
  
  // Custom Alert Modals
  const [isLoginSuccessOpen, setIsLoginSuccessOpen] = useState(false);
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [isResetSentOpen, setIsResetSentOpen] = useState(false);

  // Custom Cancel Confirmation Modal State
  const [bidToCancel, setBidToCancel] = useState<{bidId: number, laptopId: number} | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  // Stale bid alert modal
  const [isStaleBidAlertOpen, setIsStaleBidAlertOpen] = useState(false);

  // Compare Logic State
  const [compareIds, setCompareIds] = useState<number[]>([]);

  // Auth States
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false); 
  const [authFullName, setAuthFullName] = useState("");
  const [landingView, setLandingView] = useState<'hero' | 'form'>('hero');
  const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [landingAuthError, setLandingAuthError] = useState("");
  const [expiredLinkMessage, setExpiredLinkMessage] = useState("");

  // DB Submission & History State
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [myBids, setMyBids] = useState<any[]>([]); 
  const [lastPlacedBid, setLastPlacedBid] = useState<number>(0); 

  // AI Chat State (Global Voly AI)
  const initialVolyMessage = "Hi! I'm Voly, your personal assistant for today's internal laptop auction. We're clearing out company laptops with various minor defects, and you have the opportunity to snag one by placing a bid! You can browse the available units on the right, and select any laptop to see its full specs and photos on the left.\n\nTo place a bid, you'll need to create an account using your company email. This allows us to notify you if you're outbid and lets you track your offers in the 'My Bids' section. Feel free to use the filters to narrow down the list, or simply ask me to find exactly what you're looking for. Let me know how I can help!";
  
  const [isVolyOpen, setIsVolyOpen] = useState(false);
  const [hasUnreadVolyMessage, setHasUnreadVolyMessage] = useState(true);
  const [volyInput, setVolyInput] = useState("");
  const [volyHistory, setVolyHistory] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: initialVolyMessage }
  ]);
  const [isVolyLoading, setIsVolyLoading] = useState(false);
  const volyScrollRef = useRef<HTMLDivElement>(null);
  const volyContainerRef = useRef<HTMLDivElement>(null);

  // Bid Form State
  const [bidForm, setBidForm] = useState({
    name: "", amount: "", paymentMode: "Cash", receiveMode: "Pickup", courier: "Motorcycle Courier", agreeAsIs: false, agreeNoWarranty: false,
  });

  // ---------------- DATA FETCHING ----------------
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description');
      const errorCode = params.get('error_code');
      if (errorDesc || errorCode) {
        const message = errorDesc 
          ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) 
          : 'This link is no longer valid.';
        setExpiredLinkMessage(message);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const fetchLaptops = async () => {
    const { data, error } = await supabase.from('laptops').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Error fetching data:", error);
    } else if (data && data.length > 0) {
      const formattedData = data.map(item => ({
        id: item.id, modelType: item.model_type, serialNumber: item.serial_number,
        images: item.images, description: item.description, defectType: item.defect_type,
        specs: item.specs, currentBid: item.current_bid, bidsCount: item.bids_count, viewsCount: item.views_count
      }));
      setLaptops(formattedData);
      if(!selectedLaptop) setSelectedLaptop(formattedData[0]); 
    }
    setIsLoading(false);
  };

  useEffect(() => { if (user) fetchLaptops(); }, [user]);

  // Supabase Realtime: listen for UPDATE events on the laptops table
  useEffect(() => {
    const channel = supabase
      .channel('laptops-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'laptops' }, (payload) => {
        const updated = payload.new as any;
        const formatted = {
          id: updated.id, modelType: updated.model_type, serialNumber: updated.serial_number,
          images: updated.images, description: updated.description, defectType: updated.defect_type,
          specs: updated.specs, currentBid: updated.current_bid, bidsCount: updated.bids_count, viewsCount: updated.views_count,
        };
        setLaptops((prev) => prev.map((l) => (l.id === formatted.id ? { ...l, ...formatted } : l)));
        setSelectedLaptop((prev: any) => (prev && prev.id === formatted.id ? { ...prev, ...formatted } : prev));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'laptops' }, () => { fetchLaptops(); })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'laptops' }, () => { fetchLaptops(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMyBids = async () => {
    if (!user) return setMyBids([]);
    const { data, error } = await supabase
      .from('bids')
      .select(`id, amount, payment_mode, receive_mode, laptops ( id, model_type, serial_number, images, description, defect_type, specs, current_bid, bids_count, views_count )`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formattedBids = data.map((b: any) => {
        const lap = b.laptops;
        const formattedLaptop = {
          id: lap.id, modelType: lap.model_type, serialNumber: lap.serial_number,
          images: lap.images, description: lap.description, defectType: lap.defect_type,
          specs: lap.specs, currentBid: lap.current_bid, bidsCount: lap.bids_count, viewsCount: lap.views_count
        };
        const isWinning = b.amount >= lap.current_bid;
        return {
          id: b.id, laptop: formattedLaptop, status: isWinning ? 'winning' : 'outbid',
          myBid: b.amount, currentHighest: lap.current_bid, recommended: lap.current_bid + 100,
          paymentMode: b.payment_mode, receiveMode: b.receive_mode
        };
      });
      setMyBids(formattedBids);
    }
  };

  useEffect(() => { fetchMyBids(); }, [user, isMyBidsOpen]);

  // ---------------- VIEW TRACKING & CLICK OUTSIDE ----------------
  useEffect(() => {
    if (!selectedLaptop || isMobilePreviewOpen) return; 

    const trackView = async () => {
      const viewedStr = sessionStorage.getItem('viewedLaptops');
      const viewedLaptops = viewedStr ? JSON.parse(viewedStr) : [];

      if (!viewedLaptops.includes(selectedLaptop.id)) {
        viewedLaptops.push(selectedLaptop.id);
        sessionStorage.setItem('viewedLaptops', JSON.stringify(viewedLaptops));

        const newViewsCount = selectedLaptop.viewsCount + 1;
        setSelectedLaptop((prev: any) => ({ ...prev, viewsCount: newViewsCount }));
        setLaptops((prev) => prev.map(l => l.id === selectedLaptop.id ? { ...l, viewsCount: newViewsCount } : l));

        await supabase.from('laptops').update({ views_count: newViewsCount }).eq('id', selectedLaptop.id);
      }
    };
    trackView();
  }, [selectedLaptop?.id, isMobilePreviewOpen]); 

  useEffect(() => {
    if (!isVolyOpen) return;
    function handleClick(e: any) { 
      if (volyContainerRef.current && !volyContainerRef.current.contains(e.target)) {
        if (!e.target.closest('#voly-toggle-btn') && !e.target.closest('#ask-voly-product-btn') && !e.target.closest('#compare-voly-btn')) {
          setIsVolyOpen(false); 
        }
      } 
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isVolyOpen]);

  // ---------------- SIDE EFFECTS ----------------
  useEffect(() => { 
    if(!selectedLaptop) return;
    setImgIdx(0); setZoom(1); setPos({ x: 0, y: 0 }); setIsFlipped(false);
    
    setBidForm(prev => ({ 
      ...prev, amount: String(selectedLaptop.currentBid + 100), paymentMode: "Cash", receiveMode: "Pickup", courier: "Motorcycle Courier", agreeAsIs: false, agreeNoWarranty: false
    }));
  }, [selectedLaptop]);

  useEffect(() => {
    if (volyScrollRef.current) volyScrollRef.current.scrollTop = volyScrollRef.current.scrollHeight;
  }, [volyHistory, isVolyLoading, isVolyOpen]);

  // ---------------- LOGIC & HANDLERS ----------------
  const paymentOptions = [{ label: "Cash", value: "Cash" }, { label: "GCash", value: "GCash" }, { label: "Bank Transfer", value: "Bank Transfer" }];
  const receiveOptions = [{ label: "Pickup", value: "Pickup" }, { label: "Delivery", value: "Delivery" }];
  const courierOptions = [{ label: "Motorcycle Courier (Angkas, Lalamove)", value: "Motorcycle Courier" }, { label: "LBC Express", value: "LBC" }];

  let processedLaptops = [...laptops];
  if (activeFilters.models.length > 0) processedLaptops = processedLaptops.filter(l => activeFilters.models.includes(l.modelType));
  if (activeFilters.defects.length > 0) processedLaptops = processedLaptops.filter(l => activeFilters.defects.includes(l.defectType));
  if (activeFilters.sortBy === "mostViewed") processedLaptops.sort((a, b) => b.viewsCount - a.viewsCount);
  else if (activeFilters.sortBy === "mostBids") processedLaptops.sort((a, b) => b.bidsCount - a.bidsCount);
  const displayedLaptops = processedLaptops.slice(0, visibleCount);

  const handleDoubleClick = () => { if (zoom === 1) setZoom(2.5); else { setZoom(1); setPos({ x: 0, y: 0 }); } };
  const handleMouseDown = (e: any) => { if (zoom > 1) { setIsDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y }); } };
  const handleMouseMove = (e: any) => { if (isDragging && zoom > 1) setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  const getDefectColor = (type: string) => {
    if (type === "Aesthetic Damage") return "text-blue-300 bg-blue-500/10 border-blue-500/20";
    if (type === "Performance Issues") return "text-amber-200 bg-amber-500/10 border-amber-500/20";
    if (type === "Hardware Malfunction") return "text-purple-300 bg-purple-500/10 border-purple-500/20";
    return "text-gray-300 bg-gray-500/10 border-gray-500/20";
  };

  const openLogin = () => {
    setIsSignUp(false);
    setIsForgotPass(false);
    setAuthEmail("");
    setAuthPassword("");
    setIsLoginModalOpen(true);
  };

  const handlePlaceBid = async () => {
    setIsSubmittingBid(true);

    try {
      const bidAmount = Number(bidForm.amount);

      // Atomic check: fetch the live current_bid from the database to prevent race conditions
      const { data: liveData, error: liveError } = await supabase
        .from('laptops')
        .select('current_bid')
        .eq('id', selectedLaptop.id)
        .single();

      if (liveError) throw liveError;

      if (liveData && liveData.current_bid >= bidAmount) {
        // Refresh local state with the live data so the user sees the updated price
        const liveBid = liveData.current_bid;
        setSelectedLaptop((prev: any) => ({ ...prev, currentBid: liveBid }));
        setLaptops((prev) => prev.map(l => l.id === selectedLaptop.id ? { ...l, currentBid: liveBid } : l));
        setBidForm(prev => ({ ...prev, amount: String(liveBid + 100) }));
        setIsBidModalOpen(false);
        setIsStaleBidAlertOpen(true);
        return;
      }

      let previousBidderEmail = null;
      if (selectedLaptop.bidsCount > 0) {
        const { data: prevBidData } = await supabase
          .from('bids')
          .select('email, user_id')
          .eq('laptop_id', selectedLaptop.id)
          .order('amount', { ascending: false })
          .limit(1)
          .single();
          
        if (prevBidData && prevBidData.user_id !== user.id) {
          previousBidderEmail = prevBidData.email;
        }
      }

      await supabase.from('bids').delete().eq('laptop_id', selectedLaptop.id).eq('user_id', user.id);

      const { error: bidError } = await supabase.from('bids').insert({
        laptop_id: selectedLaptop.id, 
        user_id: user.id, 
        full_name: bidForm.name, 
        amount: bidAmount,
        payment_mode: bidForm.paymentMode, 
        receive_mode: bidForm.receiveMode, 
        courier: bidForm.receiveMode === 'Delivery' ? bidForm.courier : null,
        email: user.email 
      });
      if (bidError) throw bidError;

      const { count } = await supabase.from('bids').select('*', { count: 'exact', head: true }).eq('laptop_id', selectedLaptop.id);
      const newBidsCount = count || 0;

      const { error: laptopError } = await supabase.from('laptops').update({ current_bid: bidAmount, bids_count: newBidsCount }).eq('id', selectedLaptop.id);
      if (laptopError) throw laptopError;
      
      if (previousBidderEmail) {
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            previousBidderEmail,
            laptopModel: selectedLaptop.modelType,
            newBidAmount: bidAmount
          })
        }).catch(err => console.error("Failed to trigger email API", err)); 
      }

      await fetchLaptops(); 
      await fetchMyBids();
      setSelectedLaptop((prev: any) => ({ ...prev, currentBid: bidAmount, bidsCount: newBidsCount }));

      setLastPlacedBid(bidAmount);
      setIsBidModalOpen(false);
      setIsSuccessModalOpen(true);
      setBidForm(prev => ({ ...prev, amount: String(bidAmount + 100), agreeAsIs: false, agreeNoWarranty: false }));

    } catch (error: any) {
      alert("Failed to place bid: " + error.message);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const confirmCancelBid = async () => {
    if(!bidToCancel) return;
    setIsCanceling(true);

    try {
      const { bidId, laptopId } = bidToCancel;

      const { error: deleteError } = await supabase.from('bids').delete().eq('id', bidId);
      if (deleteError) throw deleteError;

      const { data: remainingBids, error: fetchError } = await supabase
        .from('bids').select('amount').eq('laptop_id', laptopId).order('amount', { ascending: false });
      if (fetchError) throw fetchError;

      const newBidsCount = remainingBids ? remainingBids.length : 0;
      let newCurrentBid = 0;

      if (newBidsCount > 0) {
        newCurrentBid = remainingBids![0].amount;
      } else {
        const lap = laptops.find(l => l.id === laptopId);
        newCurrentBid = lap ? Math.max(lap.currentBid - 100, 0) : 0;
      }

      const { error: updateError } = await supabase.from('laptops')
        .update({ current_bid: newCurrentBid, bids_count: newBidsCount }).eq('id', laptopId);
      if (updateError) throw updateError;

      await fetchLaptops();
      await fetchMyBids();
      if (selectedLaptop && selectedLaptop.id === laptopId) {
        setSelectedLaptop((prev: any) => ({ ...prev, currentBid: newCurrentBid, bidsCount: newBidsCount }));
      }
      
      setBidToCancel(null);

    } catch (error: any) {
      alert("Failed to cancel bid: " + error.message);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleAuth = async () => {
    try {
      if (isForgotPass) {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        setIsLoginModalOpen(false);
        setIsResetSentOpen(true);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email: authEmail, 
          password: authPassword,
          options: { data: { full_name: authFullName } }
        });
        if (error) throw error;
        setIsLoginModalOpen(false);
        setIsSignUpSuccessOpen(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setIsLoginModalOpen(false);
        setIsLoginSuccessOpen(true); 
      }
      setAuthEmail(""); setAuthPassword(""); setAuthFullName("");
    } catch (error: any) { 
      setAuthErrorMsg(error.message); 
    }
  };

  const handleLandingAuth = async () => {
    setLandingAuthError("");
    let showCheckEmail = false;
    try {
      if (isForgotPass) {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        showCheckEmail = true;
      } else if (isMagicLinkMode) {
        const { error } = await supabase.auth.signInWithOtp({ email: authEmail });
        if (error) throw error;
        showCheckEmail = true;
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email: authEmail, 
          password: authPassword,
          options: { data: { full_name: authFullName } }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
      }
      setAuthPassword(""); setAuthFullName("");
      if (showCheckEmail) {
        setIsMagicLinkSent(true);
      } else {
        setAuthEmail("");
      }
    } catch (error: any) {
      setLandingAuthError(error.message);
    }
  };

  const toggleCompare = (id: number) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleVolyMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || volyInput;
    if (!textToSend.trim()) return;

    const newHistory = [...volyHistory, { role: 'user', content: textToSend }];
    setVolyHistory(newHistory as any);
    setVolyInput("");
    setIsVolyLoading(true);

    try {
      const res = await fetch('/api/voly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, history: volyHistory, laptops: laptops })
      });
      const data = await res.json();
      
      if (data.filters) {
        setActiveFilters((prev: any) => ({
          ...prev,
          models: data.filters.models || [],
          defects: data.filters.defects || []
        }));
      }

      if (data.reply) {
        setVolyHistory([...newHistory, { role: 'assistant', content: data.reply }] as any);
      } else {
        setVolyHistory([...newHistory, { role: 'assistant', content: "I encountered an error connecting to the mainframe." }] as any);
      }
    } catch (error) {
      setVolyHistory([...newHistory, { role: 'assistant', content: "Network error. Please check your connection." }] as any);
    } finally {
      setIsVolyLoading(false);
    }
  };

  const isFormValid = bidForm.name.trim() !== "" && Number(bidForm.amount) >= (selectedLaptop?.currentBid + 100) && bidForm.agreeAsIs && bidForm.agreeNoWarranty;

  const activeUserBid = selectedLaptop ? myBids.find((b) => b.laptop.id === selectedLaptop.id) : null;

  // ---------------- RENDER ----------------

  if (isAuthChecking) {
    return (
      <div className="h-screen w-full bg-[#0d1117] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#21262d] border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-20 px-6 sm:px-10 max-w-6xl mx-auto w-full py-12">
          
          {/* Robot/Mascot Area */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 lg:w-[32rem] lg:h-[32rem] bg-blue-500/5 rounded-full blur-3xl"></div>
            <img 
              src="/voly.png" 
              alt="Voly" 
              className="w-[19rem] h-[19rem] sm:w-[24.5rem] sm:h-[24.5rem] lg:w-[31.5rem] lg:h-[31.5rem] relative z-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.15)] object-contain"
            />
          </div>

          {/* Content Area */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md w-full">
            
            {landingView === 'hero' && (
              <>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.15] mb-4 tracking-tight">
                  Affordable laptops in your fingertips
                </h1>
                <p className="text-gray-400 text-sm sm:text-[15px] mb-10 leading-relaxed">
                  Powered by Voly, our dependable AI-Agent to assist you from browsing to check out.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto lg:mx-0">
                  <button 
                    onClick={() => { setLandingView('form'); setIsSignUp(true); setIsForgotPass(false); setLandingAuthError(""); setIsMagicLinkMode(false); setIsMagicLinkSent(false); }}
                    className="w-full py-3.5 rounded-xl bg-[#2563eb] text-white font-bold text-[15px] hover:bg-[#1d4ed8] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    Sign Up
                  </button>
                  <button 
                    onClick={() => { setLandingView('form'); setIsSignUp(false); setIsForgotPass(false); setLandingAuthError(""); setIsMagicLinkMode(false); setIsMagicLinkSent(false); }}
                    className="w-full py-3.5 rounded-xl bg-transparent text-gray-300 font-bold text-[15px] border border-[#30363d] hover:bg-[#161b22] hover:text-white hover:border-gray-500 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </>
            )}
            
            {landingView === 'form' && !isMagicLinkSent && (
              <>
                <button 
                  onClick={() => { setLandingView('hero'); setLandingAuthError(""); setIsForgotPass(false); setIsMagicLinkMode(false); }}
                  className="mb-6 text-gray-500 hover:text-white text-sm flex items-center gap-2 transition cursor-pointer lg:self-start self-center"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  Back
                </button>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                  {isForgotPass ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  {isForgotPass 
                    ? "Enter your email and we'll send you a reset link." 
                    : isSignUp 
                      ? 'Sign up with your company email to start bidding.' 
                      : 'Sign in to continue where you left off.'}
                </p>
                
                {landingAuthError && (
                  <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    {landingAuthError}
                  </div>
                )}
                
                <div className="space-y-4 w-full">
                  {isSignUp && !isMagicLinkMode && !isForgotPass && (
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Juan Dela Cruz" 
                        value={authFullName} 
                        onChange={(e) => setAuthFullName(e.target.value)} 
                        className="w-full bg-[#161b22] border border-[#30363d] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 outline-none text-sm transition" 
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="you@company.com" 
                      value={authEmail} 
                      onChange={(e) => setAuthEmail(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (isMagicLinkMode || isForgotPass) && handleLandingAuth()}
                      className="w-full bg-[#161b22] border border-[#30363d] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 outline-none text-sm transition" 
                    />
                  </div>
                  
                  {!isMagicLinkMode && !isForgotPass && (
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={authPassword} 
                        onChange={(e) => setAuthPassword(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleLandingAuth()}
                        className="w-full bg-[#161b22] border border-[#30363d] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 outline-none text-sm transition" 
                      />
                    </div>
                  )}
                  
                  <button 
                    onClick={handleLandingAuth}
                    className="w-full py-3.5 rounded-xl bg-[#2563eb] text-white font-bold text-[15px] hover:bg-[#1d4ed8] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    {isForgotPass ? 'Send Reset Link' : isMagicLinkMode ? 'Send Magic Link' : isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                  
                  {!isForgotPass && (
                    <>
                      <div className="flex items-center gap-4 py-1">
                        <div className="flex-1 h-px bg-[#30363d]"></div>
                        <span className="text-xs text-gray-600">or</span>
                        <div className="flex-1 h-px bg-[#30363d]"></div>
                      </div>
                      
                      <button 
                        onClick={() => { setIsMagicLinkMode(!isMagicLinkMode); setLandingAuthError(""); }}
                        className="w-full py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-gray-400 font-medium text-sm hover:text-gray-200 hover:border-gray-500 transition cursor-pointer"
                      >
                        {isMagicLinkMode ? 'Use password instead' : 'Continue with Magic Link'}
                      </button>
                    </>
                  )}
                </div>
                
                <div className="mt-6 flex flex-col gap-3 text-center w-full">
                  {!isForgotPass && (
                    <button 
                      onClick={() => { 
                        setIsSignUp(!isSignUp); 
                        setIsMagicLinkMode(false); 
                        setLandingAuthError(""); 
                        setAuthFullName(""); 
                      }}
                      className="text-sm text-gray-500 hover:text-white transition cursor-pointer underline underline-offset-4"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                  )}
                  
                  {!isSignUp && !isForgotPass && !isMagicLinkMode && (
                    <button 
                      onClick={() => { setIsForgotPass(true); setLandingAuthError(""); }}
                      className="text-xs text-gray-600 hover:text-gray-400 transition cursor-pointer"
                    >
                      Forgot your password?
                    </button>
                  )}
                  
                  {isForgotPass && (
                    <button 
                      onClick={() => { setIsForgotPass(false); setLandingAuthError(""); }}
                      className="text-sm text-gray-500 hover:text-white transition cursor-pointer underline underline-offset-4"
                    >
                      Back to Sign In
                    </button>
                  )}
                </div>
              </>
            )}
            
            {landingView === 'form' && isMagicLinkSent && (
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  {isForgotPass 
                    ? <>We&apos;ve sent a password reset link to <strong className="text-gray-200">{authEmail}</strong>. Please check your inbox.</>
                    : <>We&apos;ve sent a magic link to <strong className="text-gray-200">{authEmail}</strong>. Click the link in your email to sign in.</>
                  }
                </p>
                <button 
                  onClick={() => { setIsMagicLinkSent(false); setIsForgotPass(false); setLandingView('hero'); setAuthEmail(""); }}
                  className="py-3 px-8 rounded-xl bg-[#161b22] border border-[#30363d] text-gray-300 font-bold hover:text-white hover:border-gray-500 transition cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            )}
            
          </div>
        </div>
        
        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-gray-600 text-xs tracking-wide">Voly.ai, 2026 | Courtesy of <a href="https://volenday.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">volenday.com</a></p>
        </div>
        
        {/* Sparkle decoration */}
        <div className="absolute bottom-20 right-8 text-gray-700 hidden sm:block">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/></svg>
        </div>

        {/* Expired / Invalid Link Modal */}
        {expiredLinkMessage && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Link Expired</h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
                The link you clicked is no longer valid. Magic links expire after a short period for security. Please request a new one.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setExpiredLinkMessage("")} 
                  className="flex-1 py-3 rounded-xl bg-[#21262d] text-gray-300 font-bold hover:bg-[#30363d] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => { 
                    setExpiredLinkMessage(""); 
                    setLandingView('form'); 
                    setIsSignUp(false); 
                    setIsMagicLinkMode(true); 
                    setIsForgotPass(false); 
                  }} 
                  className="flex-1 py-3 rounded-xl bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] active:scale-[0.98] transition-all cursor-pointer shadow-lg text-sm sm:text-base"
                >
                  Get New Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading || !selectedLaptop) {
    return (
      <div className="h-screen w-full bg-[#131314] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#2a2b2f] border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium tracking-wide animate-pulse">Loading live inventory...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#131314] text-gray-200 font-sans overflow-hidden relative">
      
      {/* ======================================================== 
        📱 LEFT SIDE: PREVIEW BOX 
        FIX: Removed lg:border-r border-[#2a2b2f] to remove the visible middle line
        ======================================================== 
      */}
      <div className={`
        w-full lg:w-[50%] flex-col px-3 sm:px-6 py-4 lg:p-8 custom-scrollbar overflow-y-auto shrink-0 bg-[#131314]
        ${isMobilePreviewOpen ? 'fixed inset-0 z-[150] flex animate-in fade-in zoom-in-95 duration-200 lg:relative lg:inset-auto lg:z-auto lg:animate-none' : 'hidden lg:flex relative'}
      `}>
        
        {/* MOBILE CLOSE BUTTON */}
        <button 
          onClick={() => setIsMobilePreviewOpen(false)} 
          className="lg:hidden absolute top-4 right-4 z-[160] bg-[#1e1f20] border border-[#2a2b2f] text-gray-400 hover:text-white p-2.5 rounded-full shadow-2xl cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="max-w-2xl mx-auto w-full my-auto pb-4 mt-8 lg:mt-0 flex flex-col justify-center min-h-full">
          <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-white tracking-tight hidden lg:block">Company Asset Sale</h1>
          <p className="text-gray-400 mb-6 text-sm hidden lg:block">Select a laptop from the grid to view details and place your bid.</p>
          
          <div className="bg-[#1e1f20] p-4 sm:p-5 lg:p-6 rounded-2xl border border-[#2a2b2f] shadow-2xl">
            
            {/* CAROUSEL HEADER */}
            <div 
              className="relative w-full h-44 sm:h-56 lg:h-52 mb-4 lg:mb-5 rounded-xl overflow-hidden shadow-md group/carousel bg-black cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity pointer-events-none z-30 border border-white/20 shadow-xl hidden sm:block">
                Click to view full screen
              </div>

              <img 
                src={selectedLaptop.images[imgIdx]} 
                alt={selectedLaptop.modelType}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/carousel:scale-105 opacity-90 group-hover/carousel:opacity-100"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); setImgIdx(prev => (prev === 0 ? selectedLaptop.images.length - 1 : prev - 1)); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 text-white flex items-center justify-center transition-colors hover:bg-black border border-white/10 shadow-lg backdrop-blur-sm z-20"
              ><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
              <button 
                onClick={(e) => { e.stopPropagation(); setImgIdx(prev => (prev === selectedLaptop.images.length - 1 ? 0 : prev + 1)); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 text-white flex items-center justify-center transition-colors hover:bg-black border border-white/10 shadow-lg backdrop-blur-sm z-20"
              ><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {selectedLaptop.images.map((_: any, i: number) => (
                  <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-md ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </div>

            {/* TWO COLUMN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
              
              {/* COLUMN A: Info & Specs */}
              <div className="w-full lg:w-[55%] flex flex-col">
                <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight mb-1">{selectedLaptop.modelType}</h2>
                <p className="text-gray-400 font-mono tracking-wider mb-2 lg:mb-4 text-xs sm:text-sm">S/N: <span className="text-gray-200">{selectedLaptop.serialNumber}</span></p>
                <div className="mb-3 lg:mb-4"><span className={`text-[10px] sm:text-xs px-3 py-1.5 rounded font-medium border ${getDefectColor(selectedLaptop.defectType)}`}>{selectedLaptop.defectType}</span></div>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 lg:mb-5 leading-relaxed">{selectedLaptop.description}</p>
                <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 lg:mb-3">Hardware Specs</h3>
                <div className="grid grid-cols-2 gap-2 lg:gap-3 text-xs sm:text-sm">
                  <div className="bg-[#131314] p-2.5 lg:p-3 rounded-lg border border-[#2a2b2f]"><span className="block text-gray-500 text-[9px] lg:text-[10px] uppercase mb-0.5">Processor</span><span className="text-gray-200 font-medium">{selectedLaptop.specs.cpu}</span></div>
                  <div className="bg-[#131314] p-2.5 lg:p-3 rounded-lg border border-[#2a2b2f]"><span className="block text-gray-500 text-[9px] lg:text-[10px] uppercase mb-0.5">Memory</span><span className="text-gray-200 font-medium">{selectedLaptop.specs.ram}</span></div>
                  <div className="bg-[#131314] p-2.5 lg:p-3 rounded-lg border border-[#2a2b2f]"><span className="block text-gray-500 text-[9px] lg:text-[10px] uppercase mb-0.5">Storage</span><span className="text-gray-200 font-medium">{selectedLaptop.specs.storage}</span></div>
                  <div className="bg-[#131314] p-2.5 lg:p-3 rounded-lg border border-[#2a2b2f]"><span className="block text-gray-500 text-[9px] lg:text-[10px] uppercase mb-0.5">OS</span><span className="text-gray-200 font-medium">{selectedLaptop.specs.os}</span></div>
                </div>
              </div>

              {/* COLUMN B: 3D Flip Card */}
              <div className="w-full lg:w-[45%] relative [perspective:1000px] h-[260px] sm:h-[300px] lg:h-[340px]">
                <div className={`w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'}`}>
                  
                  {/* FRONT FACE: Bids & Actions */}
                  <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col justify-between bg-[#131314] p-4 lg:p-6 rounded-xl border border-[#2a2b2f]">
                    <div>
                      <div className="flex items-center gap-1.5 bg-[#2a2b2f] px-3 py-1.5 rounded-md text-xs sm:text-sm text-gray-300 w-fit mb-2 lg:mb-4 border border-[#3a3b3f]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span className="font-semibold">{selectedLaptop.bidsCount} Active Bids</span>
                      </div>
                      <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-wider font-bold mb-1 lg:mb-2">Current Highest Bid</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-0 lg:mb-4">₱{selectedLaptop.currentBid.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:gap-3 mt-auto">
                      {activeUserBid ? (
                        <button 
                          onClick={() => setBidToCancel({ bidId: activeUserBid.id, laptopId: selectedLaptop.id })} 
                          className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm lg:text-base border border-red-500/20 hover:bg-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 flex items-center justify-center cursor-pointer whitespace-nowrap px-2"
                        >
                          Cancel Bid (₱{activeUserBid.myBid.toLocaleString()})
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if (!user) setIsLoginRequiredOpen(true);
                            else setIsBidModalOpen(true);
                          }} 
                          className="w-full py-3 lg:py-4 rounded-xl bg-gray-100 text-black font-bold text-base lg:text-lg hover:bg-gray-300 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                        >
                          Place Bid
                        </button>
                      )}
                      
                      <button 
                        id="ask-voly-product-btn"
                        onClick={() => { 
                          setIsVolyOpen(true);
                          setHasUnreadVolyMessage(false);
                          handleVolyMessage(`Give me a bold, definitive opinion on whether I should buy this specific ${selectedLaptop.modelType} (S/N: ${selectedLaptop.serialNumber}) for ₱${selectedLaptop.currentBid}.`);
                        }}
                        className="w-full py-3 lg:py-3.5 rounded-xl bg-[#2a2b2f] text-gray-300 font-medium text-xs lg:text-sm hover:bg-[#3a3b3f] hover:text-blue-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border border-[#3a3b3f] cursor-pointer"
                      >
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Voly&backgroundColor=transparent" className="w-4 h-4 lg:w-5 lg:h-5 opacity-80" alt="Voly" />
                        Ask Voly about this
                      </button>
                      
                      <button 
                        onClick={() => setIsFlipped(true)} 
                        className="text-[10px] lg:text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1 lg:mt-2 text-center w-full underline underline-offset-4 cursor-pointer"
                      >
                        View Bidding Rules & Payments
                      </button>
                    </div>
                  </div>

                  {/* BACK FACE: ONLY Rules & Payments Now */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col bg-[#131314] p-4 lg:p-5 rounded-xl border border-[#2a2b2f]">
                    <div className="flex flex-col h-full">
                      <h3 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2 mt-2 px-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Bidding Rules
                      </h3>
                      <ul className="text-[10px] lg:text-xs text-gray-400 space-y-2 list-disc list-inside mb-6 px-1">
                        <li>Minimum increment is <span className="text-gray-200 font-medium">₱100</span>.</li>
                        <li>Entered bid amount is final.</li>
                        <li>Items are sold strictly "as is".</li>
                        <li>There is no warranty for any items.</li>
                      </ul>
                      
                      <div className="flex flex-col items-center mt-auto mb-6">
                        <h3 className="text-[9px] lg:text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Accepted Payments</h3>
                        <div className="flex items-center justify-center gap-3 lg:gap-4">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1e1f20] border border-[#2a2b2f] flex items-center justify-center text-emerald-400 shadow-sm" title="Cash"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg></div>
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1e1f20] border border-[#2a2b2f] flex items-center justify-center shadow-sm overflow-hidden p-1.5 lg:p-2" title="GCash"><img src="https://upload.wikimedia.org/wikipedia/commons/5/52/GCash_logo.svg" alt="GCash" className="w-full h-full object-contain" /></div>
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1e1f20] border border-[#2a2b2f] flex items-center justify-center text-gray-300 shadow-sm" title="Bank Transfer"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg></div>
                        </div>
                      </div>

                      <button onClick={() => setIsFlipped(false)} className="text-[10px] lg:text-xs text-gray-500 hover:text-gray-300 transition-colors mt-auto text-center w-full underline underline-offset-4 cursor-pointer">
                        Exit Bidding Rules & Payments
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== 
        📱 RIGHT SIDE: MAIN GRID (Becomes main view on mobile)
        ======================================================== 
      */}
      <div className="w-full lg:w-[50%] flex flex-col overflow-auto custom-scrollbar bg-[#101112] relative z-0">
        
        <div className="sticky top-0 z-40 bg-[#101112]/90 backdrop-blur-xl px-4 lg:px-8 py-4 lg:py-6 flex justify-between items-center border-b border-[#2a2b2f]/50 shadow-sm">
          
          {/* MOBILE RESPONSIVE HEADER: Shows Logo on all screens, switches text on mobile */}
          <div className="flex items-center gap-3 truncate pr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0 shadow-lg border border-blue-400/20">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>
            </div>
            <h3 className="text-base lg:text-xl font-bold text-white truncate">
              <span className="lg:hidden">Asset Sale</span>
              <span className="hidden lg:inline">Available <span className="text-gray-500 text-sm ml-1 font-normal">({processedLaptops.length})</span></span>
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            <FilterSortDropdown activeFilters={activeFilters} onApply={(f: any) => { setActiveFilters(f); setVisibleCount(6); }} />
            <div className="h-6 sm:h-8 w-px bg-[#2a2b2f] hidden sm:block"></div>
            <ProfileDropdown 
              user={user}
              myBidsCount={myBids.length}
              onLoginClick={openLogin} 
              onMyBidsClick={() => setIsMyBidsOpen(true)} 
              onLogOutClick={async () => { 
                await supabase.auth.signOut(); 
                setLandingView('hero'); 
                setLandingAuthError(""); 
                setIsMagicLinkSent(false); 
                setIsMagicLinkMode(false);
              }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
            {displayedLaptops.map((laptop) => (
              <LaptopCard
                key={laptop.id}
                images={laptop.images}
                modelType={laptop.modelType}
                serialNumber={laptop.serialNumber}
                defectType={laptop.defectType}
                currentBid={laptop.currentBid}
                bidsCount={laptop.bidsCount}
                viewsCount={laptop.viewsCount}
                isSelected={selectedLaptop?.id === laptop.id}
                onClick={() => {
                  setSelectedLaptop(laptop);
                  if (window.innerWidth < 1024) {
                    setIsMobilePreviewOpen(true);
                  }
                }}
                
                isCompared={compareIds.includes(laptop.id)}
                onToggleCompare={(e: any) => {
                  e.stopPropagation(); 
                  toggleCompare(laptop.id);
                }}
              />
            ))}
          </div>
          {visibleCount < processedLaptops.length && (
            <div className="mt-8 sm:mt-10 flex justify-center pb-10">
              <button onClick={() => setVisibleCount(prev => prev + 6)} className="px-6 py-2.5 rounded-full border border-gray-600 text-gray-300 font-medium hover:bg-[#1e1f20] hover:text-white active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer shadow-sm">
                Load More Laptops
              </button>
            </div>
          )}
          <div className={compareIds.length > 0 ? "pb-32" : "pb-24"} /> 
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📊 FLOATING COMPARE BAR */}
      {/* ======================================================== */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-24 lg:bottom-10 right-1/2 translate-x-1/2 lg:right-1/4 lg:translate-x-1/2 z-[80] bg-[#1e1f20]/95 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] rounded-full pl-5 lg:pl-6 pr-2 lg:pr-3 py-2 flex items-center gap-3 lg:gap-4 animate-in slide-in-from-bottom-10 duration-300 w-max max-w-[90vw]">
          <span className="text-xs lg:text-sm font-bold text-white whitespace-nowrap">{compareIds.length} <span className="font-normal text-gray-400 hidden sm:inline">selected</span></span>
          <div className="h-4 lg:h-5 w-px bg-[#3a3b3f]"></div>
          <button 
            id="compare-voly-btn"
            onClick={() => {
              const selectedLaps = laptops.filter(l => compareIds.includes(l.id));
              const names = selectedLaps.map(l => `${l.modelType} (S/N: ${l.serialNumber})`).join(", ");
              setIsVolyOpen(true);
              setHasUnreadVolyMessage(false);
              handleVolyMessage(`Can you compare these specific laptops for me: ${names}? Please weigh the pros and cons of their specs and defects.`);
            }} 
            className="text-xs lg:text-sm font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Voly&backgroundColor=transparent" className="w-3 h-3 lg:w-4 lg:h-4 opacity-80" alt="Voly" />
            <span className="hidden sm:inline">Compare with Voly</span>
            <span className="sm:hidden">Compare</span>
          </button>
          <button onClick={() => setCompareIds([])} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-full bg-[#131314] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer border border-[#2a2b2f] shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}


      {/* ======================================================== */}
      {/* 🤖 VOLY - THE GLOBAL AI AGENT */}
      {/* ======================================================== */}

      {/* Voly Floating Components Wrapper */}
      <div className="fixed bottom-6 left-4 lg:left-10 z-[90] flex flex-col items-start gap-3 pointer-events-none">
        
        {/* Unread Sneak Peek Bubble */}
        {!isVolyOpen && hasUnreadVolyMessage && (
          <div 
            className="relative bg-[#1e1f20]/95 backdrop-blur-xl border border-blue-500/30 p-3.5 rounded-2xl rounded-bl-none shadow-2xl w-64 md:w-72 pointer-events-auto cursor-pointer animate-bounce origin-bottom-left" 
            style={{ animationDuration: '2s' }} 
            onClick={() => { setIsVolyOpen(true); setHasUnreadVolyMessage(false); }}
          >
            <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
              Hi! I'm Voly, your personal assistant for today's internal laptop auction. We're clearing out...
            </p>
            <span className="text-[10px] text-blue-400 font-bold mt-1.5 block uppercase tracking-wider">Click to read more</span>
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-[#1e1f20]/95 border-b border-l border-blue-500/30 transform -rotate-45"></div>
          </div>
        )}

        {/* Voly Toggle Button */}
        <button 
          id="voly-toggle-btn"
          onClick={() => { setIsVolyOpen(!isVolyOpen); setHasUnreadVolyMessage(false); }} 
          className="pointer-events-auto bg-[#1e1f20]/90 backdrop-blur-md border border-[#2a2b2f] shadow-2xl rounded-full pl-1.5 pr-4 py-1.5 lg:pl-2 lg:pr-5 lg:py-2 flex items-center gap-2 lg:gap-3 transition-all duration-300 hover:scale-105 hover:bg-[#2a2b2f] group relative"
        >
          <div className="relative">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Voly&backgroundColor=131314" alt="Voly Logo" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-[#3a3b3f]" />
            {/* Unread Red Badge on Voly */}
            {hasUnreadVolyMessage && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm border-2 border-[#1e1f20]">
                1
              </span>
            )}
          </div>
          <span className="text-xs lg:text-sm font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">Ask Voly</span>
        </button>
      </div>

      <div 
        ref={volyContainerRef}
        className={`fixed bottom-20 lg:bottom-24 left-4 lg:left-10 z-[100] w-[calc(100vw-32px)] md:w-[380px] h-[60vh] lg:h-[500px] max-h-[70vh] bg-[#101112]/95 backdrop-blur-3xl border border-[#2a2b2f] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left ${isVolyOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 pointer-events-none translate-y-10'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2b2f] bg-[#1e1f20]/50">
          <div className="flex items-center gap-2.5">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Voly&backgroundColor=131314" className="w-7 h-7 rounded-full border border-[#3a3b3f]" alt="Voly" />
            <span className="font-bold text-white text-sm tracking-wide">Voly</span>
            <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">Agent</span>
          </div>
          <button onClick={() => setIsVolyOpen(false)} className="text-gray-500 hover:text-white p-1 rounded-md transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div ref={volyScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
          
          {/* MAP VOLY CHAT HISTORY */}
          {volyHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`px-4 py-3 rounded-xl text-xs sm:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#1e1f20] text-gray-200 border border-[#2a2b2f] shadow-lg rounded-bl-sm'}`}>
                {/* Parse paragraphs cleanly */}
                {msg.content.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Render Quick Action Buttons below Voly's Intro Message */}
          {volyHistory.length === 1 && (
            <div className="flex flex-wrap justify-start gap-2 mt-1">
              <button onClick={() => handleVolyMessage("Find me a laptop good for basic school tasks.")} className="bg-[#1e1f20] hover:bg-[#2a2b2f] text-[10px] sm:text-[11px] border border-[#2a2b2f] px-3 py-1.5 rounded-full transition-colors cursor-pointer text-gray-300 shadow-sm">"Good for school tasks"</button>
              <button onClick={() => handleVolyMessage("Show me laptops that are damaged visually but work fine.")} className="bg-[#1e1f20] hover:bg-[#2a2b2f] text-[10px] sm:text-[11px] border border-[#2a2b2f] px-3 py-1.5 rounded-full transition-colors cursor-pointer text-gray-300 shadow-sm">"Only aesthetic damage"</button>
            </div>
          )}

          {isVolyLoading && (
            <div className="self-start px-4 py-3 bg-[#1e1f20] border border-[#2a2b2f] text-gray-400 rounded-xl rounded-bl-sm flex gap-1.5 items-center shadow-lg">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#2a2b2f] bg-[#1a1b1e]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask Voly to find you a laptop..." 
              value={volyInput}
              onChange={(e) => setVolyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVolyMessage()}
              className="w-full bg-[#131314] border border-[#2a2b2f] rounded-lg pl-4 pr-12 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500/50 transition shadow-inner" 
            />
            <button 
              onClick={() => handleVolyMessage()}
              disabled={!volyInput.trim() || isVolyLoading}
              className={`absolute right-2 p-1.5 rounded-md transition-colors ${volyInput.trim() && !isVolyLoading ? 'text-blue-400 hover:bg-blue-500/10 cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- OVERLAYS ---------------- */}

      {/* LIGHTBOX OVERLAY */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center overflow-hidden" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}>
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-white z-50 p-3 bg-white/5 rounded-full hover:bg-white/10 transition cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          <button onClick={(e) => { e.stopPropagation(); setImgIdx(prev => (prev === 0 ? selectedLaptop.images.length - 1 : prev - 1)); }} className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-50 p-3 lg:p-4 bg-white/5 rounded-full hover:bg-white/10 transition cursor-pointer"><svg width="24" height="24" className="lg:w-7 lg:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button onClick={(e) => { e.stopPropagation(); setImgIdx(prev => (prev === selectedLaptop.images.length - 1 ? 0 : prev + 1)); }} className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-50 p-3 lg:p-4 bg-white/5 rounded-full hover:bg-white/10 transition cursor-pointer"><svg width="24" height="24" className="lg:w-7 lg:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg></button>
          <div className="w-full h-full flex items-center justify-center p-4 lg:p-12" onDoubleClick={handleDoubleClick} onMouseDown={handleMouseDown}>
            <img src={selectedLaptop.images[imgIdx]} alt="Fullscreen" className="max-w-full max-h-full object-contain pointer-events-none select-none" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`, transition: isDragging ? 'none' : 'transform 0.2s ease-in-out', cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }} />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-[10px] lg:text-sm pointer-events-none font-medium tracking-wide bg-black/40 px-4 py-2 rounded-full whitespace-nowrap">Double-click to zoom. Drag to pan.</div>
        </div>
      )}

      {/* CUSTOM AUTH ERROR MODAL */}
      {authErrorMsg && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Authentication Error</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">{authErrorMsg}</p>
            <button 
              onClick={() => { setAuthErrorMsg(null); openLogin(); }} 
              className="w-full py-3.5 rounded-xl bg-[#2a2b2f] text-gray-200 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM LOGIN REQUIRED MODAL */}
      {isLoginRequiredOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              You must be logged in to place a bid on this item.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsLoginRequiredOpen(false)} 
                className="flex-1 py-3 rounded-xl bg-[#2a2b2f] text-gray-300 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={() => { setIsLoginRequiredOpen(false); openLogin(); }} 
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg text-sm sm:text-base"
              >
                Log In Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN & SIGNUP MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
              {isForgotPass ? "Reset Password" : isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            
            <div className="space-y-4">
              {isSignUp && !isForgotPass && (
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Juan Dela Cruz" 
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    className="w-full bg-[#131314] border border-[#2a2b2f] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 outline-none text-sm transition" 
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#131314] border border-[#2a2b2f] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 outline-none text-sm transition" 
                />
              </div>
              
              {!isForgotPass && (
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#131314] border border-[#2a2b2f] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 outline-none text-sm transition" 
                  />
                </div>
              )}
              
              <button 
                onClick={handleAuth}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-gray-100 text-black font-bold text-sm sm:text-base hover:bg-gray-300 active:scale-[0.98] transition-all duration-200 mt-2 cursor-pointer shadow-lg"
              >
                {isForgotPass ? "Send Reset Link" : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-center">
              {!isForgotPass && !isSignUp && (
                <button onClick={() => setIsForgotPass(true)} className="text-xs sm:text-sm text-gray-400 hover:text-white transition cursor-pointer">
                  Forgot your password?
                </button>
              )}
              
              {isForgotPass ? (
                <button onClick={() => setIsForgotPass(false)} className="text-xs sm:text-sm text-gray-400 hover:text-white transition cursor-pointer underline underline-offset-4">
                  Back to Sign In
                </button>
              ) : (
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs sm:text-sm text-gray-400 hover:text-white transition cursor-pointer underline underline-offset-4">
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESET LINK SENT MODAL */}
      {isResetSentOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Reset Link Sent!</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              If an account exists for <strong className="text-gray-200">{authEmail}</strong>, we have sent a password reset link to it. Please check your inbox.
            </p>
            <button 
              onClick={() => setIsResetSentOpen(false)} 
              className="w-full py-3.5 rounded-xl bg-[#2a2b2f] text-gray-200 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* LOGIN SUCCESS MODAL */}
      {isLoginSuccessOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              You have successfully logged in. You can now securely place bids and track your activity.
            </p>
            <button 
              onClick={() => setIsLoginSuccessOpen(false)} 
              className="w-full py-3.5 rounded-xl bg-[#2a2b2f] text-gray-200 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Let's Go
            </button>
          </div>
        </div>
      )}

      {/* SIGN UP SUCCESS MODAL */}
      {isSignUpSuccessOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              Welcome aboard! Your account has been successfully set up. You can now place bids and chat with Voly.
            </p>
            <button 
              onClick={() => setIsSignUpSuccessOpen(false)} 
              className="w-full py-3.5 rounded-xl bg-[#2a2b2f] text-gray-200 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* PLACE BID MODAL */}
      {isBidModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-md p-5 sm:p-8 shadow-2xl relative my-auto">
            <button onClick={() => setIsBidModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Place Your Bid</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 pb-4 border-b border-[#2a2b2f]">You are bidding on: <span className="text-gray-200 font-semibold">{selectedLaptop.modelType} ({selectedLaptop.serialNumber})</span></p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Juan Dela Cruz" value={bidForm.name} onChange={(e) => setBidForm({...bidForm, name: e.target.value})} className="w-full bg-[#131314] border border-[#2a2b2f] text-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 outline-none text-sm placeholder-gray-600 transition" />
              </div>
              
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Bid Amount (₱)</span>
                  <span className="text-gray-500 font-normal normal-case">Min: ₱{(selectedLaptop?.currentBid + 100).toLocaleString()}</span>
                </label>
                <input type="number" step="100" min={selectedLaptop?.currentBid + 100} placeholder={`Minimum ₱${selectedLaptop?.currentBid + 100}`} value={bidForm.amount} onChange={(e) => setBidForm({...bidForm, amount: e.target.value})} className="w-full bg-[#131314] border border-[#2a2b2f] text-white font-bold rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 outline-none text-base sm:text-lg placeholder-gray-600 transition" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Payment Mode</label>
                  <CustomDropdown value={bidForm.paymentMode} onChange={(v: string) => setBidForm({...bidForm, paymentMode: v})} options={paymentOptions} fullWidth={true} />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Receive Mode</label>
                  <CustomDropdown value={bidForm.receiveMode} onChange={(v: string) => setBidForm({...bidForm, receiveMode: v})} options={receiveOptions} fullWidth={true} />
                </div>
              </div>

              {bidForm.receiveMode === "Delivery" && (
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Courier</label>
                  <CustomDropdown value={bidForm.courier} onChange={(v: string) => setBidForm({...bidForm, courier: v})} options={courierOptions} fullWidth={true} />
                </div>
              )}

              <div className="pt-2 pb-2">
                <label className="flex items-start gap-3 cursor-pointer group mb-3">
                  <input type="checkbox" checked={bidForm.agreeAsIs} onChange={(e) => setBidForm({...bidForm, agreeAsIs: e.target.checked})} className="mt-0.5 w-4 h-4 rounded border-[#2a2b2f] bg-[#131314] text-gray-400 focus:ring-gray-500 focus:ring-offset-[#1e1f20] cursor-pointer shrink-0" />
                  <span className="text-[10px] sm:text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed select-none">I acknowledge that this laptop is sold on an <span className="text-gray-200 font-semibold">as-is basis</span> and I have reviewed the listed defects.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={bidForm.agreeNoWarranty} onChange={(e) => setBidForm({...bidForm, agreeNoWarranty: e.target.checked})} className="mt-0.5 w-4 h-4 rounded border-[#2a2b2f] bg-[#131314] text-gray-400 focus:ring-gray-500 focus:ring-offset-[#1e1f20] cursor-pointer shrink-0" />
                  <span className="text-[10px] sm:text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed select-none">I understand that there is <span className="text-red-400/90 font-medium">no warranty</span> included with this purchase.</span>
                </label>
              </div>

              <button 
                onClick={handlePlaceBid} 
                disabled={!isFormValid || isSubmittingBid}
                className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all duration-200 shadow-lg mt-2 ${(!isFormValid || isSubmittingBid) ? "bg-[#2a2b2f] text-gray-500 cursor-not-allowed" : "bg-gray-100 text-black hover:bg-gray-300 active:scale-[0.98] cursor-pointer"}`}
              >
                {isSubmittingBid ? "Submitting..." : "Confirm & Place Bid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STALE BID ALERT MODAL */}
      {isStaleBidAlertOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Bid Outdated</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              Bid Amount changed, please see the updated details and try again.
            </p>
            <button 
              onClick={() => setIsStaleBidAlertOpen(false)} 
              className="w-full py-3.5 rounded-xl bg-[#2a2b2f] text-gray-200 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Bid Successful!</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              Your bid of <strong className="text-white">₱{lastPlacedBid.toLocaleString()}</strong> has been placed. You will be notified via email if you win the auction or if a higher bid is placed.
            </p>
            <button 
              onClick={() => setIsSuccessModalOpen(false)} 
              className="w-full py-3.5 rounded-xl bg-[#2a2b2f] text-gray-200 font-bold hover:bg-[#3a3b3f] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {bidToCancel && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1f20] border border-[#2a2b2f] rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Cancel your bid?</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
              Are you sure you want to cancel this bid? Your offer will be permanently removed.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setBidToCancel(null)} 
                disabled={isCanceling}
                className="flex-1 py-3 rounded-xl bg-[#2a2b2f] text-gray-300 font-bold hover:bg-[#3a3b3f] transition-all duration-200 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
              >
                Keep Bid
              </button>
              <button 
                onClick={confirmCancelBid} 
                disabled={isCanceling}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
              >
                {isCanceling ? "Canceling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MY BIDS DRAWER */}
      <>
        <div 
          className={`fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isMyBidsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsMyBidsOpen(false)} 
        />
        
        <div className={`fixed inset-y-0 right-0 z-[120] w-[85%] sm:w-full max-w-md bg-[#131314] border-l border-[#2a2b2f] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isMyBidsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#2a2b2f]">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              My Active Bids
            </h2>
            <button onClick={() => setIsMyBidsOpen(false)} className="text-gray-500 hover:text-white transition p-2 cursor-pointer bg-[#1e1f20] rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col gap-4 sm:gap-5">
            {myBids.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center opacity-50 px-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                 <p className="text-xs sm:text-sm font-medium">You haven't placed any bids yet.</p>
               </div>
            ) : (
              myBids.map((bid) => (
                <div 
                  key={bid.id}
                  className={`bg-[#1e1f20] border rounded-xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden cursor-pointer group transition-colors hover:bg-[#232426] ${bid.status === 'winning' ? 'border-emerald-500/30' : 'border-red-500/30'}`}
                  onClick={() => setActiveCartItem(bid.id)}
                  onMouseLeave={() => setActiveCartItem(null)}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${bid.status === 'winning' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                  <div className={`absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${activeCartItem === bid.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedLaptop(bid.laptop); 
                        setIsMyBidsOpen(false); 
                        setActiveCartItem(null); 
                        if (window.innerWidth < 1024) {
                          setIsMobilePreviewOpen(true);
                        }
                      }}
                      className="px-5 py-2.5 bg-gray-200 text-black hover:bg-white text-sm font-bold rounded-xl transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      View Laptop Info
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10 w-full">
                    <img src={bid.laptop.images[0]} className={`w-full h-24 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0 ${bid.status === 'outbid' ? 'opacity-60 grayscale-[30%]' : ''}`} alt="Laptop" />
                    <div className="flex-1 flex justify-between gap-2">
                      <div className="flex flex-col items-start justify-between py-0.5">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-tight mb-0.5">{bid.laptop.modelType}</h4>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono mb-1.5">{bid.laptop.serialNumber}</p>
                        </div>
                        <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-medium border mb-1.5 ${getDefectColor(bid.laptop.defectType)}`}>
                          {bid.laptop.defectType}
                        </span>
                        <div className="text-[8px] sm:text-[9px] text-gray-400 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
                            {bid.paymentMode}
                          </span>
                          <span className="flex items-center gap-1">
                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            {bid.receiveMode}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between py-0.5 text-right shrink-0">
                        <span className={`text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded border ${bid.status === 'winning' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {bid.status === 'winning' ? 'Winning' : `Outbid (₱${bid.currentHighest.toLocaleString()})`}
                        </span>
                        <div className="mt-auto pt-2">
                          <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-semibold mb-0.5">Your Bid</p>
                          <p className={`text-sm sm:text-base font-bold leading-none ${bid.status === 'winning' ? 'text-emerald-400' : 'text-gray-400 line-through decoration-red-500/70'}`}>
                            ₱{bid.myBid.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#2a2b2f] relative z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setBidToCancel({ bidId: bid.id, laptopId: bid.laptop.id }); }}
                      className="text-[9px] sm:text-[10px] text-gray-500 hover:text-red-400 uppercase font-bold tracking-wider transition-colors cursor-pointer"
                    >
                      Cancel Bid
                    </button>
                    {bid.status === 'outbid' && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedLaptop(bid.laptop);
                          setBidForm(prev => ({...prev, amount: String(bid.recommended)}));
                          setIsMyBidsOpen(false);
                          setActiveCartItem(null);
                          if (window.innerWidth < 1024) {
                            setIsMobilePreviewOpen(true);
                          }
                          setIsBidModalOpen(true);
                        }}
                        className="text-[9px] sm:text-[10px] bg-blue-600 hover:bg-blue-500 text-white uppercase font-bold tracking-wider px-3 py-1.5 rounded transition-colors shadow-md cursor-pointer"
                      >
                        Outbid (₱{bid.recommended?.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 sm:p-6 border-t border-[#2a2b2f] bg-[#1a1b1e]">
            <p className="text-[10px] sm:text-xs text-gray-400 text-center leading-relaxed">You will receive an email notification if the status of your bids changes.</p>
          </div>
        </div>
      </>

    </div>
  );
}