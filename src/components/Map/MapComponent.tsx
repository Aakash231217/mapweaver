import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getLength } from 'ol/sphere';
import { Coordinate } from 'ol/coordinate';
import { DrawModal } from './DrawModal';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<'linestring' | 'polygon' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [coordinates, setCoordinates] = useState<Array<{wp: string, coords: number[], distance: number}>>([]);
  const vectorSourceRef = useRef(new VectorSource());
  const drawRef = useRef<Draw | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([12.97169189, 12.97169189]),
        zoom: 12
      })
    });

    setMap(initialMap);

    return () => {
      initialMap.setTarget(undefined);
    };
  }, []);

  const startDrawing = (type: 'linestring' | 'polygon') => {
    if (!map) return;

    setDrawingMode(type);
    setShowModal(true);

    const draw = new Draw({
      source: vectorSourceRef.current,
      type: type === 'linestring' ? 'LineString' : 'Polygon'
    });

    map.addInteraction(draw);
    drawRef.current = draw;

    draw.on('drawend', (event) => {
      const feature = event.feature;
      const geometry = feature.getGeometry();
      
      if (geometry instanceof LineString) {
        const coords = geometry.getCoordinates().map(coord => toLonLat(coord));
        const newCoordinates = coords.map((coord, index) => {
          const distance = index > 0 ? 
            getLength(new LineString([coords[index-1], coord])) : 0;
          
          return {
            wp: `${index.toString().padStart(2, '0')}`,
            coords: coord,
            distance: Math.round(distance)
          };
        });
        
        setCoordinates(newCoordinates);
        toast.success("Linestring drawn successfully!");
      }
    });

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && drawRef.current) {
        drawRef.current.finishDrawing();
        map.removeInteraction(drawRef.current);
        drawRef.current = null;
        document.removeEventListener('keydown', handleKeyPress);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
  };

  return (
    <div className="relative h-screen w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={() => startDrawing('linestring')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Draw
        </Button>
      </div>

      <DrawModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        coordinates={coordinates}
        mode={drawingMode}
        onInsertPolygon={(position) => {
          setDrawingMode('polygon');
          // Handle polygon insertion logic
        }}
      />
    </div>
  );
};

export default MapComponent;