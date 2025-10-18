"use client"
import macaronsImage from "../../../public/macaronHero.png";


export default function HeroSection({ onCommanderClick, language }) {
  const labels = {
    fr: {
      title: "Des Macarons Frais, Préparés Chaque Jour",
      subtitle: "Quantité Limitée. Saveurs Illimitées.",
      description:
        "Savourez l'excellence artisanale avec nos macarons fraîchement préparés. Choisissez parmi 12 saveurs délicieuses.",
      cta: "Commander ici",
      available: "Saveurs disponibles",
    },
    ar: {
      title: "ماكرون طازج، محضر يوميا",
      subtitle: "كمية محدودة. نكهات غير محدودة.",
      description:
        "استمتع بالتميز الحرفي مع الماكرون الطازج المحضر. اختر من بين 12 نكهة لذيذة.",
      cta: "اطلب هنا",
      available: "النكهات المتاحة",
    },
  };

  return (
    <section className="relative min-h-[75vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(/macaronHero.png)`,
        }}
      />
      
 {/* Gradient Overlay */}
 <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70" />
      
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-6 lg:py-6">
        <div className="max-w-3xl">
          <h1 className="font-serif font-bold text-4xl md:text-6xl lg:text-6xl text-gray-900 leading-tight mb-4">
            {labels[language].title}
          </h1>
          
          <p
            className="font-serif font-semibold text-3xl md:text-5xl lg:text-6xl leading-tight mb-8"
            style={{ color: "#E87461" }}
          >
            {labels[language].subtitle}
          </p>
          
          <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl">
            {labels[language].description}
          </p>
          
          {/* CTA Button */}
          <button
            onClick={onCommanderClick}
            data-testid="button-hero-order"
            className="inline-flex items-center justify-center gap-2 h-16 px-10 bg-[#E18B73] text-white  font-semibold hover:bg-[#D47158] rounded-xl  text-xl  hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200 shadow-lg"
          >
            {labels[language].cta}
          </button>
          
          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-8 items-center">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {labels[language].available}
              </p>
              <p className="font-mono text-3xl font-bold text-[#E18B73]">12</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}