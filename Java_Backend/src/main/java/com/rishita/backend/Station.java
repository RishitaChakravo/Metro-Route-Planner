package com.rishita.backend;

import java.util.*;

public class Station{
    long id;
    String name;
    double lat;
    double lon; 
    List<String> colors;

    Station(long i, String n, double lat, double lon, Set<String> c){
        id = i;
        name = n;
        this.lat = lat;
        this.lon = lon;
        colors = new ArrayList<>();
        for(String clrs : c) {
            colors.add(clrs);
        }
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public double getLat() { return lat; }
    public double getLng() { return lon; }
    public List<String> getColors() {return colors;}
}