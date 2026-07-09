package com.rishita.backend;

import java.io.*;
import java.util.*;

import org.springframework.core.io.ClassPathResource;

public class DataController {
    public double distance(double lat1, double lon1, double lat2, double lon2) {
        int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public Map<String, Object> loadGraph() throws Exception{
        Map<Long, Station> stations = new HashMap<>();
        
        GtfsRouteColor grc = new GtfsRouteColor();
        Map<Long, Set<String>> stationColors = grc.StationColor();

        BufferedReader reader = new BufferedReader(new InputStreamReader(
            new ClassPathResource("stops.txt").getInputStream()
        ));
        reader.readLine();
        String line;
        while((line = reader.readLine()) != null) {
            String[] parts = line.split(",");
            long id       = Long.parseLong(parts[0].trim());  
            String name   = parts[2].trim();                  
            double lat    = Double.parseDouble(parts[4].trim());
            double lon    = Double.parseDouble(parts[5].trim());

            stations.put(id, new Station(id, name, lat, lon, stationColors.get(id)));
        }
        reader.close();
        Map<String, Map<Integer, Long>> trips = new HashMap<>();
        BufferedReader r = new BufferedReader(new InputStreamReader(
            new ClassPathResource("stop_times.txt").getInputStream()
        ));
        r.readLine();
        while((line = r.readLine())!=null) {
            String[] parts = line.split(",");
            String tripId = parts[0].trim();
            long stopId = Long.parseLong(parts[3].trim());
            int sequence = Integer.parseInt(parts[4].trim());

            if(trips.containsKey(tripId)) trips.get(tripId).put(sequence, stopId);
            else {
                Map<Integer, Long> temp = new HashMap<>();
                temp.put(sequence, stopId);
                trips.put(tripId, temp);
            }
        }
        r.close();

        List<Map<String, Object>> edges = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for(Map<Integer, Long> trip : trips.values()) {
            List<Integer> sequence = new ArrayList<>(trip.keySet());
            Collections.sort(sequence);

            for(int i = 0; i < sequence.size() - 1; i++) {
                long fromId = trip.get(sequence.get(i));
                long toId = trip.get(sequence.get(i+1));

                String key = fromId + "-" + toId;
                if(seen.contains(key))continue;
                else seen.add(key);

                Station from = stations.get(fromId);
                Station to   = stations.get(toId);
                if (from == null || to == null) continue;

                double weight = distance(from.lat, from.lon, to.lat, to.lon);
                Map<String, Object> edge = new HashMap<>();
                edge.put("from", fromId);
                edge.put("to",   toId);
                edge.put("weight", weight);
                edges.add(edge);
            }
        }
        Map<String, Object> graph = new HashMap<>();
        graph.put("nodes", stations);
        graph.put("edges", edges);
        return graph;
    }
}