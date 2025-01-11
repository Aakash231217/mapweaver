import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface DrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: Array<{wp: string, coords: number[], distance: number}>;
  mode: 'linestring' | 'polygon' | null;
  onInsertPolygon: (position: 'before' | 'after') => void;
}

export const DrawModal = ({ isOpen, onClose, coordinates, mode, onInsertPolygon }: DrawModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'linestring' ? 'Mission Creation' : 'Polygon Tool'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-600">
              {mode === 'linestring' 
                ? "Click on the map to mark points of the route and then press ↵ complete the route."
                : "Click on the map to mark points of the polygon's perimeter, then press ↵ to close and complete the polygon"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-600 pb-2">
              <div>WP</div>
              <div className="col-span-2">Coordinates</div>
              <div>Distance (m)</div>
            </div>

            {coordinates.map((coord, index) => (
              <div key={coord.wp} className="grid grid-cols-4 gap-4 items-center text-sm">
                <div>{coord.wp}</div>
                <div className="col-span-2">
                  {coord.coords[0].toFixed(8)}, {coord.coords[1].toFixed(8)}
                </div>
                <div className="flex items-center justify-between">
                  <span>{coord.distance}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onInsertPolygon('before')}>
                        Insert Polygon before
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onInsertPolygon('after')}>
                        Insert Polygon after
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            {mode === 'polygon' && (
              <Button 
                variant="secondary"
                onClick={() => {/* Handle import points */}}
              >
                Import Points
              </Button>
            )}
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {/* Handle generate data */}}
            >
              Generate Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};