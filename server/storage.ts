import { type FestivalEvent, type InsertFestivalEvent } from "@shared/schema";
import { randomUUID } from "crypto";

// Helper function to calculate event status based on current date/time
function calculateEventStatus(eventDate: string, eventTime: string): string {
  try {
    // Get current time and adjust for Spanish timezone (UTC+2 in August)
    const now = new Date();
    const spanishOffset = 2; // UTC+2 for Spanish summer time in August
    const spanishTime = new Date(now.getTime() + (spanishOffset * 60 * 60 * 1000));
    
    const [year, month, day] = eventDate.split('-').map(Number);
    const [hours, minutes] = eventTime.split(':').map(Number);
    
    // Create event datetime
    const eventDateTime = new Date(Date.UTC(year, month - 1, day, hours - spanishOffset, minutes));
    const eventEndTime = new Date(eventDateTime.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hour duration
    
    if (spanishTime < eventDateTime) {
      return 'upcoming';
    } else if (spanishTime >= eventDateTime && spanishTime <= eventEndTime) {
      return 'ongoing';
    } else {
      return 'finished';
    }
  } catch (error) {
    return 'upcoming'; // Default to upcoming if there's an error
  }
}

export interface IStorage {
  getAllEvents(): Promise<FestivalEvent[]>;
  getEventById(id: string): Promise<FestivalEvent | undefined>;
  getEventsByCategory(category: string): Promise<FestivalEvent[]>;
  getEventsByStatus(status: string): Promise<FestivalEvent[]>;
  searchEvents(query: string): Promise<FestivalEvent[]>;
  createEvent(event: InsertFestivalEvent): Promise<FestivalEvent>;
  updateEventStatus(id: string, status: string): Promise<FestivalEvent | undefined>;
}

export class MemStorage implements IStorage {
  private events: Map<string, FestivalEvent>;

  constructor() {
    this.events = new Map();
    this.initializeEvents();
  }

  private initializeEvents() {
    // Initialize with festival data from the provided text
    const initialEvents: FestivalEvent[] = [

      // Fiestas Patronales (fechas futuras)
      {
        id: "fp001",
        name: "NOCHE REMEMBER CON JOSÉ COLL",
        date: "2025-08-23",
        time: "22:00",
        location: "Av. Gregorio Gea",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "música",
        status: "upcoming",
        description: null,
        order: null
      },
      {
        id: "fp002",
        name: "GRAN ENTRADA MORA",
        date: "2025-08-24",
        time: "20:00",
        location: "C/ Cervantes, C/ Ramón y Cajal, C/ Mayor hasta la Pza. de la Constitución",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "procesión",
        status: "upcoming",
        description: "Recorrido: C/ Cervantes, C/ Ramón y Cajal, C/ Mayor hasta la Pza. de la Constitución",
        order: null
      },
      {
        id: "fp003",
        name: "XLVI FESTIVAL DE BANDAS DE MÚSICA",
        date: "2025-08-25",
        time: "22:30",
        location: "Pza. de la Constitución",
        organizer: "CIM y la Unión Musical de Lliria",
        category: "patronales",
        type: "concierto",
        status: "upcoming",
        description: "Concierto del CIM y la Unión Musical de Lliria",
        order: null
      },
      {
        id: "fp004",
        name: "JUEGOS TRADICIONALES INFANTILES",
        date: "2025-08-26",
        time: "18:00",
        location: "Pza. de la Morería",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "infantil",
        status: "upcoming",
        description: null,
        order: null
      },
      {
        id: "fp005",
        name: "HORCHATA Y FARTONS",
        date: "2025-08-26",
        time: "20:00",
        location: "Pza. de la Constitución",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "gastronómico",
        status: "finished",
        description: null,
        order: null
      },
      {
        id: "fp006",
        name: "PASSEJÀ NUESTRA SEÑORA DE LOS ÁNGELES",
        date: "2025-08-27",
        time: "20:30",
        location: "Pza. de la Constitución, C/ de la Estación, Av. Gregorio Gea, C/ Murillo, C/ Ntra. Sra. de los Ángeles, C/ Antonio Molle, Av. Gregorio Gea, Av. del Sur, C/ Lepanto, Av. Blasco Ibáñez, C/Ramón y Cajal, C/ Mayor y Pza. de la Constitución",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "procesión",
        status: "finished",
        description: "Recorrido por el centro histórico",
        order: "1"
      },
      {
        id: "fp007",
        name: "TRASLADO DEL CRISTO",
        date: "2025-08-27",
        time: "00:15",
        location: "Pza. de la Constitución, C. Mayor, C. Miguel Hernández y Av. Gregorio Gea",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "procesión",
        status: "finished",
        description: "Recorrido: Pza. de la Constitución, C. Mayor, C. Miguel Hernández y Av. Gregorio Gea",
        order: "2"
      },
      {
        id: "fp008",
        name: "PASSEJÀ SMO. CRISTO DE LA FE",
        date: "2025-08-28",
        time: "21:00",
        location: "Av. Gregorio Gea, C. Miguel Hernández, C. Mayor y Pza. de la Constitución",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "procesión",
        status: "finished",
        description: "Recorrido: Av. Gregorio Gea, C. Miguel Hernández, C. Mayor y Pza. de la Constitución",
        order: null
      },
      {
        id: "fp009",
        name: "JUEGOS TRADICIONALES INFANTILES",
        date: "2025-08-29",
        time: "18:00",
        location: "Pza. de la Constitución",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "infantil",
        status: "finished",
        description: null,
        order: null
      },
      {
        id: "fp010",
        name: "XOCOLATÀ",
        date: "2025-08-29",
        time: "19:30",
        location: "Pza. de la Constitución",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "gastronómico",
        status: "finished",
        description: null,
        order: null
      },
      {
        id: "fp011",
        name: "ORQUESTA EUFORIA",
        date: "2025-08-29",
        time: "23:30",
        location: "Av. Gregorio Gea, frente al Centro Cultural Carmen Alborch",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "música",
        status: "finished",
        description: null,
        order: null
      },
      {
        id: "fp012",
        name: "VÍSPERA DE FIESTA",
        date: "2025-08-30",
        time: "12:00",
        location: "Pza. de la Constitución",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "tradicional",
        status: "finished",
        description: null,
        order: null
      },
      {
        id: "fp013",
        name: "CONCURSO DE PAELLAS",
        date: "2025-08-30",
        time: "18:00",
        location: "Av. Gregorio Gea",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "gastronómico",
        status: "finished",
        description: null,
        order: null
      },
      {
        id: "fp014",
        name: "ORQUESTA AZAHARA",
        date: "2025-08-30",
        time: "23:00",
        location: "Av. Gregorio Gea, frente al Centro Cultural Carmen Alborch",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "música",
        status: "ongoing",
        description: null,
        order: null
      },
      {
        id: "fp015",
        name: "DESPERTÀ",
        date: "2025-08-31",
        time: "08:00",
        location: "Pza. de la Constitución",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "tradicional",
        status: "upcoming",
        description: null,
        order: "1"
      },
      {
        id: "fp016",
        name: "MASCLETÀ",
        date: "2025-08-31",
        time: "14:30",
        location: "Av. Gregorio Gea",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "tradicional",
        status: "upcoming",
        description: "Pirotecnia Valenciana",
        order: "2"
      },
      {
        id: "fp017",
        name: "PROCESIÓN",
        date: "2025-08-31",
        time: "21:00",
        location: "Pza. de la Constitución, C/ Estación, Av. Gregorio Gea, C/ Murillo",
        organizer: "Clavaría Smo. Cristo de la Fe",
        category: "patronales",
        type: "procesión",
        status: "upcoming",
        description: "Recorrido: Pza. de la Constitución, C/ Estación, Av. Gregorio Gea, C/ Murillo, continuando por recorrido habitual hasta Pza. de la Constitución",
        order: "3"
      },
      {
        id: "fp018",
        name: "NIT D'ALBAES",
        date: "2025-08-31",
        time: "00:30",
        location: "Centro histórico de la población",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "tradicional",
        status: "upcoming",
        description: "Recorrido: Centro histórico de la población",
        order: "4"
      },
      {
        id: "fp019",
        name: "DESPERTÀ",
        date: "2025-09-01",
        time: "07:30",
        location: "Pza. de la Constitución",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "tradicional",
        status: "upcoming",
        description: null,
        order: null
      },
      {
        id: "fp020",
        name: "MASCLETÀ",
        date: "2025-09-01",
        time: "14:30",
        location: "Pza. Mayor",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "tradicional",
        status: "upcoming",
        description: null,
        order: null
      },
      {
        id: "fp021",
        name: "ENTRÀ DE LA MURTA",
        date: "2025-09-01",
        time: "18:00",
        location: "Mismo recorrido que la procesión",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "tradicional",
        status: "upcoming",
        description: "Recorrido: Mismo recorrido que la procesión",
        order: null
      },
      {
        id: "fp022",
        name: "PROCESIÓN",
        date: "2025-09-01",
        time: "21:30",
        location: "El habitual",
        organizer: "Clavaría Ntra. Sra. de los Ángeles",
        category: "patronales",
        type: "procesión",
        status: "upcoming",
        description: "Recorrido: El habitual",
        order: null
      },
      // Fiestas Populares
      {
        id: "fpop001",
        name: "VISITA INSTITUCIONAL",
        date: "2025-09-02",
        time: "19:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "tradicional",
        status: "upcoming",
        description: "Visita a las casetas participantes",
        order: null
      },
      {
        id: "fpop002",
        name: "ESPECTÁCULO INAUGURAL Y ENCENDIDO DE LUCES",
        date: "2025-09-02",
        time: "20:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "espectáculo",
        status: "upcoming",
        description: null,
        order: null
      },
      {
        id: "fpop003",
        name: "ORQUESTA MÓNACO PARTY",
        date: "2025-09-02",
        time: "23:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "música",
        status: "upcoming",
        description: null,
        order: null
      },
      {
        id: "fpop004",
        name: "DESFILE DE DISFRACES",
        date: "2025-09-03",
        time: "18:30",
        location: "Pza. Príncipe de Asturias a Recinto Ferial",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "espectáculo",
        status: "upcoming",
        description: "Con espectáculo itinerante Diminuts de la Cía LA FAM. Salida desde Pza. Príncipe de Asturias y llegada a Recinto Ferial",
        order: "1"
      },
      {
        id: "fpop005",
        name: "ESPECTÁCULO MUSICAL INFANTIL LOS TROTAMUNDOS",
        date: "2025-09-03",
        time: "20:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "infantil",
        status: "upcoming",
        description: null,
        order: "2"
      },
      {
        id: "fpop006",
        name: "CONCIERTO DEPOL",
        date: "2025-09-03",
        time: "23:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "concierto",
        status: "upcoming",
        description: null,
        order: "3"
      },
      {
        id: "fpop007",
        name: "ORQUESTA LA PATO",
        date: "2025-09-03",
        time: "00:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "música",
        status: "upcoming",
        description: null,
        order: "4"
      },
      {
        id: "fpop008",
        name: "JUEGOS INFANTILES ELS GROGUETS",
        date: "2025-09-04",
        time: "19:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "infantil",
        status: "upcoming",
        description: null,
        order: "1"
      },
      {
        id: "fpop009",
        name: "CONCIERTO ZULÚ",
        date: "2025-09-04",
        time: "20:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "concierto",
        status: "upcoming",
        description: null,
        order: "2"
      },
      {
        id: "fpop010",
        name: "REPARTO DE PINCHOS",
        date: "2025-09-04",
        time: "20:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Penya Els Tronats",
        category: "populares",
        type: "gastronómico",
        status: "upcoming",
        description: "En colaboración con la Penya Els Tronats",
        order: "3"
      },
      {
        id: "fpop011",
        name: "CONCIERTO LA FÚMIGA + NAINA",
        date: "2025-09-04",
        time: "23:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "concierto",
        status: "upcoming",
        description: null,
        order: "4"
      },
      {
        id: "fpop012",
        name: "ORQUESTA LA TRIBU",
        date: "2025-09-04",
        time: "00:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "música",
        status: "upcoming",
        description: null,
        order: "5"
      },
      {
        id: "fpop013",
        name: "JUEGOS INFANTILES JUGACIRC",
        date: "2025-09-05",
        time: "19:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "infantil",
        status: "upcoming",
        description: null,
        order: "1"
      },
      {
        id: "fpop014",
        name: "CONCIERTO YAMBÚ",
        date: "2025-09-05",
        time: "20:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "concierto",
        status: "upcoming",
        description: null,
        order: "2"
      },
      {
        id: "fpop015",
        name: "CORREFOC",
        date: "2025-09-05",
        time: "22:00",
        location: "Pza. Príncipe de Asturias a Pza. de la Libertad",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "tradicional",
        status: "upcoming",
        description: "Salida desde Pza. Príncipe de Asturias y llegada a Pza. de la Libertad",
        order: "3"
      },
      {
        id: "fpop016",
        name: "CONCIERTO BERET",
        date: "2025-09-05",
        time: "23:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "concierto",
        status: "upcoming",
        description: null,
        order: "4"
      },
      {
        id: "fpop017",
        name: "ORQUESTA SCREAM",
        date: "2025-09-05",
        time: "01:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "música",
        status: "upcoming",
        description: null,
        order: "5"
      },
      {
        id: "fpop018",
        name: "JUEGOS INFANTILES L'OEST",
        date: "2025-09-06",
        time: "19:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "infantil",
        status: "upcoming",
        description: null,
        order: "1"
      },
      {
        id: "fpop019",
        name: "COVERS CON SOMBRERO",
        date: "2025-09-06",
        time: "20:00",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "música",
        status: "upcoming",
        description: null,
        order: "2"
      },
      {
        id: "fpop020",
        name: "MASCLETÀ NOCTURNA",
        date: "2025-09-06",
        time: "00:00",
        location: "Pza. de la Libertad",
        organizer: "Pirotecnia del Mediterráneo",
        category: "populares",
        type: "tradicional",
        status: "upcoming",
        description: "Pirotecnia del Mediterráneo",
        order: "3"
      },
      {
        id: "fpop021",
        name: "CONCIERTO PANORAMA",
        date: "2025-09-06",
        time: "00:30",
        location: "Recinto Ferial, C/ Hospital",
        organizer: "Ayuntamiento",
        category: "populares",
        type: "concierto",
        status: "upcoming",
        description: null,
        order: "4"
      }
    ];

    initialEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  async getAllEvents(): Promise<FestivalEvent[]> {
    const events = Array.from(this.events.values());
    // Update event statuses based on current date/time
    return events.map(event => ({
      ...event,
      status: calculateEventStatus(event.date, event.time)
    }));
  }

  async getEventById(id: string): Promise<FestivalEvent | undefined> {
    return this.events.get(id);
  }

  async getEventsByCategory(category: string): Promise<FestivalEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.category === category
    );
  }

  async getEventsByStatus(status: string): Promise<FestivalEvent[]> {
    return Array.from(this.events.values()).filter(
      event => event.status === status
    );
  }

  async searchEvents(query: string): Promise<FestivalEvent[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.events.values()).filter(event =>
      event.name.toLowerCase().includes(lowercaseQuery) ||
      event.location.toLowerCase().includes(lowercaseQuery) ||
      event.organizer.toLowerCase().includes(lowercaseQuery) ||
      event.type.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createEvent(insertEvent: InsertFestivalEvent): Promise<FestivalEvent> {
    const id = insertEvent.id || randomUUID();
    const event: FestivalEvent = { 
      ...insertEvent, 
      id, 
      description: insertEvent.description || null,
      order: insertEvent.order || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEventStatus(id: string, status: string): Promise<FestivalEvent | undefined> {
    const event = this.events.get(id);
    if (event) {
      const updatedEvent = { ...event, status };
      this.events.set(id, updatedEvent);
      return updatedEvent;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
