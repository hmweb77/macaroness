"use client"
import { Check, Info } from "lucide-react";
import { BOX_SIZES } from "../Shared"

export default function BoxSelector({ selectedBoxSize, onSelectBoxSize, language, inSaleRabatRegion }) {
  const labels = {
    fr: {
      title: "Choisissez votre boîte",
      pieces: "pcs",
      bestSeller: "Meilleure Vente",
      regionOnly: "Salé-Rabat-Témara uniquement",
    },
    ar: {
      title: "اختر علبتك",
      pieces: "قطعة",
      bestSeller: "الأكثر مبيعاً",
      regionOnly: "سلا-الرباط-تمارة فقط",
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
        {labels[language].title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BOX_SIZES.map((box) => {
          const isRegionRestricted = box.regionRestricted && !inSaleRabatRegion;
          const isDisabled = isRegionRestricted;
          const isSelected = selectedBoxSize === box.pieces;
          
          return (
            <button
              key={box.pieces}
              onClick={() => !isDisabled && onSelectBoxSize(box.pieces)}
              disabled={isDisabled}
              data-testid={`button-box-${box.pieces}`}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                isDisabled 
                  ? "opacity-50 cursor-not-allowed bg-gray-100" 
                  : "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              } ${
                isSelected
                  ? "border-[#E18B73] bg-blue-50 ring-4 ring-[#E18B73]"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Best Seller Badge */}
              {box.bestSeller && !isDisabled && (
                <span 
                  className="absolute -top-3 -right-3 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full shadow-md transform rotate-3"
                  data-testid="badge-best-seller"
                >
                  {labels[language].bestSeller}
                </span>
              )}
            
              {/* Region Restriction Badge */}
              {isRegionRestricted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-600/90 text-white rounded-full flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span className="text-xs whitespace-nowrap">{labels[language].regionOnly}</span>
                </div>
              )}
            
              {/* Selected Check Mark */}
              {isSelected && !isDisabled && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#E18B73] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            
              <div className="space-y-3">
                <p className="font-serif text-4xl font-bold text-gray-900">
                  {box.pieces}
                </p>
                <p className="text-sm text-gray-600">
                  {labels[language].pieces}
                </p>
                <p className="font-mono text-3xl font-bold text-[#E18B73]">
                  {box.price} <span className="text-xl">MAD</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}