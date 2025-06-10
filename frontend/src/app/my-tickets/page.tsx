"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Menu from "@/components/menu";
import { Download, Plane, Train } from "lucide-react";
import { api, downloadBookingPdf } from "@/lib/api";

export default function MyTicketsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await api.get(`/bookings/user/${userId}`);
      return response.data;
    },
  });

  const handleDownloadTicket = async (
    bookingId: string,
    ticketType: string
  ) => {
    try {
      await downloadBookingPdf(bookingId);
      toast({
        title: "Success",
        description: "Ticket downloaded successfully!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download ticket",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center "
          style={{
            backgroundImage: `url('/street-bg.png')`,
            filter: "blur(8px) brightness(50%)",
            transform: "scale(1.05)", // Slightly zoom to cover blur edges
          }}
        ></div>
        <div className="relative z-50">
          {/* Wrapper for Menu with high z-index */}
          <Menu />
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center">Loading your tickets...</div>
        </div>
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center "
          style={{
            backgroundImage: `url('/street-bg.png')`,
            filter: "blur(8px) brightness(50%)",
            transform: "scale(1.05)", // Slightly zoom to cover blur edges
          }}
        ></div>
        <div className="relative z-50">
          {/* Wrapper for Menu with high z-index */}
          <Menu />
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Tickets Found</h1>
            <p className="text-gray-400 mb-6">
              You haven't booked any tickets yet.
            </p>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={() => router.push("/tickets")}
            >
              Book a Ticket
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center "
        style={{
          backgroundImage: `url('/street-bg.png')`,
          filter: "blur(8px) brightness(50%)",
          transform: "scale(1.05)", // Slightly zoom to cover blur edges
        }}
      ></div>
      <div className="relative z-50">
        {/* Wrapper for Menu with high z-index */}
        <Menu />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
        <div className="grid gap-6">
          {bookings.map((booking: any) => (
            <div
              key={booking._id}
              className="bg-neutral-800 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {booking.ticketType === "Ticket" ? (
                    <Plane className="h-6 w-6 text-blue-500 mr-3" />
                  ) : (
                    <Train className="h-6 w-6 text-green-500 mr-3" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      {booking.ticketId.departureCity} →{" "}
                      {booking.ticketId.destinationCity}
                    </h2>
                    <p className="text-gray-400">
                      {new Date(
                        booking.ticketId.departureDate
                      ).toLocaleDateString()}
                      , {booking.ticketId.arrivalTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-500">
                    ${booking.ticketId.price}
                  </p>
                  <p className="text-sm text-gray-400">
                    {booking.ticketType === "Ticket" ? "Flight" : "Train"} #
                    {booking.ticketType === "Ticket"
                      ? booking.ticketId.flightNumber
                      : booking.ticketId.trainNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-400">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      booking.status === "confirmed"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  ></span>
                  <span className="capitalize">{booking.status}</span>
                </div>
                <Button
                  variant="outline"
                  className="text-gray-400 hover:text-white"
                  onClick={() =>
                    handleDownloadTicket(booking._id, booking.ticketType)
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Ticket
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
