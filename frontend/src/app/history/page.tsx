"use client";

import { useEffect, useState } from "react";
import Menu from "../../components/menu";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  date: string;
  name: string; // This is the name provided during order creation, likely the client's name
  price: number;
  comment: string;
  destination_a: string;
  destination_b: string;
  ride_time: string;
  status: string;
  // We might add more fields here if needed for history display
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // Redirect to login if no token is found
        router.push("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/users/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data);
    } catch (err: any) {
      console.error("Error fetching user orders:", err);
      if (err.response?.status === 401) {
        // Redirect to login if token is invalid
        router.push("/login");
      } else {
        setError("Failed to fetch order history.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Menu />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">У вас пока нет заказов.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {orders.map((order) => (
              <div key={order._id} className="bg-zinc-900 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Клиент: {order.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Дата: {new Date(order.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-yellow-500 font-semibold">
                    {order.price} ₸
                  </div>
                </div>

                <div className="space-y-3">
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
                  <div>
                    <p className="text-sm text-gray-400">Статус</p>
                    <p
                      className={`font-medium ${
                        order.status === "active"
                          ? "text-green-500"
                          : order.status === "in_progress"
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                  {order.comment && (
                    <div>
                      <p className="text-sm text-gray-400">Комментарий</p>
                      <p className="font-medium">{order.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
