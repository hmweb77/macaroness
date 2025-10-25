"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingBag, AlertCircle } from "lucide-react";

// Improved validation schema
const formSchema = z.object({
  customerName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres"),
  phone: z.string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, "Format: +212612345678 ou 0612345678"),
  address: z.string()
    .max(500, "L'adresse est trop longue")
    .optional(),
  notes: z.string()
    .max(1000, "Les notes sont trop longues")
    .optional(),
});

export default function CheckoutForm({ onSubmit, isLoading, language }) {
  const labels = {
    fr: {
      title: "Informations de livraison",
      name: "Nom complet",
      namePlaceholder: "Votre nom",
      nameError: "Nom invalide (lettres uniquement)",
      phone: "Téléphone",
      phonePlaceholder: "+212 6XX XXX XXX ou 06XX XXX XXX",
      phoneError: "Format: +212612345678 ou 0612345678",
      address: "Adresse",
      addressPlaceholder: "Adresse de livraison",
      notes: "Notes",
      notesPlaceholder: "Instructions spéciales (optionnel)",
      submit: "Réserver ma boîte",
      submitting: "Traitement en cours...",
      required: "Requis",
      optional: "Optionnel",
      privacyNote: "Vos informations sont sécurisées et ne seront jamais partagées.",
    },
    ar: {
      title: "معلومات التسليم",
      name: "الاسم الكامل",
      namePlaceholder: "اسمك",
      nameError: "اسم غير صالح (حروف فقط)",
      phone: "رقم الهاتف",
      phonePlaceholder: "+212 6XX XXX XXX أو 06XX XXX XXX",
      phoneError: "التنسيق: +212612345678 أو 0612345678",
      address: "العنوان",
      addressPlaceholder: "عنوان التسليم (اختياري)",
      notes: "ملاحظات",
      notesPlaceholder: "تعليمات خاصة (اختياري)",
      submit: "احجز علبتي",
      submitting: "جاري المعالجة...",
      required: "مطلوب",
      optional: "اختياري",
      privacyNote: "معلوماتك آمنة ولن تتم مشاركتها أبدًا.",
    },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
        {labels[language].title}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Name Field */}
        <div className="space-y-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-900">
            {labels[language].name}{" "}
            <span className="text-red-600">*</span>
            <span className="text-xs text-gray-500 ml-2">({labels[language].required})</span>
          </label>
          <input
            id="customerName"
            {...register("customerName")}
            placeholder={labels[language].namePlaceholder}
            data-testid="input-name"
            disabled={isLoading}
            className={`w-full h-12 px-4 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
              errors.customerName 
                ? 'border-red-500 focus:ring-red-600' 
                : 'border-gray-300 focus:ring-blue-600 focus:border-transparent'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.customerName && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p>{errors.customerName.message}</p>
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
            {labels[language].phone}{" "}
            <span className="text-red-600">*</span>
            <span className="text-xs text-gray-500 ml-2">({labels[language].required})</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder={labels[language].phonePlaceholder}
            data-testid="input-phone"
            disabled={isLoading}
            className={`w-full h-12 px-4 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
              errors.phone 
                ? 'border-red-500 focus:ring-red-600' 
                : 'border-gray-300 focus:ring-blue-600 focus:border-transparent'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.phone && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p>{errors.phone.message}</p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            {language === 'fr' 
              ? "Exemple: +212612345678 ou 0612345678" 
              : "مثال: +212612345678 أو 0612345678"}
          </p>
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-900">
            {labels[language].address}
            <span className="text-xs text-gray-500 ml-2">({labels[language].required})</span>
          </label>
          <input
            id="address"
            {...register("address")}
            placeholder={labels[language].addressPlaceholder}
            data-testid="input-address"
            disabled={isLoading}
            className={`w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          {errors.address && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p>{errors.address.message}</p>
            </div>
          )}
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
            {labels[language].notes}
            <span className="text-xs text-gray-500 ml-2">({labels[language].optional})</span>
          </label>
          <textarea
            id="notes"
            {...register("notes")}
            placeholder={labels[language].notesPlaceholder}
            data-testid="input-notes"
            disabled={isLoading}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          {errors.notes && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p>{errors.notes.message}</p>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-700">
            🔒 {labels[language].privacyNote}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          data-testid="button-submit-order"
          className="w-full h-14 px-8 bg-[#E18B73] text-white rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 hover:bg-[#D47158] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
        >
          <ShoppingBag className="w-5 h-5" />
          {isLoading ? labels[language].submitting : labels[language].submit}
        </button>
      </form>
    </div>
  );
}