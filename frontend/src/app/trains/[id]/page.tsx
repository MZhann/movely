"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Menu from "@/components/menu";
import {
  ChevronLeft,
  Download,
  Clock,
  Users,
  Wifi,
  Coffee,
} from "lucide-react";
import { api } from "@/lib/api";

export default function TrainTicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isBooking, setIsBooking] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["trainTicket", id],
    queryFn: async () => {
      const response = await api.get(`/train-tickets/${id}`);
      return response.data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/train-tickets/${id}/book`);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Train ticket booked successfully",
      });
      // Download the PDF ticket
      const pdfBlob = new Blob([Buffer.from(data.pdfBuffer, "base64")], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `train-ticket-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      router.push("/my-tickets");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book train ticket",
        variant: "destructive",
      });
    },
  });

  const handleBook = async () => {
    setIsBooking(true);
    try {
      await bookMutation.mutateAsync();
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Menu />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading ticket details...</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Menu />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Ticket not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Menu />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-neutral-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {ticket.departureCity} → {ticket.destinationCity}
              </h1>
              <p className="text-gray-400">Train #{ticket.trainNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-yellow-500 mb-2">
                ${ticket.price}
              </h2>
              <p className="text-gray-400">{ticket.class} Class</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Journey Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(ticket.departureDate).toLocaleDateString()},{" "}
                    {ticket.departureTime} - {ticket.arrivalTime}
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{ticket.availableSeats} seats available</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {ticket.amenities.map((amenity: string) => (
                  <div
                    key={amenity}
                    className="flex items-center text-gray-300"
                  >
                    {amenity === "WiFi" ? (
                      <Wifi className="mr-2 h-4 w-4" />
                    ) : amenity === "Food Service" ? (
                      <Coffee className="mr-2 h-4 w-4" />
                    ) : null}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            onClick={handleBook}
            disabled={isBooking || ticket.availableSeats <= 0}
          >
            {isBooking
              ? "Booking..."
              : ticket.availableSeats <= 0
              ? "No Seats Available"
              : "Book Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
