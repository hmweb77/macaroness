"use client"
import { useState } from "react";
import { MapPin, Check, ChevronsUpDown, Search } from "lucide-react";
import { CITIES } from "../Shared"

export default function CitySelector({ selectedCity, onSelectCity, language }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const labels = {
    fr: {
      title: "Sélectionnez votre ville",
      subtitle: "La date de livraison sera ajustée automatiquement",
      placeholder: "Choisissez une ville...",
      search: "Rechercher une ville...",
      noResults: "Aucune ville trouvée.",
      delivery24h: "24h",
      delivery48h: "48h",
      deliveryLabel: "Livraison:",
    },
    ar: {
      title: "اختر مدينتك",
      subtitle: "سيتم تعديل موعد التسليم تلقائياً",
      placeholder: "اختر مدينة...",
      search: "ابحث عن مدينة...",
      noResults: "لم يتم العثور على مدن.",
      delivery24h: "24 ساعة",
      delivery48h: "48 ساعة",
      deliveryLabel: "التوصيل:",
    },
  };

  const selectedCityData = CITIES.find((c) => c.name === selectedCity);
  const deliveryLabel = selectedCityData?.deliveryHours === 24 
    ? labels[language].delivery24h 
    : selectedCityData?.deliveryHours === 48 
    ? labels[language].delivery48h 
    : "";

  // Filter cities based on search query
  const filteredCities = CITIES.filter((city) => {
    const displayName = language === "ar" ? city.nameAr : city.name;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           city.nameAr.includes(searchQuery);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
          {labels[language].title}
        </h2>
        <p className="text-gray-600 mt-2">
          {labels[language].subtitle}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:max-w-md relative">
          {/* Dropdown Trigger */}
          <button
            onClick={() => setOpen(!open)}
            data-testid="select-city"
            className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-between text-base hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E18B73] focus:border-transparent transition-all"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#E18B73]" />
              {selectedCity ? (
                <span className="text-gray-900">
                  {language === "ar" 
                    ? selectedCityData?.nameAr 
                    : selectedCityData?.name}
                </span>
              ) : (
                <span className="text-gray-400">
                  {labels[language].placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {open && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={labels[language].search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-city-search"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#E18B73] focus:border-transparent"
                  />
                </div>
              </div>

              {/* City List */}
              <div className="overflow-y-auto max-h-64">
                {filteredCities.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    {labels[language].noResults}
                  </div>
                ) : (
                  filteredCities.map((city) => {
                    const displayName = language === "ar" ? city.nameAr : city.name;
                    const deliveryInfo = city.deliveryHours === 24 
                      ? labels[language].delivery24h 
                      : labels[language].delivery48h;
                    const isSelected = selectedCity === city.name;
                    
                    return (
                      <button
                        key={city.name}
                        onClick={() => {
                          onSelectCity(city.name);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                        data-testid={`option-city-${city.name}`}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Check
                          className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? "opacity-100 text-[#E18B73]" : "opacity-0"
                          }`}
                        />
                        <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                          <span className="font-medium text-gray-900 truncate">{displayName}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {labels[language].deliveryLabel}
                            </span>
                            <span className="text-xs text-gray-500">
                              {deliveryInfo}
                            </span>
                            <span className="text-xs font-semibold text-[#E18B73]">
                              {city.deliveryPrice} MAD
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Info Badge */}
        {selectedCity && (
          <div 
            className="px-4 py-2 rounded-lg bg-white border border-white flex items-center gap-2"
            data-testid="text-delivery-info"
          >
            <MapPin className="w-4 h-4 text-[#E18B73]" />
            <span className="text-sm font-medium text-[#E18B73]">
              {deliveryLabel}
            </span>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setOpen(false);
            setSearchQuery("");
          }}
        />
      )}
    </div>
  );
}