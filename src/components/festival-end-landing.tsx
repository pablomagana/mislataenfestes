import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Camera, Music, Sparkles } from "lucide-react";

export default function FestivalEndLanding() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation on mount
    setIsVisible(true);
  }, []);

  const nextYear = new Date().getFullYear() + 1;

  return (
    <div
      className={`min-h-[80vh] flex items-center justify-center px-4 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Card className="max-w-4xl w-full bg-gradient-to-br from-festival-orange/10 via-white to-festival-red/10 border-2 border-festival-orange/20 shadow-2xl overflow-hidden">
        <CardContent className="p-8 md:p-12">
          {/* Animated sparkles */}
          <div className="relative">
            <div className="absolute top-0 left-1/4 animate-bounce">
              <Sparkles className="w-6 h-6 text-festival-orange opacity-60" />
            </div>
            <div className="absolute top-8 right-1/4 animate-bounce delay-300">
              <Sparkles className="w-5 h-5 text-festival-red opacity-60" />
            </div>
            <div className="absolute top-4 left-3/4 animate-bounce delay-500">
              <Sparkles className="w-4 h-4 text-festival-orange opacity-60" />
            </div>
          </div>

          {/* Main content */}
          <div className="text-center space-y-8 relative z-10">
            {/* Icon grid with pulse animation */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="animate-pulse-slow">
                <Music className="w-12 h-12 text-festival-orange" />
              </div>
              <div className="animate-pulse-slow delay-200">
                <Heart className="w-12 h-12 text-festival-red" />
              </div>
              <div className="animate-pulse-slow delay-400">
                <Camera className="w-12 h-12 text-festival-orange" />
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
                ¡Las Fiestas de Mislata {new Date().getFullYear()}
                <br />
                <span className="text-festival-orange">han terminado!</span>
              </h1>

              <div className="inline-block">
                <div className="bg-gradient-to-r from-festival-orange to-festival-red text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg animate-fade-in-up">
                  Gracias por celebrar con nosotros
                </div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-festival-orange"></div>
              <Sparkles className="w-6 h-6 text-festival-orange animate-spin-slow" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-festival-red"></div>
            </div>

            {/* Thank you message */}
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Esperamos que hayas disfrutado de cada momento, cada concierto, cada celebración.
              </p>
              <p className="text-lg md:text-xl text-gray-600">
                Los recuerdos quedan, las fotos permanecen, y la alegría continúa en nuestros corazones.
              </p>
            </div>

            {/* Next year announcement */}
            <div className="mt-12 p-8 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-festival-orange/30 shadow-inner">
              <Calendar className="w-16 h-16 text-festival-orange mx-auto mb-4 animate-bounce-slow" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                ¡Nos vemos en {nextYear}!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Prepárate para más música, más diversión y más momentos inolvidables en las próximas Fiestas de Mislata.
              </p>

              {/* Call to action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-gradient-to-r from-festival-orange to-festival-red text-white font-semibold px-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Revive los recuerdos
                </Button>
              </div>
            </div>

            {/* Footer message */}
            <div className="mt-8 text-gray-500 text-sm italic">
              "Las fiestas terminan, pero los recuerdos son eternos"
            </div>
          </div>

          {/* Floating background elements */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-festival-orange/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-festival-red/5 rounded-full blur-3xl animate-float-delayed"></div>
        </CardContent>
      </Card>

      {/* Add custom animations to global styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(20px, -20px);
          }
          66% {
            transform: translate(-20px, 20px);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-pulse-slow.delay-200 {
          animation-delay: 0.2s;
        }

        .animate-pulse-slow.delay-400 {
          animation-delay: 0.4s;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 3s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
