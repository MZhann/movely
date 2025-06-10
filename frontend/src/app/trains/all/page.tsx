"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import Menu from "@/components/menu";
import { searchTrainTickets } from "@/lib/api";

interface Filters {
  departureCity: string;
  destinationCity: string;
  minPrice: number;
  maxPrice: number;
  class: string;
}

export default function AllTrainTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    departureCity: searchParams.get("departureCity") || "",
    destinationCity: searchParams.get("destinationCity") || "",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 1000,
    class: searchParams.get("class") || "",
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["trainTickets", filters],
    queryFn: async () => {
      return searchTrainTickets({
        departureCity: filters.departureCity,
        destinationCity: filters.destinationCity,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        class: filters.class,
      });
    },
  });

  const handleApplyFilters = () => {
    const queryParams = new URLSearchParams();
    if (filters.departureCity) {
      queryParams.append("departureCity", filters.departureCity);
    }
    if (filters.destinationCity) {
      queryParams.append("destinationCity", filters.destinationCity);
    }
    if (filters.minPrice) {
      queryParams.append("minPrice", filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      queryParams.append("maxPrice", filters.maxPrice.toString());
    }
    if (filters.class) {
      queryParams.append("class", filters.class);
    }
    router.push(`/trains/all?${queryParams.toString()}`);
  };

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
  };

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/trains">
            <ChevronLeft className="text-white" size={24} />
          </Link>
          <span className="text-lg font-semibold text-blue-400">✈Drive</span>
        </div>

        <div className="flex justify-center w-full items-center mb-4">
          <h1 className="text-xl font-bold">All Train Tickets</h1>
        </div>

        {/* Filter options */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Departure City"
                className="bg-transparent w-full text-white placeholder-gray-400 focus:outline-none"
                value={filters.departureCity}
                onChange={(e) =>
                  setFilters({ ...filters, departureCity: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Destination City"
                className="bg-transparent w-full text-white placeholder-gray-400 focus:outline-none"
                value={filters.destinationCity}
                onChange={(e) =>
                  setFilters({ ...filters, destinationCity: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Price Range
              </label>
              <Slider
                defaultValue={[filters.minPrice, filters.maxPrice]}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
            </div>
            <div>
              <select
                className="w-full bg-gray-500 rounded-lg border border-neutral-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={filters.class}
                onChange={(e) =>
                  setFilters({ ...filters, class: e.target.value })
                }
              >
                <option value="">All Classes</option>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
            <button
              onClick={handleApplyFilters}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Ticket List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-white text-center">Loading tickets...</div>
          ) : tickets?.length === 0 ? (
            <p className="text-gray-400">
              No tickets found for your search criteria.
            </p>
          ) : (
            tickets?.map((ticket: any) => (
              <div
                key={ticket._id}
                className="bg-neutral-800 rounded-lg p-4 shadow-lg cursor-pointer hover:bg-neutral-700 transition"
                onClick={() => router.push(`/trains/${ticket._id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      ${ticket.price}
                    </h3>
                    <p className="text-gray-300 text-sm mb-2">
                      {ticket.departureCity} - {ticket.destinationCity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {ticket.availableSeats} seats left
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span>
                    {new Date(ticket.departureDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    , {ticket.departureTime} - {ticket.travelTime}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
