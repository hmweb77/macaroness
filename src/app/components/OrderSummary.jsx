"use client"
import { BOX_SIZES, CITIES } from "../Shared"

export default function OrderSummary({ boxSize, selectedFlavors, surpriseMe, language, selectedCity }) {
  const labels = {
    fr: {
      summary: "Récapitulatif",
      box: "Boîte",
      pieces: "pcs",
      price: "Prix",
      flavors: "Saveurs",
      surprise: "Mélange surprise",
      delivery: "Livraison",
      total: "Total",
      noBox: "Votre boîte",
    },
    ar: {
      summary: "الملخص",
      box: "علبة",
      pieces: "قطعة",
      price: "السعر",
      flavors: "النكهات",
      surprise: "مزيج مفاجئ",
      delivery: "التوصيل",
      total: "المجموع",
      noBox: "علبة",
    },
  };

  const selectedBox = BOX_SIZES.find((b) => b.pieces === boxSize);
  const selectedCityData = CITIES.find((c) => c.name === selectedCity);
  const deliveryPrice = selectedCityData?.deliveryPrice || 0;
  const totalPrice = selectedBox ? selectedBox.price + deliveryPrice : 0;

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
            {surpriseMe ? labels[language].surprise : `${selectedFlavors.length}/${boxSize}`}
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
      
      {/* Selected Flavors Tags */}
      {!surpriseMe && selectedFlavors.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {labels[language].flavors}:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFlavors.map((flavor) => (
              <span
                key={flavor}
                className="px-3 py-1 rounded-full bg-blue-100 text-[#E18B73] text-xs font-medium"
              >
                {flavor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}