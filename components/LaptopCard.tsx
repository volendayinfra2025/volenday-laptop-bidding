export function LaptopCard({ images, modelType, serialNumber, defectType, currentBid, bidsCount, viewsCount, isSelected, onClick, isCompared, onToggleCompare }: any) {
  const getDefectColor = (type: string) => {
    if (type === "Aesthetic Damage") return "text-blue-300 bg-blue-500/10 border-blue-500/20";
    if (type === "Performance Issues") return "text-amber-200 bg-amber-500/10 border-amber-500/20";
    if (type === "Hardware Malfunction") return "text-purple-300 bg-purple-500/10 border-purple-500/20";
    return "text-gray-300 bg-gray-500/10 border-gray-500/20";
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-[#1e1f20] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 flex flex-col ${isSelected ? 'border-gray-400 ring-1 ring-gray-400' : 'border-[#2a2b2f] hover:border-gray-500'}`}
    >
      <div className="relative h-48 w-full bg-black overflow-hidden group/card">
        <img src={images[0]} alt={modelType} className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 transition-opacity" />
        
        {/* Compare Checkbox */}
        <button 
          onClick={onToggleCompare}
          className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-200 shadow-lg ${isCompared ? 'bg-blue-600 border-blue-400 text-white scale-110' : 'bg-black/50 border-white/20 text-transparent hover:text-white/70 hover:bg-black/70'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {/* Views Badge with Custom Tooltip */}
          <div className="group/tooltip relative flex items-center justify-end gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-xs text-gray-300 font-medium border border-white/10 cursor-default">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            {viewsCount}
            
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-max px-3 py-1.5 bg-[#2a2b2f] border border-[#3a3b3f] text-white text-[10px] font-medium tracking-wide rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none">
              {viewsCount} {viewsCount === 1 ? 'person has' : 'people have'} viewed this unit.
            </div>
          </div>
          
          {/* Bids Badge with Custom Tooltip */}
          <div className="group/tooltip relative flex items-center justify-end gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-xs text-gray-300 font-medium border border-white/10 cursor-default">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {bidsCount}

            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-max px-3 py-1.5 bg-[#2a2b2f] border border-[#3a3b3f] text-white text-[10px] font-medium tracking-wide rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none">
              {bidsCount} {bidsCount === 1 ? 'person has' : 'people have'} bid on this unit.
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-1 leading-tight">{modelType}</h3>
        <p className="text-xs text-gray-500 font-mono mb-3">{serialNumber}</p>
        <div className="mb-auto">
          <span className={`text-[10px] px-2.5 py-1 rounded font-medium border ${getDefectColor(defectType)}`}>
            {defectType}
          </span>
        </div>
        <div className="mt-5 pt-4 border-t border-[#2a2b2f] flex items-end justify-between">
          <span className="text-xs text-gray-500 font-medium">Highest Bid:</span>
          <span className="text-lg font-bold text-white">₱{currentBid.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}