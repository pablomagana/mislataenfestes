export interface FilterState {
  // Filtros de categoría (patronales/populares)
  patronales: boolean;
  populares: boolean;
  
  // Filtros de tipo de evento
  musical: boolean;
  
  // Filtros de estado
  upcoming: boolean;
  ongoing: boolean;
  finished: boolean;
  
  // Permite otros filtros dinámicos
  [key: string]: boolean;
}
