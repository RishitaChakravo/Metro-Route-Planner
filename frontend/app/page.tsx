"use client"

import axios from "axios"
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Clock, ArrowLeftRight, ArrowUpDown, MapPin, Navigation } from "lucide-react";

const Map = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
});

interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  colors: string[];
}

export default function Home() {
  const [res, setRes] = useState("");
  const [dist, setDist] = useState<number | 0>();
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [station, setStations] = useState<Station[]>([]);
  const [fromId, setFromId] = useState<number | null>(null);
  const [toId, setToId] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>();
  const [interchange, setInterchangeCount] = useState<number | null>();

  const sendId = async () => {
    try {
      if (!fromId || !toId) {
        console.log("FromId and ToId required");
        return;
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getroute`, [fromId, toId]);
      const newDist = response.data.totalDistance;
      const newPath = response.data.path;
      const t = response.data.time;
      console.log("Raw response:", response.data);
      console.log("time value:", t, typeof t);

      setDist(newDist);
      setStations(newPath);

      let changes = 0;
      for (let i = 1; i < newPath.length - 1; i++) {
        const prevcolor = newPath[i - 1].colors;
        const nextcolor = newPath[i + 1].colors;
        const hasCommonColor = prevcolor.some((color: string) =>
          nextcolor.includes(color)
        );
        if (!hasCommonColor) changes++;
      }
      setInterchangeCount(changes);

      const dwellSecPerStop = 35;
      const transferPenaltyMin = 5;

      if (!newDist) return;
      const travelMin = t/60;
      const dwellMin = (newPath.length * dwellSecPerStop) / 60;
      const transferMin = changes * transferPenaltyMin;

      setTime(Math.ceil(travelMin))
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  useEffect(() => {
    const getStations = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stations`);
        setAllStations(response.data);
      } catch (e) {
        console.error("Request failed:", e);
      }
    }
    getStations();
  }, []);

  return (
    <div className="flex justify-center items-start h-dvh md:items-center md:py-4 md:overflow-hidden" style={{ background: "var(--void-navy)" }}>
      <div
        className="flex flex-col-reverse w-full md:flex-row md:w-3/4 md:max-h-[85vh] rounded-2xl md:overflow-hidden border"
        style={{ borderColor: "var(--hairline)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      >
        <div
          className="w-full md:w-1/2 overflow-y-auto p-7 station-scroll"
          style={{ background: "var(--panel-slate)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Navigation size={18} style={{ color: "var(--signal-amber)" }} />
            <h1
              className="text-lg tracking-wide uppercase"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em", color: "var(--fog-white)" }}
            >
              Metro Route Planner
            </h1>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--muted-steel)", fontFamily: "var(--font-display)" }}
              >
                From
              </label>
              <select
                value={fromId ?? ""}
                onChange={(e) => setFromId(Number(e.target.value))}
                className="rounded-lg p-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "var(--void-navy)",
                  border: "1px solid var(--hairline)",
                  color: "var(--fog-white)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--signal-amber)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--hairline)")}
              >
                <option value="" disabled>Select from station</option>
                {[...allStations]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => {
                const a = fromId, b = toId;
                setFromId(b); setToId(a);
              }}
              className="w-9 h-9 flex justify-center items-center rounded-full self-center transition-colors hover:cursor-pointer"
              style={{ border: "1px solid var(--hairline)", color: "var(--transit-teal)" }}
              aria-label="Swap stations"
            >
              <ArrowUpDown size={16} />
            </button>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--muted-steel)", fontFamily: "var(--font-display)" }}
              >
                To
              </label>
              <select
                value={toId ?? ""}
                onChange={(e) => setToId(Number(e.target.value))}
                className="rounded-lg p-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "var(--void-navy)",
                  border: "1px solid var(--hairline)",
                  color: "var(--fog-white)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--signal-amber)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--hairline)")}
              >
                <option value="" disabled>Select to station</option>
                {[...allStations]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>

            <div
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg mt-2"
              style={{ background: "var(--void-navy)", border: "1px solid var(--hairline)" }}
            >
              <p className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--signal-amber)" }}>
                <Clock className="h-4 w-4" /> {time ?? "--"} min
              </p>
              <p className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--fog-white)" }}>
                <MapPin className="h-4 w-4" /> {station.length || "--"} stops
              </p>
              <p className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--transit-teal)" }}>
                <ArrowLeftRight className="h-4 w-4" /> {interchange ?? "--"}
              </p>
            </div>
          </div>

          <div className="h-px my-4" style={{ background: "var(--hairline)" }} />

          {station?.length ? (
            <ul className="relative">
              {station.map((s, index) => {
                const prevColors = index > 0 ? station[index - 1].colors : null;
                const nextColors = index < station.length - 1 ? station[index + 1].colors : null;
                const isLast = index === station.length - 1;

                const isInterchange =
                  prevColors && nextColors
                    ? !prevColors.some((c) => nextColors.includes(c))
                    : false;

                const nextStation = station[index + 1];
                const segmentColor = nextStation
                  ? s.colors.find((c) => nextStation.colors.includes(c)) ?? "808080"
                  : null;

                return (
                  <li key={s.id} className="relative flex items-start pl-6 pb-5">
                    <div
                      className="absolute left-0 top-1 rounded-full z-10"
                      style={{
                        width: isInterchange ? 14 : 10,
                        height: isInterchange ? 14 : 10,
                        marginLeft: isInterchange ? -2 : 0,
                        marginTop: isInterchange ? -2 : 0,
                        border: `2px solid ${isInterchange ? "var(--signal-amber)" : "var(--void-navy)"}`,
                        backgroundColor: isInterchange ? "var(--panel-slate)" : `#${s.colors[0]}`,
                      }}
                    />
                    {!isLast && (
                      <div
                        className="absolute left-1.25 top-4"
                        style={{
                          width: 2,
                          height: "100%",
                          backgroundColor: `#${segmentColor}`,
                          opacity: 0.85,
                        }}
                      />
                    )}

                    <div
                      className="text-sm"
                      style={{
                        fontWeight: isInterchange ? 600 : 400,
                        color: isInterchange ? "var(--signal-amber)" : "var(--fog-white)",
                      }}
                    >
                      <span className="flex items-center flex-wrap gap-2">
                        {s.name}
                        <span className="flex gap-1">
                          {s.colors.map((color) => (
                            <span
                              key={color}
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: `#${color}`,
                              }}
                            />
                          ))}
                        </span>
                        {isInterchange && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(251,191,36,0.12)", color: "var(--signal-amber)" }}
                          >
                            Interchange
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--muted-steel)" }}>
              Choose a start and end station to see your route.
            </p>
          )}

          <button
            onClick={sendId}
            className="w-full text-center px-3 py-3 rounded-xl transition-colors hover:cursor-pointer mt-2"
            style={{
              background: "var(--signal-amber)",
              color: "var(--void-navy)",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
            }}
          >
            Find Route
          </button>
        </div>
        <div className="w-full h-[80vh] md:h-auto md:w-1/2 ">
          <Map stations={station} />
        </div>
      </div>
    </div>
  );
}