import React from "react";

interface TicketCardProps {
  price: number;
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  arrivalTime: string;
  travelTime: string;
  isHotTicket?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({
  price,
  departureCity,
  destinationCity,
  departureDate,
  arrivalTime,
  travelTime,
  isHotTicket,
}) => {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 shadow-lg w-full">
      {isHotTicket && (
        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
          Half price!
        </span>
      )}
      <h3 className="text-white text-xl font-bold mb-2">${price}</h3>
      <p className="text-gray-300 text-sm mb-2">
        {departureCity} - {destinationCity}
      </p>
      <div className="flex items-center text-gray-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        <span>
          {departureDate}, {arrivalTime} - {travelTime}
        </span>
      </div>
    </div>
  );
};

export default TicketCard;
