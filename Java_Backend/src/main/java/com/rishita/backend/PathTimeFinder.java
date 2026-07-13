package com.rishita.backend;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

import org.springframework.core.io.ClassPathResource;

public class PathTimeFinder {

    public long timeToSec(String time) {
        String[] parts = time.split(":");
        int hours = Integer.parseInt(parts[0].trim());
        int minutes = Integer.parseInt(parts[1].trim());
        int seconds = Integer.parseInt(parts[2].trim());
        return hours * 3600L + minutes * 60L + seconds;
    }

    public Map<Long, List<Map<String, Long>>> loadTripToStop() throws Exception {
        Map<Long, List<Map<String, Long>>> tripToStop = new HashMap<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
            new ClassPathResource("stop_times.txt").getInputStream()
        ));
        reader.readLine();
        String line;
        while ((line = reader.readLine()) != null) {
            String[] parts = line.split(",", -1);
            Long tripId = Long.parseLong(parts[0]);
            long arrival = timeToSec(parts[1]);
            long departure = timeToSec(parts[2]);
            Long stopId = Long.parseLong(parts[3]);
            Long stopSequence = Long.parseLong(parts[4]);

            Map<String, Long> temp = new HashMap<>();
            temp.put("stopId", stopId);
            temp.put("arrival", arrival);
            temp.put("departure", departure);
            temp.put("stopSequence", stopSequence);

            tripToStop.computeIfAbsent(tripId, k -> new ArrayList<>()).add(temp);
        }
        reader.close();

        for (List<Map<String, Long>> stops : tripToStop.values()) {
            stops.sort(Comparator.comparingLong(m -> m.get("stopSequence")));
        }

        return tripToStop;
    }

    private Long findSegmentTime(long fromId, long toId, Map<Long, List<Map<String, Long>>> tripToStop) {
        for (List<Map<String, Long>> stops : tripToStop.values()) {
            for (int i = 0; i < stops.size() - 1; i++) {
                long thisStop = stops.get(i).get("stopId");
                long nextStop = stops.get(i + 1).get("stopId");

                if (thisStop == fromId && nextStop == toId) {
                    long dep = stops.get(i).get("departure");
                    long arr = stops.get(i + 1).get("arrival");
                    return arr - dep;
                }
            }
        }
        return null; 
    }

    public long loadTimeForPath(List<Station> stations) throws Exception {
        Map<Long, List<Map<String, Long>>> tripToStop = loadTripToStop();

        long totalTime = 0;
        for (int i = 0; i < stations.size() - 1; i++) {
            long fromId = stations.get(i).getId();
            long toId = stations.get(i + 1).getId();

            Long segTime = findSegmentTime(fromId, toId, tripToStop);
            if (segTime != null && segTime > 0) {
                totalTime += segTime;
            } else {
                totalTime += 90; 
                System.out.println("No direct segment found for " + fromId + " -> " + toId);
            }
        }
        return totalTime;
    }
}