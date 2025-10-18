"use client"
import { Check, Sparkles } from "lucide-react";
import { FLAVORS } from "../Shared"

export default function FlavorSelector({
  selectedFlavors,
  onFlavorsChange,
  surpriseMe,
  onSurpriseMeChange,
  language,
  maxFlavors,
}) {
  const labels = {
    fr: {
      title: "Sélectionnez vos saveurs",
      subtitle: `Choisissez jusqu'à ${maxFlavors} saveurs`,
      surpriseMe: "Laissez-nous vous surprendre",
      selected: "sélectionné",
    },
    ar: {
      title: "اختر النكهات",
      subtitle: `اختر حتى ${maxFlavors} نكهة`,
      surpriseMe: "دعنا نفاجئك",
      selected: "محدد",
    },
  };

  const handleFlavorToggle = (flavorName) => {
    if (surpriseMe) return;

    if (selectedFlavors.includes(flavorName)) {
      onFlavorsChange(selectedFlavors.filter((f) => f !== flavorName));
    } else {
      if (selectedFlavors.length < maxFlavors) {
        onFlavorsChange([...selectedFlavors, flavorName]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
            {labels[language].title}
          </h2>
          <p className="text-gray-600 mt-2">
            {surpriseMe 
              ? labels[language].subtitle.replace(` (${selectedFlavors.length}/${maxFlavors})`, '')
              : `${labels[language].subtitle} (${selectedFlavors.length}/${maxFlavors})`
            }
          </p>
        </div>
        
        {/* Surprise Me Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-900">{labels[language].surpriseMe}</span>
          <button
            type="button"
            role="switch"
            aria-checked={surpriseMe}
            onClick={() => onSurpriseMeChange(!surpriseMe)}
            data-testid="switch-surprise-me"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              surpriseMe ? 'bg-[#E18B73]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                surpriseMe ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      {/* Flavor Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {FLAVORS.map((flavor) => {
          const isSelected = selectedFlavors.includes(flavor.name);
          const canSelect = selectedFlavors.length < maxFlavors || isSelected;
          const displayName = language === "ar" ? flavor.nameAr : flavor.name;
          
          return (
            <button
              key={flavor.name}
              onClick={() => handleFlavorToggle(flavor.name)}
              disabled={surpriseMe || !canSelect}
              data-testid={`button-flavor-${flavor.name}`}
              className={`relative p-4 rounded-full text-center transition-all font-medium ${
                surpriseMe
                  ? "opacity-50 cursor-not-allowed"
                  : canSelect
                  ? "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              } ${
                isSelected && !surpriseMe
                  ? "ring-2 ring-offset-2 ring-gray-900 scale-105"
                  : ""
              }`}
              style={{
                backgroundColor: `hsl(${flavor.color})`,
                color: flavor.name === "Chocolat" || flavor.name === "Café" 
                  ? "hsl(0 0% 95%)" 
                  : "hsl(220 15% 20%)",
              }}
            >
              {isSelected && !surpriseMe && (
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center bg-gray-900"
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm">{displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}