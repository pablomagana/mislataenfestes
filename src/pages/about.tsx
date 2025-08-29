import React from "react";
import Header from "@/components/header";
import { Music, MapPin, Calendar, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/analytics";
import { Link } from "wouter";

export default function About() {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: "Fiestas Patronales y Populares de Mislata 2025",
    startDate: "2025-08-23",
    endDate: "2025-09-06",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Mislata",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mislata",
        addressRegion: "Valencia",
        addressCountry: "ES"
      }
    },
    description:
      "Programa completo de las Fiestas de Mislata 2025: música en directo, eventos, orquestas, mascletàs, procesiones y actividades familiares.",
    keywords: "Mislata, fiestas, fiestas patronales, fiestas populares, eventos, música, conciertos, programa",
    url: typeof window !== "undefined" ? window.location.href : "https://"
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Header 
        searchQuery=""
        setSearchQuery={() => {}}
        showMobileSearch={false}
        setShowMobileSearch={() => {}}
        setShowFavoritesModal={() => {}}
        setShowCalendarModal={() => {}}
        filteredEventsCount={0}
        favoritesCount={0}
        today=""
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a eventos
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <section className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="max-w-4xl mx-auto">
            {/* Intro SEO */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Fiestas Patronales y Populares de Mislata 2025 – Programa completo de eventos
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Las <strong>Fiestas de Mislata 2025</strong> llegan del <strong>23 de agosto al 6 de septiembre</strong> con una programación repleta de cultura, tradición, <strong>música</strong> en directo y actividades para todas las edades. Aquí encontrarás el <strong>programa completo</strong> de las <strong>Fiestas Patronales y Populares de Mislata</strong>, con todos los horarios, lugares y <strong>eventos</strong> destacados para que no te pierdas nada.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="bg-festival-orange/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Music className="w-8 h-8 text-festival-orange" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Música en Directo</h3>
                <p className="text-sm text-gray-600">
                  Conciertos, orquestas y bandas en las plazas y avenidas de Mislata
                </p>
              </div>

              <div className="text-center p-4">
                <div className="bg-festival-red/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-festival-red" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Eventos Diarios</h3>
                <p className="text-sm text-gray-600">
                  Actividades durante dos semanas de <strong>fiestas</strong>
                </p>
              </div>

              <div className="text-center p-4">
                <div className="bg-festival-purple/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-festival-purple" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Ubicaciones</h3>
                <p className="text-sm text-gray-600">
                  <strong>Eventos</strong> repartidos por Mislata: Plaza de la Constitución, Av. Gregorio Gea y más
                </p>
              </div>

              <div className="text-center p-4">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Para Todos</h3>
                <p className="text-sm text-gray-600">
                  Actividades familiares, infantiles y para todos los públicos
                </p>
              </div>
            </div>

            {/* SEO content blocks */}
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Eventos destacados en las fiestas de Mislata
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    🎵 Música, conciertos y orquestas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Las <strong>Fiestas Patronales</strong> reúnen conciertos de grupos reconocidos, el Festival de Bandas de <strong>música</strong> y noches de orquesta con gran ambiente en la Plaza de la Constitución y la Avenida Gregorio Gea. Un calendario musical perfecto para disfrutar de <strong>eventos</strong> gratuitos al aire libre en <strong>Mislata</strong>.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    🎭 Tradición y cultura
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vive la <strong>Entrada Mora</strong>, las <strong>procesiones</strong>, la <strong>mascletà</strong> y otros actos que mantienen viva la identidad de <strong>Mislata</strong>, combinando costumbres valencianas con propuestas actuales.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    👨‍👩‍👧‍👦 Actividades para toda la familia
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Juegos infantiles, espectáculos y talleres para los más pequeños, además de <strong>eventos</strong> pensados para todos los públicos en el corazón de <strong>Mislata</strong>.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    📍 Fiestas Populares de Mislata 2025
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Del 2 al 6 de septiembre el <strong>Recinto Ferial</strong> concentra la diversión con desfiles, conciertos, casetas y la esperada <strong>mascletà nocturna</strong> y el <strong>correfoc</strong>. La mejor <strong>música</strong> y los mejores <strong>eventos</strong> para cerrar las <strong>fiestas</strong>.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
                Vive las Fiestas de Mislata 2025
              </h2>
              <p className="text-gray-600">
                Las <strong>Fiestas de Mislata</strong> combinan tradición y modernidad: desde los actos religiosos y culturales más antiguos hasta los conciertos más actuales. Son el momento ideal para visitar el municipio, disfrutar de la gastronomía local y de un calendario repleto de <strong>eventos</strong> y <strong>música</strong>. Consulta el programa oficial, añade tus favoritos y organiza tu agenda para no perderte nada.
              </p>
            </div>

            {/* Info box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-festival-orange/5 to-festival-red/5 rounded-lg border border-festival-orange/20">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                📅 Información Práctica
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="mb-2">
                    <strong>Fechas:</strong> Del 23 de agosto al 6 de septiembre de <strong>2025</strong>
                  </p>
                  <p className="mb-2">
                    <strong>Ubicación:</strong> Diferentes espacios y plazas de <strong>Mislata</strong>
                  </p>
                </div>
                <div>
                  <p className="mb-2">
                    <strong>Acceso:</strong> Gratuito para la mayoría de <strong>eventos</strong>
                  </p>
                  <p className="mb-2">
                    <strong>Transporte:</strong> Bien conectada con Valencia y área metropolitana
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link href="/">
                <Button className="bg-festival-orange hover:bg-festival-red text-white px-8 py-3 text-lg">
                  Ver Programa de Eventos
                </Button>
              </Link>
            </div>
          </div>

          {/* JSON-LD for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Fiestas de Mislata 2025
            </h4>
            <p className="text-gray-600 text-sm">
              Programa oficial de las <strong>fiestas patronales de Mislata</strong> con todos los 
              <strong> eventos</strong>, <strong>música</strong> y actividades culturales.
            </p>
          </div>
          
          <div className="border-t pt-4 text-xs text-gray-500">
            <p>
              Desarrollada por{" "}
              <OutboundLink 
                href="https://pablomagana.es" 
                linkId="footer_developer"
                className="text-gray-500 hover:text-gray-700 transition-colors underline"
              >
                pablomagana.es
              </OutboundLink>
              {" • "}
              <OutboundLink 
                href="https://mislata.es" 
                linkId="footer_ayuntamiento"
                className="text-gray-500 hover:text-gray-700 transition-colors underline"
              >
                Ayuntamiento de Mislata
              </OutboundLink>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
