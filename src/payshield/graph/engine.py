import networkx as nx
from typing import Dict, List, Set, Any, Tuple
from payshield.models.events import FinancialEvent

class EntityGraphEngine:
    """
    In-memory heterogeneous relationship graph linking:
    Accounts, Devices, IPs, Cards, and Beneficiaries.
    Identifies Sybil fraud rings, degree centrality, and shared entity fan-out in < 5ms.
    """
    def __init__(self):
        self.graph = nx.Graph()

    def update_graph(self, event: FinancialEvent):
        acc = f"acc:{event.account_id}"
        self.graph.add_node(acc, node_type="account", label=event.account_id)

        # Device Link
        if event.device_id:
            dev = f"dev:{event.device_id}"
            self.graph.add_node(dev, node_type="device", is_emulator=event.is_emulator)
            self.graph.add_edge(acc, dev, edge_type="USED_DEVICE")

        # IP Link
        if event.ip_address and event.ip_address != "127.0.0.1":
            ip_node = f"ip:{event.ip_address}"
            self.graph.add_node(ip_node, node_type="ip")
            self.graph.add_edge(acc, ip_node, edge_type="CONNECTED_IP")

        # Card Link
        if event.payment_method_id:
            card = f"card:{event.payment_method_id}"
            self.graph.add_node(card, node_type="card")
            self.graph.add_edge(acc, card, edge_type="FUNDED_BY")

        # Beneficiary Link
        if event.recipient_id:
            bene = f"bene:{event.recipient_id}"
            self.graph.add_node(bene, node_type="beneficiary")
            self.graph.add_edge(acc, bene, edge_type="SENT_TO")

    def extract_graph_features(self, account_id: str) -> Dict[str, float]:
        acc = f"acc:{account_id}"
        if not self.graph.has_node(acc):
            return {
                "shared_device_accounts": 0.0,
                "shared_ip_accounts": 0.0,
                "shared_card_accounts": 0.0,
                "in_fraud_ring": 0.0,
                "graph_degree": 0.0
            }

        neighbors = list(self.graph.neighbors(acc))
        shared_devices = 0
        shared_ips = 0
        shared_cards = 0

        for n in neighbors:
            ntype = self.graph.nodes[n].get("node_type", "")
            # Find all other accounts connected to this neighbor
            linked_accs = [
                x for x in self.graph.neighbors(n) 
                if x.startswith("acc:") and x != acc
            ]
            if ntype == "device":
                shared_devices = max(shared_devices, len(linked_accs))
            elif ntype == "ip":
                shared_ips = max(shared_ips, len(linked_accs))
            elif ntype == "card":
                shared_cards = max(shared_cards, len(linked_accs))

        # Flag Sybil ring if >= 2 other accounts share same device or card
        in_ring = 1.0 if (shared_devices >= 2 or shared_cards >= 2) else 0.0

        return {
            "shared_device_accounts": float(shared_devices),
            "shared_ip_accounts": float(shared_ips),
            "shared_card_accounts": float(shared_cards),
            "in_fraud_ring": in_ring,
            "graph_degree": float(len(neighbors))
        }

    def get_ego_subgraph_data(self, account_id: str, radius: int = 2) -> Dict[str, Any]:
        """
        Extracts vis-network compatible nodes and edges for the SOC frontend.
        """
        acc = f"acc:{account_id}"
        if not self.graph.has_node(acc):
            return {"nodes": [], "edges": []}

        sub = nx.ego_graph(self.graph, acc, radius=radius)
        nodes = []
        for n, data in sub.nodes(data=True):
            ntype = data.get("node_type", "unknown")
            is_target = (n == acc)
            nodes.append({
                "id": n,
                "label": n.split(":", 1)[-1],
                "type": ntype,
                "isTarget": is_target,
                "isEmulator": data.get("is_emulator", False)
            })

        edges = []
        for u, v, data in sub.edges(data=True):
            edges.append({
                "from": u,
                "to": v,
                "relation": data.get("edge_type", "RELATED")
            })

        return {"nodes": nodes, "edges": edges}

