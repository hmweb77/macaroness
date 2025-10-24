"use client"
import { useState, useRef, useEffect } from "react";
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
import { sendOrderToTelegram } from "./services/telegramService";
import { getRemainingCapacity } from "./services/firebaseService";
import {
  DAILY_CAPACITY,
  MIN_AVAILABLE_FOR_ORDER,
  FLAVORS,
  CITIES,
  BOX_SIZES,
} from "./Shared";
import {
  createOrder,
  subscribeToCapacity,
  initializeDailyCapacity
} from "./services/firebaseService";

// Configuration
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyCaJ8sXxOrIPs6PT-5HTYMG3Q8OHhc4H5s3YmzpJnzkYJSS2g9Cq8PGzXMqXhXzMM/exec';


// Function to save order to Google Sheets (backup)
const saveOrderToSheets = async (orderData) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    console.log('Order saved to Google Sheets');
    return { success: true };
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return { success: false, error: error.message };
  }
};

export default function Home() {
  // Language and UI State
  const [language, setLanguage] = useState("fr");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Order State
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedBoxSize, setSelectedBoxSize] = useState(null);
  const [excludedFlavors, setExcludedFlavors] = useState([]);
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerData, setCustomerData] = useState(null);
  
  // Firebase State
  const [remainingCapacity, setRemainingCapacity] = useState(DAILY_CAPACITY);
  const [isLoadingCapacity, setIsLoadingCapacity] = useState(false);
  
  // Refs
  const orderSectionRef = useRef(null);
  const unsubscribeRef = useRef(null);
  
  // Subscribe to real-time capacity updates when date changes
useEffect(() => {
  // Cleanup previous subscription
  if (unsubscribeRef.current) {
    unsubscribeRef.current();
    unsubscribeRef.current = null;
  }
  
  if (selectedDate) {
    setIsLoadingCapacity(true);
    
    // Just READ the capacity, don't initialize
    getRemainingCapacity(selectedDate)
      .then(capacity => {
        setRemainingCapacity(capacity);
        setIsLoadingCapacity(false);
        
        // Subscribe to real-time updates
        const unsubscribe = subscribeToCapacity(
          selectedDate,
          (capacity) => {
            setRemainingCapacity(capacity);
          },
          (error) => {
            // Error handler
            console.error('Subscription error:', error);
            setIsLoadingCapacity(false);
            setRemainingCapacity(DAILY_CAPACITY);
          }
        );
        
        unsubscribeRef.current = unsubscribe;
      })
      .catch(error => {
        console.error('Error getting capacity:', error);
        setIsLoadingCapacity(false);
        setRemainingCapacity(DAILY_CAPACITY);
      });
  } else {
    setRemainingCapacity(DAILY_CAPACITY);
    setIsLoadingCapacity(false);
  }
  
  // Cleanup on unmount
  return () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
  };
}, [selectedDate]);
  // Utility Functions
  const showToast = (title, description, variant = "default") => {
    alert(`${title}\n${description}`);
  };
  
  const generateOrderNumber = () => {
    return Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
  };
  
  // Handlers
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
  
  const handleCitySelection = (city) => {
    setSelectedCity(city);
    
    // Clear box selection if the new city doesn't support the current box
    if (selectedBoxSize) {
      const newCityData = CITIES.find((c) => c.name === city);
      const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
      
      if (boxData?.regionRestricted && !newCityData?.inSaleRabatRegion) {
        setSelectedBoxSize(null);
        setExcludedFlavors([]);
        setSurpriseMe(false);
      }
    }
  };
  
  const handleSurpriseMeChange = (value) => {
    setSurpriseMe(value);
    if (value) {
      // Clear exclusions when surprise me is enabled
      setExcludedFlavors([]);
    }
  };
  
 
  const handleSubmit = async (data) => {
    // Validation
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
    
    // Check if there's enough capacity
    if (remainingCapacity < selectedBoxSize) {
      showToast(
        language === "fr" ? "Capacité insuffisante" : "سعة غير كافية",
        language === "fr"
          ? `Il ne reste que ${remainingCapacity} pièces disponibles pour cette date`
          : `هناك فقط ${remainingCapacity} قطعة متاحة لهذا التاريخ`,
        "destructive"
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate order number
      const orderNum = generateOrderNumber();
      
      // Calculate prices
      const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
      const cityData = CITIES.find((c) => c.name === selectedCity);
      const deliveryPrice = cityData?.deliveryPrice || 0;
      const boxPrice = boxData?.price || 0;
      const total = boxPrice + deliveryPrice;
      
      // Get included flavors
      const includedFlavors = FLAVORS
        .filter(f => !excludedFlavors.includes(f.name))
        .map(f => f.name);
      
      // Prepare order data for Firebase
      const orderDataForFirebase = {
        orderNumber: orderNum,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address || '',
        notes: data.notes || '',
        city: selectedCity,
        cityArabic: cityData?.nameAr || '',
        deliveryDate: selectedDate,
        deliveryHours: cityData?.deliveryHours || 24,
        deliveryPrice: deliveryPrice,
        boxSize: selectedBoxSize,
        boxPrice: boxPrice,
        totalPrice: total,
        flavors: surpriseMe ? ['Surprise'] : includedFlavors,
        excludedFlavors: surpriseMe ? [] : excludedFlavors,
        surpriseMe: surpriseMe,
        language: language
      };
      
      // Save to Firebase (this will also update capacity)
      const firebaseResult = await createOrder(orderDataForFirebase);
      
      console.log('Order saved to Firebase:', firebaseResult);
      
      // Prepare order data for Google Sheets (backup)
      const orderDataForSheets = {
        orderNumber: orderNum,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address || '',
        notes: data.notes || '',
        city: selectedCity,
        deliveryDate: format(selectedDate, "dd/MM/yyyy", { locale: fr }),
        boxSize: `${selectedBoxSize} pièces`,
        totalPrice: `${total} MAD`,
        flavors: surpriseMe 
          ? 'Surprise' 
          : excludedFlavors.length > 0 
            ? `Incluses: ${includedFlavors.join(', ')} | Exclues: ${excludedFlavors.join(', ')}`
            : 'Toutes les saveurs',
        surpriseMe: surpriseMe,
        orderDateTime: format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })
      };
      
      // Save to Google Sheets (non-blocking backup)
      saveOrderToSheets(orderDataForSheets).then(result => {
        if (result.success) {
          console.log('Order successfully saved to Google Sheets (backup)');
        }
      });
      
      // Store customer data for confirmation page
      setCustomerData(data);
      setOrderNumber(orderNum);
      
      // Show success message
      showToast(
        language === "fr" ? "Succès !" : "نجاح!",
        language === "fr" 
          ? "Votre commande a été enregistrée" 
          : "تم حفظ طلبك",
        "default"
      );
      
      // 🆕 Send to Telegram (automatic notification)
      const telegramResult = await sendOrderToTelegram(orderDataForFirebase);
      if (telegramResult.success) {
        console.log('✅ Telegram notification sent! Message ID:', telegramResult.messageId);
      } else {
        console.error('⚠️ Telegram notification failed:', telegramResult.error);
        // Order is still saved to Firebase and Sheets, just notification failed
        // Don't block user experience - they don't need to know about notification failure
      }
      
      // Show confirmation page
      setTimeout(() => {
        setShowConfirmation(true);
        setIsSubmitting(false);
      }, 500);
      
    } catch (error) {
      console.error('Error processing order:', error);
      setIsSubmitting(false);
      
      let errorMessage = language === "fr"
        ? "Une erreur s'est produite. Veuillez réessayer."
        : "حدث خطأ. يرجى المحاولة مرة أخرى.";
      
      if (error.message === 'Insufficient capacity for this date') {
        errorMessage = language === "fr"
          ? "Capacité insuffisante pour cette date. Veuillez rafraîchir la page."
          : "سعة غير كافية لهذا التاريخ. يرجى تحديث الصفحة.";
      }
      
      showToast(
        language === "fr" ? "Erreur" : "خطأ",
        errorMessage,
        "destructive"
      );
    }
  };

  
 
  
  const handleNewOrder = () => {
    // Reset all state
    setShowConfirmation(false);
    setSelectedCity(null);
    setSelectedDate(undefined);
    setSelectedBoxSize(null);
    setExcludedFlavors([]);
    setSurpriseMe(false);
    setOrderNumber("");
    setCustomerData(null);
    setRemainingCapacity(DAILY_CAPACITY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // Computed Values
  const selectedCityData = CITIES.find((c) => c.name === selectedCity);
  const deliveryHours = selectedCityData?.deliveryHours || 24;
  const inSaleRabatRegion = selectedCityData?.inSaleRabatRegion || false;
  
  const selectedBoxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
  const maxExclusions = selectedBoxData?.maxExclusions || 3;
  
  const canCheckout =
    selectedCity &&
    selectedDate &&
    selectedBoxSize &&
    !isLoadingCapacity &&
    remainingCapacity >= MIN_AVAILABLE_FOR_ORDER &&
    remainingCapacity >= selectedBoxSize;
  
  // Render Confirmation Page
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
        customerName={customerData?.customerName || "Client"}
        deliveryDate={format(selectedDate, "PPP", { locale: fr })}
        onNewOrder={handleNewOrder}
        language={language}
      />
    );
  }
  
  // Render Main Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      <Navbar
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onCommanderClick={handleScrollToOrder}
      />
      
      <HeroSection 
        onCommanderClick={handleScrollToOrder} 
        language={language} 
      />
      
      <div
        ref={orderSectionRef}
        className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* City Selection */}
            <CitySelector
              selectedCity={selectedCity}
              onSelectCity={handleCitySelection}
              language={language}
            />
            
            {/* Multiple Orders Info */}
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
            
            {/* Date Selection (shows after city selection) */}
            {selectedCity && (
              <div className="space-y-6">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  language={language}
                  deliveryHours={deliveryHours}
                />
                
                {selectedDate && (
                  <>
                    {isLoadingCapacity ? (
                      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
                        <p className="text-center text-gray-600">
                          {language === "fr" ? "Chargement..." : "جاري التحميل..."}
                        </p>
                      </div>
                    ) : (
                      <AvailabilityBar
                        remaining={remainingCapacity}
                        language={language}
                      />
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Box and Flavor Selection (shows after date selection) */}
            {selectedCity && selectedDate && !isLoadingCapacity && remainingCapacity >= MIN_AVAILABLE_FOR_ORDER && (
              <>
                <BoxSelector
                  selectedBoxSize={selectedBoxSize}
                  onSelectBoxSize={setSelectedBoxSize}
                  language={language}
                  inSaleRabatRegion={inSaleRabatRegion}
                />
                
                {/* ALWAYS show flavor selector when box is selected */}
                {selectedBoxSize && (
                  <FlavorSelector
                    excludedFlavors={excludedFlavors}
                    onExcludedFlavorsChange={setExcludedFlavors}
                    surpriseMe={surpriseMe}
                    onSurpriseMeChange={handleSurpriseMeChange}
                    language={language}
                    maxExclusions={maxExclusions}
                  />
                )}
                
                {/* Checkout Form (shows when all required fields are selected) */}
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
            
            {/* Sold Out Message */}
            {selectedCity && selectedDate && !isLoadingCapacity && remainingCapacity < MIN_AVAILABLE_FOR_ORDER && (
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
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              boxSize={selectedBoxSize}
              excludedFlavors={excludedFlavors}
              surpriseMe={surpriseMe}
              language={language}
              selectedCity={selectedCity}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}