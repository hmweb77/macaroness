"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingBag } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export default function CheckoutForm({ onSubmit, isLoading, language }) {
  const labels = {
    fr: {
      title: "Informations de livraison",
      name: "Nom complet",
      namePlaceholder: "Votre nom",
      phone: "Téléphone",
      phonePlaceholder: "+212 6XX XXX XXX",
      address: "Adresse",
      addressPlaceholder: "Adresse de livraison",
      notes: "Notes",
      notesPlaceholder: "Instructions spéciales (optionnel)",
      submit: "Réserver ma boîte",
    },
    ar: {
      title: "معلومات التسليم",
      name: "الاسم الكامل",
      namePlaceholder: "اسمك",
      phone: "رقم الهاتف",
      phonePlaceholder: "+212 6XX XXX XXX",
      address: "العنوان",
      addressPlaceholder: "عنوان التسليم (اختياري)",
      notes: "ملاحظات",
      notesPlaceholder: "تعليمات خاصة (اختياري)",
      submit: "احجز علبتي",
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
            <span className="text-[#E18B73]0">*</span>
          </label>
          <input
            id="customerName"
            {...register("customerName")}
            placeholder={labels[language].namePlaceholder}
            data-testid="input-name"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.customerName && (
            <p className="text-sm text-red-600">{errors.customerName.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
            {labels[language].phone}{" "}
            <span className="text-[#E18B73]">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder={labels[language].phonePlaceholder}
            data-testid="input-phone"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-900">
            {labels[language].address}
          </label>
          <input
            id="address"
            {...register("address")}
            placeholder={labels[language].addressPlaceholder}
            data-testid="input-address"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
            {labels[language].notes}
          </label>
          <textarea
            id="notes"
            {...register("notes")}
            placeholder={labels[language].notesPlaceholder}
            data-testid="input-notes"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          data-testid="button-submit-order"
          className="w-full h-14 px-8 bg-[#E18B73] text-white rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 hover:bg-[#D47158] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
        >
          <ShoppingBag className="w-5 h-5" />
          {isLoading ? "..." : labels[language].submit}
        </button>
      </form>
    </div>
  );
}