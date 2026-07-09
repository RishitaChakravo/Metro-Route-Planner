package com.rishita.backend;

import java.util.*;

public class PathResult {
    private List<Station> path;
    private double totalDistance;

    PathResult(List<Station> path, double totalDistance) {
        this.path = path;
        this.totalDistance = totalDistance;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public List<Station> getPath() {
        return path;
    }
}
