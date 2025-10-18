"use client"
import { CheckCircle2 } from "lucide-react";
import { BOX_SIZES } from "../Shared"

export default function OrderConfirmation({
  orderNumber,
  boxSize,
  priceMad,
  customerName,
  deliveryDate,
  onNewOrder,
  language,
}) {
  const labels = {
    fr: {
      success: "Commande confirmée !",
      thankYou: "Merci pour votre commande",
      orderNumber: "Numéro de commande",
      details: "Détails de la commande",
      box: "Boîte",
      pieces: "pcs",
      price: "Prix",
      customer: "Client",
      delivery: "Livraison prévue",
      message: "Nous préparons vos macarons avec soin. Vous recevrez une confirmation par téléphone.",
      newOrder: "Nouvelle commande",
    },
    ar: {
      success: "تم تأكيد الطلب!",
      thankYou: "شكراً لطلبك",
      orderNumber: "رقم الطلب",
      details: "تفاصيل الطلب",
      box: "علبة",
      pieces: "قطعة",
      price: "السعر",
      customer: "العميل",
      delivery: "التسليم المتوقع",
      message: "نحن نجهز الماكرون الخاص بك بعناية. سوف تتلقى تأكيدًا عبر الهاتف.",
      newOrder: "طلب جديد",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Icon and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900">
            {labels[language].success}
          </h1>
          
          <p className="text-lg text-gray-600">
            {labels[language].thankYou}, {customerName}
          </p>
          
          <div className="text-8xl">🎉</div>
        </div>
        
        {/* Order Details Card */}
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xl space-y-6">
          {/* Order Number */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">
              {labels[language].orderNumber}
            </p>
            <p className="font-mono text-3xl font-bold text-[#E18B73]" data-testid="text-order-number">
              #{orderNumber}
            </p>
          </div>
          
          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-gray-900">
              {labels[language].details}
            </h3>
            
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{labels[language].box}</span>
                <span className="font-semibold text-gray-900">
                  {boxSize} {labels[language].pieces}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{labels[language].price}</span>
                <span className="font-mono text-xl font-bold text-gray-900">
                  {priceMad} MAD
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{labels[language].delivery}</span>
                <span className="font-medium text-gray-900">{deliveryDate}</span>
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              {labels[language].message}
            </p>
          </div>
        </div>
        
        {/* New Order Button */}
        <div className="text-center">
          <button
            onClick={onNewOrder}
            data-testid="button-new-order"
            className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            {labels[language].newOrder}
          </button>
        </div>
      </div>
    </div>
  );
}