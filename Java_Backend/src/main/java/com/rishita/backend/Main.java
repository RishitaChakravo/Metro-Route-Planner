package com.rishita.backend;

import java.util.*;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins="*")
public class Main {
    Map<Long, Station> nodes;
    List<Map<String, Object>> edges;
    
    @GetMapping("/stations")
    public List<Station> getStations() throws Exception{
        DataController dc = new DataController();
        Map<String, Object> graph = dc.loadGraph();
        Map<Long, Station> n = (Map<Long, Station>) graph.get("nodes");
        List<Map<String, Object>> e = (List<Map<String, Object>>) graph.get("edges");
        
        nodes = n;
        edges = e;

        List<Station> stats = new ArrayList<>();
        for(Station s : nodes.values()) {
            stats.add(s);
        }
        return stats;
    }

    @PostMapping("/getroute")
    public PathResult run(@RequestBody long[] ids) throws Exception {
        if (nodes == null || edges == null) {
            DataController dc = new DataController();
            Map<String, Object> graph = dc.loadGraph();
            nodes = (Map<Long, Station>) graph.get("nodes");
            edges = (List<Map<String, Object>>) graph.get("edges");
        }

        long fromId = ids[0];
        long toId = ids[1];

        Dijkstra djk = new Dijkstra();
        return djk.dijkstraAlgorithm(nodes, edges, fromId, toId);
    }
}
