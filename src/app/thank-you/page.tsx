"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import type { RecentlyPlayed } from "spotify-types";

export default function ThankYou() {
  const getRecentlyPlayed = async (): Promise<RecentlyPlayed> => {
    const session = await getSession();
    const { data } = await axios.get<RecentlyPlayed>(
      `https://api.spotify.com/v1/me/player/recently-played?after=${
        // Get the epoch timestamp of 7 days ago
        Math.floor(
          new Date().setDate(new Date().getDate() - 7) / 1000 / 86400,
        ) * 86400
      }&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      },
    );

    return data;
  };

  useEffect(() => {
    const getRecentlyPlayedAndSend = async () => {
      const session = await getSession();
      const recentlyPlayed = await getRecentlyPlayed();
      await axios.post("/api/analyse", {
        recentlyPlayed,
        user: session?.user,
      });
    };

    void getRecentlyPlayedAndSend();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16 ">
        <h1 className="text-4xl font-bold">Bedankt!</h1>
        <p>
          De vibebox zal zo je emoties aflezen aan de hand van je Spotify data.
        </p>
      </div>
    </main>
  );
}
