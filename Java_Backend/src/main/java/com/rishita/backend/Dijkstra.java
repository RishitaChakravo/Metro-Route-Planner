package com.rishita.backend;

import java.util.*;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class NodeDistance implements Comparable<NodeDistance> {
    Long node;
    Double distance;

    NodeDistance(Long n, Double dist) {
        node = n;
        distance = dist;
    }

    public int compareTo(NodeDistance other) {
        return Double.compare(this.distance, other.distance);
    }
}

@RestController
public class Dijkstra{
    public PathResult dijkstraAlgorithm(
        Map<Long, Station> nodes, 
        List<Map<String, Object>> edges,
        long fromId, long toId) throws Exception{

        Station from = nodes.get(fromId);
        Station to = nodes.get(toId);
        
        Map<Long, Double> distance = new HashMap<>();
        Map<Long, Long> prev = new HashMap<>();
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        for (Station s : nodes.values()) {
            distance.put(s.id, Double.MAX_VALUE);
        }
        
        distance.put(from.id, 0.0);
        pq.add(new NodeDistance(from.id, 0.0));

        Map<Long, List<Map<String, Object>>> adj = new HashMap<>();
        for (Long id : nodes.keySet()) {
            Station fr = nodes.get(id);
            adj.put(fr.id, new ArrayList<>());
        }
        
        for (Map<String, Object> edge: edges) {
            Long frId = (Long)edge.get("from");

            Station f = nodes.get(frId);
            adj.get(f.id).add(edge);
        }
        while(!pq.isEmpty()) {
            NodeDistance curr = pq.poll();

            if(curr.distance > distance.get(curr.node)) continue;
            if(curr.node.equals(to.id)) break;

            for(Map<String, Object> edge : adj.get(curr.node)) {
                Long neighborId = (Long) edge.get("to");
                double weight = (double) edge.get("weight");
                double newDist = distance.get(curr.node) + weight;

                if (newDist < distance.get(neighborId)) {
                    distance.put(neighborId, newDist);
                    prev.put(neighborId, curr.node);
                    pq.add(new NodeDistance(neighborId, newDist));
                }
            }
        }
        if (distance.get(to.id) == Double.MAX_VALUE) {
            throw new Exception("No path found");
        }
        List<Station> path = new ArrayList<>();
        for(Long cur = to.id; cur != null; cur = prev.get(cur)){
            path.add(nodes.get(cur));
        }
        Collections.reverse(path);
        PathResult result = new PathResult(path, distance.get(to.id));
        return result;
    }
}