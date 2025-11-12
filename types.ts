import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface ServiceNode extends SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  services: string[];
  layer?: number;
  // Fix: Explicitly add properties from SimulationNodeDatum to resolve TypeScript errors in ServiceMapDiagram.tsx.
  // These properties are dynamically added by the D3 force simulation.
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface ServiceLink extends SimulationLinkDatum<ServiceNode> {
  source: string | ServiceNode;
  target: string | ServiceNode;
}

export interface GraphData {
  nodes: ServiceNode[];
  links: ServiceLink[];
}