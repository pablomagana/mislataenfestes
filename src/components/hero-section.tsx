import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";

interface HeroSectionProps {
  currentEvent: FestivalEvent | undefined;
}

export default function HeroSection({ currentEvent }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-festival-orange to-festival-red rounded-xl p-6 mb-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-3xl font-display font-bold mb-2">Fiestas de Mislata 2024</h2>
          <p className="text-xl opacity-90">Del 23 de agosto al 6 de septiembre</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-sm opacity-80">Ahora:</div>
          {currentEvent ? (
            <>
              <div className="text-lg font-semibold">{currentEvent.name}</div>
              <div className="text-sm">{currentEvent.location}</div>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold">No hay eventos en curso</div>
              <div className="text-sm">Próximo evento pronto</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
