"use client"


import { DAILY_CAPACITY } from "../Shared";


export default function AvailabilityBar({ remaining, language }) {
  const percentage = (remaining / DAILY_CAPACITY) * 100;
  
  const getColor = () => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  const labels = {
    fr: {
      remaining: "pièces restantes",
      soldOut: "Épuisé pour cette date",
    },
    ar: {
      remaining: "قطعة متبقية",
      soldOut: "نفدت الكمية لهذا التاريخ",
    },
  };

  return (
    <div className="space-y-3 p-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {language === "fr" ? "Disponibilité" : "التوفر"}
        </span>
        <span className="font-mono text-2xl font-bold text-gray-900" data-testid="text-remaining">
          {remaining}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-sm text-gray-600">
        {remaining > 0 ? (
          <>
            <span className="font-medium text-gray-900">{remaining}</span> {labels[language].remaining}
          </>
        ) : (
          <span className="font-semibold text-red-600">{labels[language].soldOut}</span>
        )}
      </p>
    </div>
  );
}