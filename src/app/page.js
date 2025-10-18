"use client"
import { useState, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navbar from "./components/NavBar";
import HeroSection from "./components/Hero";
import CitySelector from "./components/CitySelector";
import DatePicker from "./components/DatePicker";
import AvailabilityBar from "./components/AvailabilityBar";
import BoxSelector from "./components/BoxSelector";
import FlavorSelector from "./components/FlavorSelector";
import CheckoutForm from "./components/CheckoutForm";
import OrderSummary from "./components/OrderSummary";
import OrderConfirmation from "./components/OrderConfirmation";
import {
  DAILY_CAPACITY,
  MIN_AVAILABLE_FOR_ORDER,
  FLAVORS,
  CITIES,
  BOX_SIZES,
} from "./Shared";


export default function Home() {
  const [language, setLanguage] = useState("fr");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedBoxSize, setSelectedBoxSize] = useState(null);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderSectionRef = useRef(null);

  // TODO: remove mock functionality - replace with real API call
  const remainingCapacity = 648;

  // Custom toast function (simple alert replacement - you can replace with a toast library later)
  const showToast = (title, description, variant = "default") => {
    alert(`${title}\n${description}`);
  };

  const handleScrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === "fr" ? "ar" : "fr";
    setLanguage(newLanguage);
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("lang", newLanguage);
    htmlElement.setAttribute("dir", newLanguage === "ar" ? "rtl" : "ltr");
  };

  const handleSurpriseMeChange = (value, maxFlavors) => {
    setSurpriseMe(value);
    if (value) {
      // TODO: remove mock functionality - implement real surprise selection
      const randomFlavors = [...FLAVORS]
        .sort(() => 0.5 - Math.random())
        .slice(0, maxFlavors)
        .map((f) => f.name);
      setSelectedFlavors(randomFlavors);
    } else {
      setSelectedFlavors([]);
    }
  };

  const handleSubmit = async (data) => {
    if (!selectedCity || !selectedDate || !selectedBoxSize) {
      showToast(
        language === "fr" ? "Erreur" : "خطأ",
        language === "fr"
          ? "Veuillez sélectionner une ville, une date et une boîte"
          : "يرجى اختيار مدينة وتاريخ وعلبة",
        "destructive"
      );
      return;
    }

    // Only check flavors if the box requires flavor selection
    const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
    const requiresFlavors = boxData && boxData.maxFlavors > 0;
    
    if (requiresFlavors && !surpriseMe && selectedFlavors.length === 0) {
      showToast(
        language === "fr" ? "Erreur" : "خطأ",
        language === "fr"
          ? "Veuillez sélectionner au moins une saveur"
          : "يرجى اختيار نكهة واحدة على الأقل",
        "destructive"
      );
      return;
    }

    // TODO: remove mock functionality - replace with real API call
    setIsSubmitting(true);
    setTimeout(() => {
      const mockOrderNumber = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      setOrderNumber(mockOrderNumber);
      setShowConfirmation(true);
      setIsSubmitting(false);
      
      const selectedCityData = CITIES.find((c) => c.name === selectedCity);
      const deliveryPrice = selectedCityData?.deliveryPrice || 0;
      const boxPrice = boxData?.price || 0;
      const total = boxPrice + deliveryPrice;
      
      console.log("Order submitted:", {
        data,
        selectedCity,
        selectedDate,
        selectedBoxSize,
        selectedFlavors,
        surpriseMe,
        boxPrice,
        deliveryPrice,
        total,
      });
    }, 1500);
  };

  const handleNewOrder = () => {
    setShowConfirmation(false);
    setSelectedCity(null);
    setSelectedDate(undefined);
    setSelectedBoxSize(null);
    setSelectedFlavors([]);
    setSurpriseMe(false);
    setOrderNumber("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (showConfirmation && selectedDate && selectedBoxSize) {
    const selectedBox = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
    const selectedCityData = CITIES.find((c) => c.name === selectedCity);
    const deliveryPrice = selectedCityData?.deliveryPrice || 0;
    const totalPrice = (selectedBox?.price || 0) + deliveryPrice;

    return (
      <OrderConfirmation
        orderNumber={orderNumber}
        boxSize={selectedBoxSize}
        priceMad={totalPrice}
        customerName="Client"
        deliveryDate={format(selectedDate, "PPP", { locale: fr })}
        onNewOrder={handleNewOrder}
        language={language}
      />
    );
  }

  const selectedCityData = CITIES.find((c) => c.name === selectedCity);
  const deliveryHours = selectedCityData?.deliveryHours || 24;
  const inSaleRabatRegion = selectedCityData?.inSaleRabatRegion || false;

  const selectedBoxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
  const maxFlavors = selectedBoxData?.maxFlavors || 0;
  const needsFlavorSelection = maxFlavors > 0;

  const canCheckout =
    selectedCity &&
    selectedDate &&
    selectedBoxSize &&
    remainingCapacity >= MIN_AVAILABLE_FOR_ORDER &&
    (!needsFlavorSelection || surpriseMe || selectedFlavors.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      <Navbar
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onCommanderClick={handleScrollToOrder}
      />

      <HeroSection onCommanderClick={handleScrollToOrder} language={language} />

      <div
        ref={orderSectionRef}
        className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <CitySelector
              selectedCity={selectedCity}
              onSelectCity={(city) => {
                setSelectedCity(city);
                
                // Clear box selection if the new city doesn't support the current box
                if (selectedBoxSize) {
                  const newCityData = CITIES.find((c) => c.name === city);
                  const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
                  
                  if (boxData?.regionRestricted && !newCityData?.inSaleRabatRegion) {
                    setSelectedBoxSize(null);
                    setSelectedFlavors([]);
                    setSurpriseMe(false);
                  }
                }
              }}
              language={language}
            />

            <div 
              className="p-4 rounded-xl bg-blue-50 border border-blue-200"
              data-testid="info-multiple-orders"
            >
              <p className="text-sm text-gray-600 text-center">
                {language === "fr"
                  ? "Pour commander plusieurs boîtes, veuillez passer une commande et recommencer après validation."
                  : "لطلب عدة علب، يرجى تقديم طلب واحد وإعادة الطلب بعد التأكيد."}
              </p>
            </div>

            {selectedCity && (
              <div className="space-y-6">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  language={language}
                  deliveryHours={deliveryHours}
                />

                {selectedDate && (
                  <AvailabilityBar
                    remaining={remainingCapacity}
                    language={language}
                  />
                )}
              </div>
            )}

            {selectedCity && selectedDate && remainingCapacity >= MIN_AVAILABLE_FOR_ORDER && (
              <>
                <BoxSelector
                  selectedBoxSize={selectedBoxSize}
                  onSelectBoxSize={setSelectedBoxSize}
                  language={language}
                  inSaleRabatRegion={inSaleRabatRegion}
                />

                {selectedBoxSize && needsFlavorSelection && (
                  <FlavorSelector
                    selectedFlavors={selectedFlavors}
                    onFlavorsChange={setSelectedFlavors}
                    surpriseMe={surpriseMe}
                    onSurpriseMeChange={(value) => handleSurpriseMeChange(value, maxFlavors)}
                    language={language}
                    maxFlavors={maxFlavors}
                  />
                )}

                {canCheckout && (
                  <div className="max-w-2xl">
                    <CheckoutForm
                      onSubmit={handleSubmit}
                      isLoading={isSubmitting}
                      language={language}
                    />
                  </div>
                )}
              </>
            )}

            {selectedCity && selectedDate && remainingCapacity < MIN_AVAILABLE_FOR_ORDER && (
              <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center">
                <p className="text-2xl font-serif font-semibold text-red-600">
                  {language === "fr"
                    ? "Épuisé pour cette date"
                    : "نفدت الكمية لهذا التاريخ"}
                </p>
                <p className="mt-2 text-gray-600">
                  {language === "fr"
                    ? "Veuillez choisir une autre date"
                    : "يرجى اختيار تاريخ آخر"}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              boxSize={selectedBoxSize}
              selectedFlavors={selectedFlavors}
              surpriseMe={surpriseMe}
              language={language}
              selectedCity={selectedCity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}