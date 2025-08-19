import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FilterState } from "@/pages/home";

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  eventCounts: {
    patronales: number;
    populares: number;
  };
}

export default function FilterSidebar({
  filters,
  setFilters,
  dateRange,
  setDateRange,
  eventCounts
}: FilterSidebarProps) {
  const handleFilterChange = (key: keyof FilterState, value: boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <aside className="lg:w-72 space-y-6">
      {/* Festival Type Filter */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tipo de Fiesta</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="patronales"
                checked={filters.patronales}
                onCheckedChange={(checked) => handleFilterChange('patronales', !!checked)}
                className="text-festival-orange focus:ring-festival-orange"
              />
              <Label htmlFor="patronales" className="text-gray-700">Fiestas Patronales</Label>
            </div>
            <Badge className="bg-festival-orange text-white">
              {eventCounts.patronales}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="populares"
                checked={filters.populares}
                onCheckedChange={(checked) => handleFilterChange('populares', !!checked)}
                className="text-festival-green focus:ring-festival-green"
              />
              <Label htmlFor="populares" className="text-gray-700">Fiestas Populares</Label>
            </div>
            <Badge className="bg-festival-green text-white">
              {eventCounts.populares}
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="upcoming"
              checked={filters.upcoming}
              onCheckedChange={(checked) => handleFilterChange('upcoming', !!checked)}
              className="text-blue-500 focus:ring-blue-500"
            />
            <Label htmlFor="upcoming" className="text-gray-700">Próximos</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="ongoing"
              checked={filters.ongoing}
              onCheckedChange={(checked) => handleFilterChange('ongoing', !!checked)}
              className="text-green-500 focus:ring-green-500"
            />
            <Label htmlFor="ongoing" className="text-gray-700">En curso</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="finished"
              checked={filters.finished}
              onCheckedChange={(checked) => handleFilterChange('finished', !!checked)}
              className="text-gray-400 focus:ring-gray-400"
            />
            <Label htmlFor="finished" className="text-gray-700">Terminados</Label>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fecha</h3>
        <div className="space-y-3">
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-festival-orange focus:border-transparent"
          />
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-festival-orange focus:border-transparent"
          />
        </div>
      </div>
    </aside>
  );
}
