"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Menu from "../../components/menu";
import AddressSearch from "../../components/AddressSearch";
import axios from "axios";
import { Navigation } from "lucide-react";

declare global {
  interface Window {
    ymaps: any;
  }
}

interface Point {
  coords: [number, number];
  address: string;
}

export default function MainPage() {
  const mapRef = useRef<any>(null);
  const [ymapsLoaded, setYmapsLoaded] = useState(false);
  const [mode, setMode] = useState<"idle" | "setA" | "setB">("idle");
  const [pointA, setPointA] = useState<Point | null>(null);
  const [pointB, setPointB] = useState<Point | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [price, setPrice] = useState("");
  const [center, setCenter] = useState<[number, number]>([
    43.238949, 76.889709,
  ]); // Default Almaty
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [comment, setComment] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showTopPanel, setShowTopPanel] = useState(true);

  // Load saved points from localStorage
  useEffect(() => {
    const savedPointA = localStorage.getItem("pointA");
    const savedPointB = localStorage.getItem("pointB");
    if (savedPointA) setPointA(JSON.parse(savedPointA));
    if (savedPointB) setPointB(JSON.parse(savedPointB));
  }, []);

  // Save points to localStorage when they change
  useEffect(() => {
    if (pointA) localStorage.setItem("pointA", JSON.stringify(pointA));
    if (pointB) localStorage.setItem("pointB", JSON.stringify(pointB));
  }, [pointA, pointB]);

  // Load user geolocation and set as point A if not already set
  useEffect(() => {
    if (!pointA && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setCenter(coords);
        fetchAddress(coords).then((address) => {
          setPointA({ coords, address });
        });
      });
    }
  }, [pointA]);

  const fetchAddress = async (coords: [number, number]): Promise<string> => {
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAP_API_KEY}&geocode=${coords[1]},${coords[0]}&format=json`
      );
      const data = await response.json();
      const found =
        data.response.GeoObjectCollection.featureMember[0]?.GeoObject
          ?.metaDataProperty?.GeocoderMetaData?.text;
      return found || coords.join(", ");
    } catch (error) {
      return coords.join(", ");
    }
  };

  // Handle map click for setting points
  useEffect(() => {
    if (!mapRef.current || !window.ymaps) return;
    const map = mapRef.current;

    const onClick = async (e: any) => {
      const coords = e.get("coords");
      const address = await fetchAddress(coords);

      if (mode === "setA") {
        setPointA({ coords, address });
        setMode("idle");
      } else if (mode === "setB") {
        setPointB({ coords, address });
        setMode("idle");
      }
    };

    map.events.add("click", onClick);
    return () => map.events.remove("click", onClick);
  }, [mode, ymapsLoaded]);

  // Initialize map
  useEffect(() => {
    if (ymapsLoaded && window.ymaps && !mapRef.current) {
      window.ymaps.ready(() => {
        mapRef.current = new window.ymaps.Map("yandex-map", {
          center,
          zoom: 14,
        });

        const trafficControl = new window.ymaps.control.TrafficControl({
          shown: true,
        });
        mapRef.current.controls.add(trafficControl);
        trafficControl.getProvider("traffic#actual").setMap(mapRef.current);
      });
    }
  }, [ymapsLoaded, center]);

  // Draw markers and route
  useEffect(() => {
    if (!mapRef.current || !window.ymaps) return;
    const map = mapRef.current;
    map.geoObjects.removeAll();

    if (pointA) {
      const placemarkA = new window.ymaps.Placemark(
        pointA.coords,
        { balloonContent: "A" },
        { preset: "islands#greenDotIcon" }
      );
      map.geoObjects.add(placemarkA);
    }
    if (pointB) {
      const placemarkB = new window.ymaps.Placemark(
        pointB.coords,
        { balloonContent: "B" },
        { preset: "islands#redDotIcon" }
      );
      map.geoObjects.add(placemarkB);
    }
    if (pointA && pointB) {
      window.ymaps
        .route([pointA.coords, pointB.coords])
        .then(function (route: any) {
          map.geoObjects.add(route);
          const jamsTime = route.getJamsTime();
          const totalMinutes = Math.round(jamsTime / 60 + 5);
          setEstimatedTime(`${totalMinutes} мин`);
        });
    } else {
      setEstimatedTime("");
    }
  }, [pointA, pointB, ymapsLoaded]);

  const handleSearchSelect = async (
    coords: [number, number],
    address: string
  ) => {
    if (mode === "setA") {
      setPointA({ coords, address });
    } else if (mode === "setB") {
      setPointB({ coords, address });
    }
    setMode("idle");
    setShowSearch(false);
  };

  // Modal submit handler
  const handleOrderSubmit = async () => {
    const name = localStorage.getItem("userName") || "Гость";
    const order = {
      date: new Date().toISOString(),
      name,
      price,
      comment,
      destination_a: pointA?.address || "",
      destination_b: pointB?.address || "",
      destination_a_coordinates: pointA ? pointA.coords.join(",") : "",
      destination_b_coordinates: pointB ? pointB.coords.join(",") : "",
      ride_time: estimatedTime,
      placed_by_user_id: localStorage.getItem("userId"),
    };

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      await axios.post("http://localhost:5000/api/worker_orders", order, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowModal(false);
      setPrice("");
      setComment("");
      alert("Заказ отправлен!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Ошибка при создании заказа.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Script
        src={`https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAP_API_KEY}&lang=ru_RU`}
        strategy="afterInteractive"
        onLoad={() => setYmapsLoaded(true)}
      />
      <Menu />

      {/* Address Search Component */}
      <AddressSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelect={handleSearchSelect}
        apiKey={process.env.NEXT_PUBLIC_YANDEX_MAP_API_KEY || ""}
      />

      <div className="flex-1 relative">
        <div id="yandex-map" style={{ width: "100%", height: "80vh" }} />

        {/* Top Address Panel */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
          <button
            onClick={() => setShowTopPanel(!showTopPanel)}
            className={`w-full bg-zinc-900/90 p-2 rounded-xl text-white flex items-center justify-center gap-2 hover:bg-zinc-800/90 transition ${
              !showTopPanel ? "rounded-b-xl" : "rounded-t-xl"
            }`}
          >
            <span>{showTopPanel ? "Скрыть" : "Показать"}</span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-300 ${
                showTopPanel ? "" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`bg-zinc-900/90 rounded-b-xl overflow-hidden transition-all duration-300 ${
              showTopPanel ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4">
              <div
                className="mb-4 cursor-pointer hover:bg-zinc-800/90 p-2 rounded-lg transition"
                onClick={() => {
                  setMode("setA");
                  setShowSearch(true);
                }}
              >
                <div className="text-sm text-gray-400">Откуда</div>
                <div className="font-medium text-white">
                  {pointA ? pointA.address : "Определение местоположения..."}
                </div>
              </div>
              <div
                className="cursor-pointer hover:bg-zinc-800/90 p-2 rounded-lg transition"
                onClick={() => {
                  setMode("setB");
                  setShowSearch(true);
                }}
              >
                <div className="text-sm text-gray-400">Куда</div>
                <div className="font-medium text-white">
                  {pointB ? pointB.address : "Выберите пункт назначения"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Panel */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg transition ${
                    mode === "setA"
                      ? "bg-yellow-400 text-black"
                      : "bg-zinc-100 text-gray-800 hover:bg-zinc-200"
                  }`}
                  onClick={() => setMode(mode === "setA" ? "idle" : "setA")}
                >
                  {pointA ? "Изменить A" : "Выбрать A"}
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg transition ${
                    mode === "setB"
                      ? "bg-yellow-400 text-black"
                      : "bg-zinc-100 text-gray-800 hover:bg-zinc-200"
                  }`}
                  onClick={() => setMode(mode === "setB" ? "idle" : "setB")}
                  disabled={!pointA}
                >
                  {pointB ? "Изменить B" : "Выбрать B"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="bg-zinc-50 p-3 rounded-lg cursor-pointer hover:bg-zinc-100 transition"
                  onClick={() => {
                    setMode("setA");
                    setShowSearch(true);
                  }}
                >
                  <div className="text-sm text-gray-500">Откуда</div>
                  <div className="font-medium text-gray-800">
                    {pointA ? pointA.address : "Не выбрано"}
                  </div>
                </div>
                <div
                  className="bg-zinc-50 p-3 rounded-lg cursor-pointer hover:bg-zinc-100 transition"
                  onClick={() => {
                    setMode("setB");
                    setShowSearch(true);
                  }}
                >
                  <div className="text-sm text-gray-500">Куда</div>
                  <div className="font-medium text-gray-800">
                    {pointB ? pointB.address : "Не выбрано"}
                  </div>
                </div>
              </div>

              {estimatedTime && (
                <div className="text-center text-yellow-600 font-medium">
                  Примерное время поездки: {estimatedTime}
                </div>
              )}

              <button
                className="w-full py-3 rounded-lg bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg hover:from-yellow-400 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowModal(true)}
                disabled={!pointA || !pointB}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>

        {/* Order Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Укажите цену поездки</h2>
              <input
                className="w-full p-3 rounded bg-zinc-800 text-white placeholder-gray-400 mb-4"
                placeholder="Цена, ₸"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <textarea
                className="w-full p-3 rounded bg-zinc-800 text-white placeholder-gray-400 mb-4"
                placeholder="Комментарий для водителя"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 rounded bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg"
                  onClick={handleOrderSubmit}
                  disabled={!price}
                >
                  Отправить
                </button>
                <button
                  className="flex-1 py-2 rounded bg-zinc-800 text-white"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
