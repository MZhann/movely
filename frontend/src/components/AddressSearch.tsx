"use client";
import { useState, useEffect } from "react";
import { Search, X, ArrowLeft } from "lucide-react";

interface AddressSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (coords: [number, number], address: string) => void;
  apiKey: string;
}

export default function AddressSearch({
  isOpen,
  onClose,
  onSelect,
  apiKey,
}: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(
            query
          )}&format=json&ll=43.238949,76.889709&spn=20,20&bbox=40.5,42.5~87.5,55.5&lang=ru_RU&kind=locality&results=10`
        );
        const data = await response.json();
        const features = data.response.GeoObjectCollection.featureMember || [];
        setSuggestions(features);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, apiKey]);

  const handleSelect = (suggestion: any) => {
    const coords = suggestion.GeoObject.Point.pos
      .split(" ")
      .map(Number)
      .reverse() as [number, number];
    const address = suggestion.GeoObject.metaDataProperty.GeocoderMetaData.text;
    onSelect(coords, address);
    setQuery("");
    onClose();
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-zinc-900 z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите адрес в Казахстане"
              className="w-full p-3 pl-10 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-4">Загрузка...</div>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg transition"
            >
              <div className="text-white">
                {suggestion.GeoObject.metaDataProperty.GeocoderMetaData.text}
              </div>
              <div className="text-sm text-gray-400">
                {
                  suggestion.GeoObject.metaDataProperty.GeocoderMetaData.Address
                    .formatted
                }
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
