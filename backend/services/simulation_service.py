import random

def pick_random_node(graph_data: dict) -> str:
    """Selects a random node ID from the graph."""
    if not graph_data.get("nodes"):
        return None
    return random.choice(graph_data["nodes"])["id"]

def propagate_disruption(graph_data: dict, selected_node_id: str):
    """
    Updates the status of nodes in the graph based on the selected disruption point.
    Selected node becomes 'critical'.
    Neighbors become 'affected'.
    """
    nodes = {node["id"]: node for node in graph_data.get("nodes", [])}
    edges = graph_data.get("edges", [])
    
    # 1. Reset all statuses to normal
    for node_id in nodes:
        nodes[node_id]["status"] = "normal"
    
    # 2. Set selected node to critical
    if selected_node_id in nodes:
        nodes[selected_node_id]["status"] = "critical"
        
        # 3. Find neighbors and set them to affected
        affected_neighbors = set()
        for edge in edges:
            if edge["source"] == selected_node_id:
                affected_neighbors.add(edge["target"])
            elif edge["target"] == selected_node_id:
                affected_neighbors.add(edge["source"])
        
        for neighbor_id in affected_neighbors:
            if neighbor_id in nodes:
                nodes[neighbor_id]["status"] = "affected"
    
    return list(nodes.values())
