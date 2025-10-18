"use client"
import { Languages } from "lucide-react";
import Image from "next/image";

export default function Navbar({ language, onLanguageToggle, onCommanderClick }) {
  const labels = {
    fr: {
      order: "Commander",
    },
    ar: {
      order: "اطلب",
    },
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#EBCECE] backdrop-blur ">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            <Image src="/logo.png" alt="logo" width={50} height={50} />

          </div>
          <h1 className="font-serif text-xl md:text-2xl font-bold text-gray-900">
            Macaroness
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Order Button */}
          <button
            onClick={onCommanderClick}
            data-testid="button-nav-order"
            className="px-6 py-2.5 bg-[#E18B73] text-white rounded-lg font-semibold hover:bg-[#D47158] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            {labels[language].order}
          </button>
          
          {/* Language Toggle */}
          <button
            onClick={onLanguageToggle}
            data-testid="button-language-toggle"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            aria-label="Toggle language"
          >
            <Languages className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}