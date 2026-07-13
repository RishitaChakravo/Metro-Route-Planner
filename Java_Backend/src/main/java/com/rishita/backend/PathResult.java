package com.rishita.backend;

import java.util.List;

public class PathResult {
    private List<Station> path;
    private double totalDistance;
    private long time;

    public PathResult(List<Station> path, double totalDistance) {
        this.path = path;
        this.totalDistance = totalDistance;
        this.time = 0;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public List<Station> getPath() {
        return path;
    }
    public void setTime(long time) {
        this.time = time;
    }
    public long getTime() {
        return time;
    }
}
