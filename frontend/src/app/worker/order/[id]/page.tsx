"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import Menu from "../../../../components/menu";
import axios from "axios";
import { useToast } from "../../../../components/ui/use-toast";

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
  worker_id: string;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [map, setMap] = useState<any>(null);
  const [routeDistance, setRouteDistance] = useState<string>("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [locationInterval, setLocationInterval] =
    useState<NodeJS.Timeout | null>(null);
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
  }, [params.id, router, toast]);

  const startLocationUpdates = () => {
    if (locationInterval) return;

    const interval = setInterval(async () => {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        await axios.patch(
          `http://localhost:5000/api/worker_orders/${params.id}/location`,
          {
            coordinates: [position.coords.latitude, position.coords.longitude],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Error updating location:", error);
      }
    }, 10000);

    setLocationInterval(interval);
  };

  const stopLocationUpdates = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  const handleAcceptRide = async () => {
    try {
      setIsAccepting(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      await axios.patch(
        `http://localhost:5000/api/worker_orders/${params.id}/accept`,
        {
          coordinates: [position.coords.latitude, position.coords.longitude],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      startLocationUpdates();
      toast({
        title: "Success",
        description: "Ride accepted successfully",
      });
    } catch (error) {
      console.error("Error accepting ride:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept ride",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCompleteRide = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/worker_orders/${params.id}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      stopLocationUpdates();
      toast({
        title: "Success",
        description: "Ride completed successfully",
      });
      router.push("/worker");
    } catch (error) {
      console.error("Error completing ride:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete ride",
      });
    }
  };

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
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div
                ref={mapContainerRef}
                className="w-full h-[500px] rounded-lg mb-6"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Order Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Client</p>
                  <p className="font-medium">{order.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-medium">
                    {new Date(order.date).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="font-medium text-yellow-500">{order.price} ₸</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">From</p>
                  <p className="font-medium">{order.destination_a}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">To</p>
                  <p className="font-medium">{order.destination_b}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Ride Time</p>
                  <p className="font-medium">{order.ride_time}</p>
                </div>

                {routeDistance && (
                  <div>
                    <p className="text-sm text-gray-400">Route Distance</p>
                    <p className="font-medium">{routeDistance}</p>
                  </div>
                )}

                {order.comment && (
                  <div>
                    <p className="text-sm text-gray-400">Comment</p>
                    <p className="font-medium">{order.comment}</p>
                  </div>
                )}

                <div className="pt-4">
                  {order.status === "active" && !order.worker_id && (
                    <button
                      onClick={handleAcceptRide}
                      disabled={isAccepting}
                      className="w-full bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                      {isAccepting ? "Accepting..." : "Accept Ride"}
                    </button>
                  )}

                  {order.status === "in_progress" &&
                    order.worker_id === localStorage.getItem("userId") && (
                      <button
                        onClick={handleCompleteRide}
                        className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Complete Ride
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=890ebac0-eb58-40dc-9ecd-9fd51d224e0e&lang=en_US"
        strategy="afterInteractive"
        onLoad={() => {
          if (order && mapContainerRef.current) {
            window.ymaps.ready(() => {
              const initMap = () => {
                if (map) {
                  map.destroy();
                }

                const newMap = new window.ymaps.Map(mapContainerRef.current, {
                  center: [43.222, 76.8512],
                  zoom: 12,
                });

                const [startLat, startLng] = order.destination_a_coordinates
                  .split(",")
                  .map(Number);
                const [endLat, endLng] = order.destination_b_coordinates
                  .split(",")
                  .map(Number);

                const startMarker = new window.ymaps.Placemark(
                  [startLat, startLng],
                  {
                    balloonContent: "Pickup location",
                  }
                );
                const endMarker = new window.ymaps.Placemark([endLat, endLng], {
                  balloonContent: "Destination",
                });

                newMap.geoObjects.add(startMarker);
                newMap.geoObjects.add(endMarker);

                window.ymaps
                  .route(
                    [
                      [startLat, startLng],
                      [endLat, endLng],
                    ],
                    {
                      mapStateAutoApply: true,
                    }
                  )
                  .then((route: any) => {
                    const distance = route.getHumanLength();
                    setRouteDistance(distance);
                  });

                setMap(newMap);
              };
              initMap();
            });
          }
        }}
      />
    </div>
  );
}
