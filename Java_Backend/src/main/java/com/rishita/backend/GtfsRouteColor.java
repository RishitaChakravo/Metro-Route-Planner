package com.rishita.backend;

import java.io.*;
import java.util.*;

import org.springframework.core.io.ClassPathResource;

public class GtfsRouteColor {

    private static final Map<String, String> LINE_TO_COLOR = new HashMap<>();
    static {
        LINE_TO_COLOR.put("RED", "FF0000");
        LINE_TO_COLOR.put("YELLOW", "FFD700");
        LINE_TO_COLOR.put("BLUE", "0000FF");
        LINE_TO_COLOR.put("GREEN", "008000");
        LINE_TO_COLOR.put("VIOLET", "8B00FF");
        LINE_TO_COLOR.put("PINK", "FF69B4");
        LINE_TO_COLOR.put("MAGENTA", "FF00FF");
        LINE_TO_COLOR.put("GRAY", "808080");
        LINE_TO_COLOR.put("AQUA", "00FFFF");
        LINE_TO_COLOR.put("RAPID", "FFA500");
    }

    public Map<Long, Set<Long>> loadTripToStop() throws Exception{
        Map<Long, Set<Long>> tripToStop = new HashMap<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
            new ClassPathResource("stop_times.txt").getInputStream()
        ));
        reader.readLine();
        String line;
        while((line = reader.readLine()) != null){
            String[] parts = line.split(",", -1);
            Long tripId = Long.parseLong(parts[0]);
            Long stopId = Long.parseLong(parts[3]);

            tripToStop.computeIfAbsent(tripId, k -> new HashSet<>()).add(stopId);
        }
        reader.close();
        return tripToStop;
    }

    public Map<Long, Long> loadTriptoRoute() throws Exception {
        Map<Long, Long> tripToRoute = new HashMap<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
            new ClassPathResource("trips.txt").getInputStream()
        ));
        reader.readLine();
        String line;
        while((line = reader.readLine())!=null) {
            String [] parts = line.split(",", -1);
            Long routeId = Long.parseLong(parts[0]);
            Long tripId = Long.parseLong(parts[2]);

            tripToRoute.put(tripId, routeId);
        }
        reader.close();
        return tripToRoute;
    }

    public Map<Long, String> loadRouteColor() throws Exception{
        Map<Long, String> routeColor = new HashMap<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
            new ClassPathResource("routes.txt").getInputStream()
        ));
        reader.readLine();
        String line;
        while((line = reader.readLine())!=null) {
            String[] parts = line.split(",", -1);
            Long routeId = Long.parseLong(parts[0]);
            String longName = parts[3]; // route_long_name column

            String color = "808080"; // default fallback
            if (longName != null && longName.contains("_")) {
                String prefix = longName.split("_")[0].trim().toUpperCase();
                color = LINE_TO_COLOR.getOrDefault(prefix, "808080");
            }

            routeColor.put(routeId, color);
        }
        reader.close();
        return routeColor;
    }

    public Map<Long, Set<String>> StationColor() throws Exception{
        Map<Long, Long> tripToRoute = loadTriptoRoute();
        Map<Long, String> routeColor = loadRouteColor();
        Map<Long, Set<Long>> tripToStop =  loadTripToStop();

        Map<Long, Set<String>> stationColor = new HashMap<>();

        for(Map.Entry<Long, Set<Long>> entry : tripToStop.entrySet()) {
            Long tripId = entry.getKey();
            Set<Long> stopIds = entry.getValue();
            Long routeId = tripToRoute.get(tripId);
            if (routeId == null) continue;

            String color = routeColor.get(routeId);
            if (color == null) continue;

            for (Long stopId : stopIds) {
                stationColor.computeIfAbsent(stopId, k -> new HashSet<>()).add(color);
            }
        }
        return stationColor;
    }
}