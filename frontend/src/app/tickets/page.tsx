"use client";

import React, { useState } from "react";
import TicketSearchInput from "@/components/TicketSearchInput";
import TicketCard from "@/components/TicketCard";
import Link from "next/link";
import { Menu as MenuIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHotTickets, getTickets } from "@/lib/api";
import Menu from "@/components/menu";

const TicketsMainPage = () => {
  const [departureCity, setDepartureCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    departureCity: "",
    destinationCity: "",
  });

  const {
    data: hotTickets,
    isLoading: isLoadingHot,
    error: errorHot,
  } = useQuery({
    queryKey: ["hotTickets"],
    queryFn: getHotTickets,
    enabled: !searched,
  });

  const {
    data: searchedTickets,
    isLoading: isLoadingSearch,
    error: errorSearch,
  } = useQuery({
    queryKey: ["tickets", searchParams],
    queryFn: () => getTickets(searchParams),
    enabled: searched,
  });

  const handleSearch = () => {
    setSearchParams({
      departureCity,
      destinationCity,
    });
    setSearched(true);
  };

  const ticketsToDisplay = searched ? searchedTickets : hotTickets;
  const isLoading = searched ? isLoadingSearch : isLoadingHot;
  const error = searched ? errorSearch : errorHot;

  if (isLoading)
    return <div className="text-white text-center">Loading tickets...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center">
        Error loading tickets: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center "
        style={{
          backgroundImage: `url('/street-bg.png')`,
          filter: "blur(8px) brightness(50%)",
          transform: "scale(1.05)", // Slightly zoom to cover blur edges
        }}
      ></div>

      <Menu />
      <div className="w-full max-w-md p-4 mx-auto relative z-10">
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-2xl my-3 font-semibold text-center">
            Cheap flights at your
            <br /> fingertips
          </h1>
        </div>

        <div className="mb-8">
          <TicketSearchInput
            departureCity={departureCity}
            destinationCity={destinationCity}
            onDepartureCityChange={setDepartureCity}
            onDestinationCityChange={setDestinationCity}
            onSearch={handleSearch}
          />
        </div>

        <h2 className="text-xl font-bold mb-4">
          {searched ? "Search Results" : "Hot tickets"}
        </h2>
        <div className="grid gap-4">
          {ticketsToDisplay?.length === 0 ? (
            <p className="text-gray-400">
              No tickets found for your search criteria.
            </p>
          ) : (
            ticketsToDisplay?.map((ticket: any) => (
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
            ))
          )}
        </div>

        {!searched && (
          <Link href="/tickets/all">
            <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300">
              More tickets
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TicketsMainPage;
