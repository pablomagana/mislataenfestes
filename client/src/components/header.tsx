import { Search, Heart, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
              <div className="flex items-center space-x-2">
                <i className="fas fa-star text-festival-orange text-2xl"></i>
                <h1 className="text-xl font-display font-bold text-gray-800">Eventos</h1>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-festival-orange focus:border-transparent"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
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
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-festival-orange focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </>
  );
}
