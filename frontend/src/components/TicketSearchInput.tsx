import React from "react";
import { Search } from "lucide-react";

interface TicketSearchInputProps {
  departureCity: string;
  destinationCity: string;
  onDepartureCityChange: (city: string) => void;
  onDestinationCityChange: (city: string) => void;
  onSearch: () => void;
}

const TicketSearchInput: React.FC<TicketSearchInputProps> = ({
  departureCity,
  destinationCity,
  onDepartureCityChange,
  onDestinationCityChange,
  onSearch,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Departure City (e.g., Almaty)"
          className="bg-transparent w-full text-white placeholder-gray-400 focus:outline-none text-lg"
          value={departureCity}
          onChange={(e) => onDepartureCityChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <hr className="border-neutral-700 mb-4" />
      <div className="flex items-center space-x-2">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Destination City (e.g., Astana)"
          className="bg-transparent w-full text-white placeholder-gray-400 focus:outline-none text-lg"
          value={destinationCity}
          onChange={(e) => onDestinationCityChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <button
        onClick={onSearch}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Search Flights
      </button>
    </div>
  );
};

export default TicketSearchInput;
