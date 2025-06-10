"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import Menu from "@/components/menu";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface SearchParams {
  departureCity: string;
  destinationCity: string;
  departureDate: Date | undefined;
}

export default function TrainTicketsPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    departureCity: "",
    destinationCity: "",
    departureDate: undefined,
  });

  const { data: hotTickets, isLoading: isLoadingHot } = useQuery({
    queryKey: ["hotTrainTickets"],
    queryFn: async () => {
      const response = await api.get("/train-tickets/hot");
      return response.data;
    },
  });

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchParams.departureCity) {
      queryParams.append("departureCity", searchParams.departureCity);
    }
    if (searchParams.destinationCity) {
      queryParams.append("destinationCity", searchParams.destinationCity);
    }
    if (searchParams.departureDate) {
      queryParams.append(
        "departureDate",
        searchParams.departureDate.toISOString()
      );
    }
    router.push(`/trains/all?${queryParams.toString()}`);
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
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Search Section */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6">Search Train Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Departure City"
                className="bg-transparent"
                value={searchParams.departureCity}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    departureCity: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Destination City"
                className="bg-transparent"
                value={searchParams.destinationCity}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    destinationCity: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      !searchParams.departureDate && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchParams.departureDate ? (
                      format(searchParams.departureDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-900 border border-zinc-800 shadow-lg z-[100]">
                  <Calendar
                    mode="single"
                    selected={searchParams.departureDate}
                    onSelect={(date) =>
                      setSearchParams({ ...searchParams, departureDate: date })
                    }
                    initialFocus
                    className="rounded-md border border-zinc-800 bg-gray-500"
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption:
                        "flex justify-center pt-1 relative items-center text-white",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-zinc-400 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-zinc-800/50 [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-zinc-200 hover:text-white",
                      day_range_end: "day-range-end",
                      day_selected:
                        "bg-yellow-500 text-zinc-900 hover:bg-yellow-600 hover:text-zinc-900 focus:bg-yellow-500 focus:text-zinc-900 font-semibold",
                      day_today: "bg-zinc-800 text-white font-semibold",
                      day_outside: "day-outside text-zinc-400 opacity-50",
                      day_disabled: "text-zinc-400 opacity-50",
                      day_range_middle:
                        "aria-selected:bg-zinc-800 aria-selected:text-white",
                      day_hidden: "invisible",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Search Trains
          </Button>
        </div>

        {/* Hot Tickets Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Hot Train Tickets</h2>
          {isLoadingHot ? (
            <div className="text-center">Loading hot tickets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotTickets?.map((ticket: any) => (
                <div
                  key={ticket._id}
                  className="bg-neutral-800 rounded-lg p-6 shadow-lg cursor-pointer hover:bg-neutral-700 transition"
                  onClick={() => router.push(`/trains/${ticket._id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-500">
                        ${ticket.price}
                      </h3>
                      <p className="text-gray-300">
                        {ticket.departureCity} → {ticket.destinationCity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {ticket.availableSeats} seats left
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span>
                      {new Date(ticket.departureDate).toLocaleDateString()},{" "}
                      {ticket.departureTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
