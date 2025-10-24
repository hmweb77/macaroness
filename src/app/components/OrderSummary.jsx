"use client"
import { BOX_SIZES, CITIES, FLAVORS } from "../Shared"

export default function OrderSummary({ boxSize, excludedFlavors = [], surpriseMe, language, selectedCity, selectedDate }) {
  const labels = {
    fr: {
      summary: "Récapitulatif",
      box: "Boîte",
      pieces: "pcs",
      price: "Prix",
      flavors: "Saveurs",
      allFlavors: "Toutes incluses",
      excluded: "Exclues",
      surprise: "Mélange surprise",
      delivery: "Livraison",
      total: "Total",
      noBox: "Votre boîte",
      included: "incluses",
      orderDate: "Date de commande",
      deliveryTime: "Délai de livraison",
      hours24: "24 heures",
      hours48: "48 heures",
    },
    ar: {
      summary: "الملخص",
      box: "علبة",
      pieces: "قطعة",
      price: "السعر",
      flavors: "النكهات",
      allFlavors: "الكل مشمول",
      excluded: "مستبعد",
      surprise: "مزيج مفاجئ",
      delivery: "التوصيل",
      total: "المجموع",
      noBox: "علبة",
      included: "مشمول",
      orderDate: "تاريخ الطلب",
      deliveryTime: "مدة التسليم",
      hours24: "24 ساعة",
      hours48: "48 ساعة",
    },
  };

  const selectedBox = BOX_SIZES.find((b) => b.pieces === boxSize);
  const selectedCityData = CITIES.find((c) => c.name === selectedCity);
  const deliveryPrice = selectedCityData?.deliveryPrice || 0;
  const deliveryHours = selectedCityData?.deliveryHours || 24;
  const totalPrice = selectedBox ? selectedBox.price + deliveryPrice : 0;
  
  const includedCount = FLAVORS.length - excludedFlavors.length;

  if (!boxSize || !selectedBox) {
    return (
      <div className="sticky top-24 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <p className="text-center text-gray-600">{labels[language].noBox}</p>
      </div>
    );
  }

  return (
    <div className="sticky top-24 p-6 rounded-2xl bg-white border border-gray-200 shadow-lg space-y-4">
      <h3 className="font-serif text-2xl font-semibold text-gray-900">
        {labels[language].summary}
      </h3>
      
      {/* Order Details */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{labels[language].box}</span>
          <span className="font-semibold text-gray-900">
            {boxSize} {labels[language].pieces}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{labels[language].flavors}</span>
          <span className="font-medium text-gray-900">
            {surpriseMe 
              ? labels[language].surprise 
              : excludedFlavors.length === 0 
                ? labels[language].allFlavors
                : `${includedCount} ${labels[language].included}`
            }
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">{labels[language].price}</span>
          <span className="font-medium text-gray-900">
            {selectedBox.price} MAD
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{labels[language].delivery}</span>
          <span className="font-medium text-gray-900">
            {deliveryPrice} MAD
          </span>
        </div>

        {/* Order Date */}
        {selectedDate && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{labels[language].orderDate}</span>
            <span className="font-medium text-gray-900">
              {selectedDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
        )}

        {/* Delivery Time */}
        {selectedCity && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{labels[language].deliveryTime}</span>
            <span className="font-medium text-[#E18B73]">
              {deliveryHours === 24 ? labels[language].hours24 : labels[language].hours48}
            </span>
          </div>
        )}
      </div>
      
      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{labels[language].total}</span>
          <span className="font-mono text-2xl font-bold text-[#E18B73]" data-testid="text-total-price">
            {totalPrice} MAD
          </span>
        </div>
      </div>
      
      {/* Excluded Flavors Tags */}
      {!surpriseMe && excludedFlavors.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {labels[language].excluded}:
          </p>
          <div className="flex flex-wrap gap-2">
            {excludedFlavors.map((flavor) => (
              <span
                key={flavor}
                className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium"
              >
                {flavor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* All Flavors Included Message */}
      {!surpriseMe && excludedFlavors.length === 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium text-center">
              ✓ {labels[language].allFlavors}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}