"use client";

import { useEffect, useState } from "react";
import Menu from "../../components/menu";
import axios from "axios";
import { useRouter } from "next/navigation";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other fields if needed, e.g., carModel, carNumber for workers
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // Redirect to login if no token is found
        router.push("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      if (err.response?.status === 401) {
        // Redirect to login if token is invalid
        router.push("/login");
      } else {
        setError("Failed to fetch user profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    // Clear any other relevant items from localStorage
    localStorage.removeItem("pointA");
    localStorage.removeItem("pointB");

    router.push("/login");
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">User data not available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Menu />

      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Профиль</h1>

        <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-400">Имя</p>
            <p className="font-medium text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Роль</p>
            <p className="font-medium text-white">{user.role}</p>
          </div>
          {/* Display other user info here if added to UserProfile interface */}
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-lg shadow-lg hover:bg-red-700 transition-all"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
