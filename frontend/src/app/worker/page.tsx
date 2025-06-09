"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Menu from "../../components/menu";

interface Order {
  _id: string;
  date: string;
  name: string;
  price: number;
  destination_a: string;
  destination_b: string;
  ride_time: string;
  status: string;
}

export default function WorkerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:5000/api/worker_orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setOrders(data.filter((order: Order) => order.status === "active"));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/worker/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Menu />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Активные заказы</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Нет активных заказов</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleOrderClick(order._id)}
                className="bg-zinc-900 rounded-xl p-6 cursor-pointer hover:bg-zinc-800 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{order.name}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(order.date).toLocaleString()}
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
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrderClick(order._id);
                    }}
                    className="w-full py-2 rounded-lg bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold hover:from-yellow-400 hover:to-yellow-600 transition-all"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
