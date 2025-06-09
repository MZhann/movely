"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import Menu from "../../../../components/menu";

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
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [ymapsLoaded, setYmapsLoaded] = useState(false);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/worker_orders/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map and draw route
  useEffect(() => {
    console.log(
      "ymapsLoaded:",
      ymapsLoaded,
      "order:",
      order,
      "mapRef.current:",
      mapRef.current
    );
    if (ymapsLoaded && window.ymaps && order) {
      window.ymaps.ready(() => {
        console.log("Yandex Maps API is ready.");
        const [latA, lonA] = order.destination_a_coordinates
          .split(",")
          .map(Number);
        const [latB, lonB] = order.destination_b_coordinates
          .split(",")
          .map(Number);

        console.log("Coordinates A:", [latA, lonA], "Coordinates B:", [
          latB,
          lonB,
        ]);

        // Calculate center point
        const centerLat = (latA + latB) / 2;
        const centerLon = (lonA + lonB) / 2;

        if (!mapRef.current) {
          mapRef.current = new window.ymaps.Map("yandex-map", {
            center: [centerLat, centerLon],
            zoom: 12,
          });
          console.log("Map initialized.");
        } else {
          mapRef.current.setCenter([centerLat, centerLon], 12);
          mapRef.current.geoObjects.removeAll(); // Clear existing objects
          console.log("Map updated and cleared.");
        }

        // Add markers
        const placemarkA = new window.ymaps.Placemark(
          [latA, lonA],
          { balloonContent: "A" },
          { preset: "islands#greenDotIcon" }
        );
        const placemarkB = new window.ymaps.Placemark(
          [latB, lonB],
          { balloonContent: "B" },
          { preset: "islands#redDotIcon" }
        );

        mapRef.current.geoObjects.add(placemarkA);
        mapRef.current.geoObjects.add(placemarkB);
        console.log("Markers added.");

        // Draw route
        window.ymaps
          .route([
            [latA, lonA],
            [latB, lonB],
          ])
          .then(
            function (route: any) {
              mapRef.current.geoObjects.add(route);
              console.log("Route added to map.", route);
              // Extract and display distance
              const distance = route.getHumanLength();
              setRouteDistance(distance);
              console.log("Route distance:", distance);
            },
            function (error: any) {
              console.error("Yandex Maps routing error:", error);
            }
          );
      });
    }
  }, [ymapsLoaded, order]);

  const handleTakeOrder = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/worker_orders/${params.id}/take`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "in_progress",
            start_date: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        router.push("/worker");
      }
    } catch (error) {
      console.error("Error taking order:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Заказ не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Script
        src={`https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAP_API_KEY}&lang=ru_RU`}
        strategy="afterInteractive"
        onLoad={() => setYmapsLoaded(true)}
      />
      <Menu />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Детали заказа</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            Назад
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="bg-zinc-900 rounded-xl overflow-hidden">
            <div id="yandex-map" style={{ width: "100%", height: "400px" }} />
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                Информация о заказе
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Клиент</p>
                  <p className="font-medium">{order.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Дата создания</p>
                  <p className="font-medium">
                    {new Date(order.date).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Цена</p>
                  <p className="font-medium text-yellow-500">{order.price} ₸</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Откуда</p>
                  <p className="font-medium">{order.destination_a}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Куда</p>
                  <p className="font-medium">{order.destination_b}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Время в пути</p>
                  <p className="font-medium">{order.ride_time}</p>
                </div>

                {routeDistance && (
                  <div>
                    <p className="text-sm text-gray-400">Расстояние маршрута</p>
                    <p className="font-medium">{routeDistance}</p>
                  </div>
                )}

                {order.comment && (
                  <div>
                    <p className="text-sm text-gray-400">Комментарий</p>
                    <p className="font-medium">{order.comment}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleTakeOrder}
              className="w-full py-4 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 to-orange-600 text-black font-semibold text-lg hover:from-yellow-400 transition-all"
            >
              Взять заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
