# Conspyramid

The campaign's faction conspiracy graph, based on the Conspyramid structure from Night's Black Agents.

## Concept

Nodes represent people, places, organizations, or events. Edges represent connections (clues, relationships, dependencies). Players navigate the graph by discovering clues that point from one node to another.

## Structure

```
conspyramid/
  graph.json    # The actual graph data (nodes + edges)
  README.md     # This file
```

## Graph Schema (planned)

```json
{
  "nodes": [
    {
      "id": "string",
      "name": "string",
      "type": "person | place | organization | event | secret",
      "tier": 1-5,
      "faction": "string",
      "status": "unknown | discovered | resolved",
      "description": "string",
      "clues_here": ["list of clues found at this node"],
      "connections": ["list of edge IDs"]
    }
  ],
  "edges": [
    {
      "id": "string",
      "from": "node_id",
      "to": "node_id",
      "type": "clue | relationship | dependency | opposition",
      "investigative_ability": "which SotS ability reveals this connection",
      "description": "what the clue/connection is",
      "discovered": false
    }
  ]
}
```

Tier 1 = street level, Tier 5 = BBEG (elder dragon).
Default difficulty for tests at a node = 3 + tier.

## Not yet built

This schema is a starting point. The actual `graph.json` will be created when faction and NPC design begins.
