"use client";

import React from "react";
import { ChevronLeft, Menu } from "lucide-react";
import TicketCard from "@/components/TicketCard";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/lib/api";

const AllTicketsPage = () => {
  const [departureCity, setDepartureCity] = React.useState("");
  const [destinationCity, setDestinationCity] = React.useState("");
  const [isOneWay, setIsOneWay] = React.useState(true);
  const [passengers, setPassengers] = React.useState(1);
  const [searchParams, setSearchParams] = React.useState({
    departureCity: "",
    destinationCity: "",
    isOneWay: true,
    passengers: 1,
  });

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tickets", searchParams],
    queryFn: () =>
      getTickets({
        departureCity: searchParams.departureCity,
        destinationCity: searchParams.destinationCity,
        isOneWay: searchParams.isOneWay,
        passengers: searchParams.passengers,
      }),
  });

  const handleSearch = () => {
    setSearchParams({
      departureCity,
      destinationCity,
      isOneWay,
      passengers,
    });
  };

  if (isLoading)
    return <div className="text-white text-center">Loading tickets...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center">
        Error loading tickets: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen text-white flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center "
        style={{
          backgroundImage: `url('/street-bg.png')`,
          filter: "blur(8px) brightness(50%)",
          transform: "scale(1.05)", // Slightly zoom to cover blur edges
        }}
      ></div>
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/tickets">
            <ChevronLeft className="text-white" size={24} />
          </Link>
          <span className="text-lg font-semibold text-blue-400">✈Drive</span>
        </div>

        <div className="flex justify-center w-full items-center mb-4">
          <h1 className="text-xl font-bold">All Tickets</h1>
        </div>
        {/* Filter options */}
        <div className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            placeholder="Departure City"
            className="w-full p-3 rounded-lg bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={departureCity}
            onChange={(e) => setDepartureCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Destination City"
            className="w-full p-3 rounded-lg bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <label htmlFor="oneWay" className="text-white">
              One-way:
            </label>
            <input
              type="checkbox"
              id="oneWay"
              checked={isOneWay}
              onChange={(e) => setIsOneWay(e.target.checked)}
              className="form-checkbox h-5 w-5 text-yellow-500 rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="passengers" className="text-white">
              Passengers:
            </label>
            <input
              type="number"
              id="passengers"
              min="1"
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="w-20 p-2 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Ticket List */}
        <div className="grid gap-4">
          {tickets?.map((ticket: any) => (
            <Link href={`/tickets/${ticket._id}`} key={ticket._id}>
              <TicketCard
                price={ticket.price}
                departureCity={ticket.departureCity}
                destinationCity={ticket.destinationCity}
                departureDate={new Date(
                  ticket.departureDate
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
                arrivalTime={ticket.arrivalTime}
                travelTime={ticket.travelTime}
                isHotTicket={ticket.isHotTicket}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllTicketsPage;
