// "use client";

import { MousePointer2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const GreetingsPage = () => {
  return (
    <div className="min-h-screen bg-[#151513] flex flex-col items-center pb-6 pt-4">
      <div className="w-full">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-lg flex items-center gap-2">
              <MousePointer2 /> <p>Drive</p>
            </span>
          </div>
          <div>
            <button className="rounded-full bg-yellow-400/20">
              <span className="text-yellow-300 rounded-full p-2 text-xl ">i</span>
            </button>
          </div>
        </div>
        {/* Divider */}
        <div className="w-full border-b border-white/10 my-4" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center z-10 justify-center w-full relative mt-20">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Taxi of your dreams
        </h1>
        <p className="text-gray-300 text-center">
          Comfortable rides around the city
        </p>
        <p className="text-gray-300 text-center mb-8">
          Comfortable booking of plain and train tickets
        </p>
        <div className="fixed bottom-0 w-[550px] h-[550px] -z-10 mb-8">
          <Image
            src="/car.png"
            alt="Car"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
      <div className="fixed bottom-20 z-20 w-96 flex flex-col items-center">
        <Link href="/login" className="w-full max-w-xs">
          <button className="w-full py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-semibold text-lg shadow-lg mb-3 transition hover:brightness-105">
            Log In
          </button>
        </Link>
        <Link
          href="/register"
          className="text-yellow-300 text-center underline text-sm"
        >
          Create new account
        </Link>
      </div>
    </div>
  );
};

export default GreetingsPage;
