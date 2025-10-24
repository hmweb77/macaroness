"use client"
import { X, Sparkles } from "lucide-react";
import { FLAVORS } from "../Shared"

export default function FlavorSelector({
  excludedFlavors = [],
  onExcludedFlavorsChange,
  surpriseMe,
  onSurpriseMeChange,
  language,
  maxExclusions = 3,
}) {
  const labels = {
    fr: {
      title: "Sélectionnez les saveurs à exclure",
      subtitle: `Vous pouvez exclure jusqu'à ${maxExclusions} saveurs`,
      allFlavors: "Toutes les saveurs sont incluses",
      surpriseMe: "Laissez-nous vous surprendre",
      excluded: "exclu",
      exclude: "Exclure",
    },
    ar: {
      title: "اختر النكهات المستبعدة",
      subtitle: `يمكنك استبعاد حتى ${maxExclusions} نكهات`,
      allFlavors: "جميع النكهات مشمولة",
      surpriseMe: "دعنا نفاجئك",
      excluded: "مستبعد",
      exclude: "استبعد",
    },
  };

  const handleFlavorToggle = (flavorName) => {
    if (surpriseMe) return;

    if (excludedFlavors.includes(flavorName)) {
      // Remove from excluded list (include the flavor)
      onExcludedFlavorsChange(excludedFlavors.filter((f) => f !== flavorName));
    } else {
      // Add to excluded list (exclude the flavor)
      if (excludedFlavors.length < maxExclusions) {
        onExcludedFlavorsChange([...excludedFlavors, flavorName]);
      }
    }
  };

  const includedCount = FLAVORS.length - excludedFlavors.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
            {labels[language].title}
          </h2>
          <p className="text-gray-600 mt-2">
            {surpriseMe 
              ? labels[language].allFlavors
              : `${labels[language].subtitle} (${excludedFlavors.length}/${maxExclusions} ${language === 'fr' ? 'exclus' : 'مستبعد'})`
            }
          </p>
          {!surpriseMe && excludedFlavors.length === 0 && (
            <p className="text-green-600 font-medium mt-1">
              ✓ {labels[language].allFlavors}
            </p>
          )}
          {!surpriseMe && excludedFlavors.length > 0 && (
            <p className="text-blue-600 font-medium mt-1">
              {includedCount} {language === 'fr' ? 'saveurs incluses' : 'نكهات مشمولة'}
            </p>
          )}
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
          const isExcluded = excludedFlavors.includes(flavor.name);
          const canExclude = excludedFlavors.length < maxExclusions || isExcluded;
          const displayName = language === "ar" ? flavor.nameAr : flavor.name;
          
          return (
            <button
              key={flavor.name}
              onClick={() => handleFlavorToggle(flavor.name)}
              disabled={surpriseMe || !canExclude}
              data-testid={`button-flavor-${flavor.name}`}
              className={`relative p-4 rounded-full text-center transition-all font-medium ${
                surpriseMe
                  ? "opacity-50 cursor-not-allowed"
                  : canExclude
                  ? "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              } ${
                isExcluded && !surpriseMe
                  ? "opacity-40 ring-2 ring-offset-2 ring-red-500"
                  : ""
              }`}
              style={{
                backgroundColor: `hsl(${flavor.color})`,
                color: flavor.name === "Chocolat" || flavor.name === "Café" 
                  ? "hsl(0 0% 95%)" 
                  : "hsl(220 15% 20%)",
              }}
            >
              {isExcluded && !surpriseMe && (
                <div 
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center bg-red-500 shadow-lg"
                >
                  <X className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
              <span className="text-sm">{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Info Message */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-gray-700">
          {language === 'fr' 
            ? "💡 Astuce: Par défaut, toutes les saveurs sont incluses dans votre boîte. Cliquez sur une saveur pour l'exclure si vous ne l'aimez pas."
            : "💡 نصيحة: افتراضيًا، يتم تضمين جميع النكهات في علبتك. انقر على نكهة لاستبعادها إذا كنت لا تحبها."
          }
        </p>
      </div>
    </div>
  );
}