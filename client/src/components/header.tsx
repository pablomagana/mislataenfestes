import { Search, Heart, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import mislataEscudo from "@/assets/mislata-escudo.svg";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showMobileSearch: boolean;
  setShowMobileSearch: (show: boolean) => void;
  setShowFavoritesModal: (show: boolean) => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  showMobileSearch,
  setShowMobileSearch,
  setShowFavoritesModal
}: HeaderProps) {
  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={mislataEscudo} 
                  alt="Escudo de Mislata" 
                  className="w-8 h-10 drop-shadow-sm"
                />
                <div className="flex flex-col">
                  <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-festival-red to-festival-orange bg-clip-text text-transparent leading-tight">
                    Festes Mislata
                  </h1>
                  <div className="text-xs text-gray-500 font-medium tracking-wide">
                    2024
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar eventos..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-festival-orange focus:border-transparent"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowFavoritesModal(true)}
                className="text-gray-600 hover:text-festival-red transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-festival-purple transition-colors"
              >
                <Calendar className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden text-gray-600 hover:text-festival-orange"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-16 z-40 shadow-sm">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-festival-orange focus:border-transparent"
              autoFocus
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <div className="absolute right-2 top-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                  } else {
                    setShowMobileSearch(false);
                  }
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
