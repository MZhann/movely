"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import Menu from "../../../components/menu";
import axios from "axios";
import { useToast } from "../../../components/ui/use-toast";

interface Order {
  _id: string;
  date: string;
  name: string;
  price: number;
  comment: string;
  destination_a: string;
  destination_b: string;
  destination_a_coordinates: string;
  destination_b_coordinates: string;
  ride_time: string;
  status: string;
  driver_location: {
    type: string;
    coordinates: [number, number];
  };
  current_driver_location: {
    type: string;
    coordinates: [number, number];
  };
  estimated_arrival_time: string;
  accepted_at: string;
  worker_id: string;
  worker: {
    name: string;
    carModel: string;
    carNumber: string;
  };
}

export default function RideTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [map, setMap] = useState<any>(null);
  const [driverMarker, setDriverMarker] = useState<any>(null);
  const [routeLine, setRouteLine] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/worker_orders/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch order details",
        });
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [params.id, router, toast]);

  useEffect(() => {
    if (!order || !mapContainerRef.current) return;

    const initMap = () => {
      const ymaps = (window as any).ymaps;
      if (!ymaps) return;

      const newMap = new ymaps.Map(mapContainerRef.current, {
        center: [43.222, 76.8512], // Default to Almaty
        zoom: 12,
      });

      // Add destination markers
      const [startLat, startLng] = order.destination_a_coordinates
        .split(",")
        .map(Number);
      const [endLat, endLng] = order.destination_b_coordinates
        .split(",")
        .map(Number);

      const startMarker = new ymaps.Placemark([startLat, startLng], {
        balloonContent: "Pickup location",
      });
      const endMarker = new ymaps.Placemark([endLat, endLng], {
        balloonContent: "Destination",
      });

      newMap.geoObjects.add(startMarker);
      newMap.geoObjects.add(endMarker);

      // Create driver marker
      const newDriverMarker = new ymaps.Placemark(
        order.current_driver_location.coordinates,
        {
          iconContent: "🚗",
          balloonContent: "Your driver",
        },
        {
          preset: "islands#blueStretchyIcon",
        }
      );
      newMap.geoObjects.add(newDriverMarker);
      setDriverMarker(newDriverMarker);

      // Create route
      const newRouteLine = new ymaps.Polyline(
        [
          order.current_driver_location.coordinates,
          [startLat, startLng],
          [endLat, endLng],
        ],
        {
          balloonContent: "Route",
        },
        {
          strokeColor: "#000000",
          strokeWidth: 4,
        }
      );
      newMap.geoObjects.add(newRouteLine);
      setRouteLine(newRouteLine);

      setMap(newMap);
    };

    if ((window as any).ymaps) {
      initMap();
    }
  }, [order]);

  useEffect(() => {
    if (!order || !map || !driverMarker || !routeLine) return;

    // Update driver marker position
    driverMarker.geometry.setCoordinates(
      order.current_driver_location.coordinates
    );

    // Update route
    const [startLat, startLng] = order.destination_a_coordinates
      .split(",")
      .map(Number);
    const [endLat, endLng] = order.destination_b_coordinates
      .split(",")
      .map(Number);
    routeLine.geometry.setCoordinates([
      order.current_driver_location.coordinates,
      [startLat, startLng],
      [endLat, endLng],
    ]);

    // Center map on driver
    map.setCenter(order.current_driver_location.coordinates);
  }, [order, map, driverMarker, routeLine]);

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Menu />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Menu />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Ride Tracking</h2>
              <div
                ref={mapContainerRef}
                className="w-full h-[500px] rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Ride Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="font-medium capitalize">{order.status}</p>
                </div>

                {order.worker && (
                  <>
                    <div>
                      <p className="text-sm text-gray-400">Driver</p>
                      <p className="font-medium">{order.worker.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Car</p>
                      <p className="font-medium">
                        {order.worker.carModel} - {order.worker.carNumber}
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm text-gray-400">Pickup Location</p>
                  <p className="font-medium">{order.destination_a}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Destination</p>
                  <p className="font-medium">{order.destination_b}</p>
                </div>

                {order.estimated_arrival_time && (
                  <div>
                    <p className="text-sm text-gray-400">Estimated Arrival</p>
                    <p className="font-medium">
                      {new Date(
                        order.estimated_arrival_time
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="font-medium text-yellow-500">{order.price} ₸</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=en_US"
        strategy="afterInteractive"
      />
    </div>
  );
}
