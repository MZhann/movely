"use client";

import React from "react";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getTicketById, createBooking, downloadBookingPdf } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface TicketDetailContentProps {
  id: string;
}

const TicketDetailContent: React.FC<TicketDetailContentProps> = ({ id }) => {
  const { toast } = useToast();
  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById(id),
  });

  const bookTicketMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Ticket booked successfully!",
      });
      console.log("Booking successful:", data);
      downloadBookingPdf(data._id);
    },
    onError: (err) => {
      console.error("Booking failed:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book ticket. Please try again.",
      });
    },
  });

  const handleBookTicket = () => {
    if (ticket) {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to book a ticket.",
        });
        return;
      }
      bookTicketMutation.mutate({
        ticketId: ticket._id,
        numberOfPassengers: 1,
        userId: userId,
      });
    }
  };

  if (isLoading)
    return (
      <div className="text-white text-center">Loading ticket details...</div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center">
        Error loading ticket: {error.message}
      </div>
    );
  if (!ticket)
    return <div className="text-white text-center">Ticket not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/tickets/all">
            <ChevronLeft className="text-white" size={24} />
          </Link>
          <span className="text-lg font-semibold text-blue-400">✈Drive</span>
        </div>
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-3xl font-bold text-green-500">${ticket.price}</h1>

        </div>

        <p className="text-center text-gray-400 mb-6">
          for 1 passenger, at City.Travel
        </p>

        {/* Fare inclusions */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Cheap fare including baggage
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              {ticket.carryOn ? (
                <CheckCircle className="text-green-500 mr-3" size={20} />
              ) : (
                <XCircle className="text-red-500 mr-3" size={20} />
              )}
              <span>Carry-on</span>
            </div>
            <div className="flex items-center">
              {ticket.baggage ? (
                <CheckCircle className="text-green-500 mr-3" size={20} />
              ) : (
                <XCircle className="text-red-500 mr-3" size={20} />
              )}
              <span>Baggage {ticket.baggage}</span>
            </div>
            <div className="flex items-center">
              {ticket.exchangeable ? (
                <CheckCircle className="text-green-500 mr-3" size={20} />
              ) : (
                <XCircle className="text-red-500 mr-3" size={20} />
              )}
              <span>Exchangeable</span>
            </div>
            <div className="flex items-center">
              {ticket.nonRefundable ? (
                <XCircle className="text-red-500 mr-3" size={20} />
              ) : (
                <CheckCircle className="text-green-500 mr-3" size={20} />
              )}
              <span>Non-refundable</span>
            </div>
          </div>
        </div>

        {/* Flight details */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {ticket.departureCity} - {ticket.destinationCity}
          </h2>
          <p className="text-gray-400 text-sm mb-4">{ticket.travelTime}</p>
          <div className="flex items-center mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <p className="text-gray-300">
              {new Date(ticket.departureDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              {ticket.arrivalTime}{" "}
              <span className="font-bold">{ticket.departureCity}</span>
            </p>
          </div>
          <div className="flex items-center relative pl-1">
            <div className="absolute left-1 top-0 bottom-0 w-px bg-gray-600"></div>
            <p className="ml-4 text-gray-400 text-sm">{ticket.airline}</p>
          </div>
          <div className="flex items-center mt-2">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            <p className="text-gray-300">
              {ticket.arrivalTime}{" "}
              <span className="font-bold">{ticket.destinationCity}</span>
            </p>
          </div>
        </div>

        {/* Book button */}
        <button
          onClick={handleBookTicket}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
          disabled={bookTicketMutation.isPending}
        >
          {bookTicketMutation.isPending
            ? "Booking..."
            : `Book for $${ticket.price}`}
        </button>
      </div>
    </div>
  );
};

export default TicketDetailContent;
