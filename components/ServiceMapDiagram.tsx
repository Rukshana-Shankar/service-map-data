
import React, { useRef, useEffect } from 'react';
import type { GraphData, ServiceNode, ServiceLink } from '../types';
import type { Selection, Simulation } from 'd3';

declare const d3: any;

interface ServiceMapDiagramProps {
  data: GraphData;
}

const nodeColor = '#475569'; // slate-600. A uniform, structured color.

export const ServiceMapDiagram: React.FC<ServiceMapDiagramProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, links } = data;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const parent = svg.node().parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    
    svg.attr('width', width).attr('height', height);

    svg.selectAll("*").remove(); // Clear previous renders

    const container = svg.append("g");

    const nodeWidth = 200;
    const baseNodeHeight = 90;
    const serviceItemHeight = 25;
    const servicesHeaderHeight = 25;

    const calculateNodeHeight = (d: ServiceNode) => {
      if (d.services.length === 0) {
        return baseNodeHeight;
      }
      return baseNodeHeight + servicesHeaderHeight + (d.services.length * serviceItemHeight);
    };

    const layerX = (layer: number, totalWidth: number): number => {
      const numLayers = Math.max(...nodes.map(n => n.layer || 0));
      const padding = totalWidth * 0.1;
      const drawableWidth = totalWidth - (padding * 2);
      if (numLayers <= 1) {
        return totalWidth / 2;
      }
      const spacing = drawableWidth / (numLayers - 1);
      return padding + (layer - 1) * spacing;
    };

    const simulation: Simulation<ServiceNode, ServiceLink> = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(300))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("x", d3.forceX((d: ServiceNode) => layerX(d.layer || 0, width)).strength(0.4))
      .force("y", d3.forceY(height / 2).strength(0.04))
      .force("collide", d3.forceCollide().radius((d: ServiceNode) => Math.max(nodeWidth, calculateNodeHeight(d))/2 + 30));


    // Define arrow markers
    container.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 23)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#9ca3af') // gray-400
      .style('stroke', 'none');

    const link = container.append("g")
      .attr("stroke", "#9ca3af") // gray-400
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr('marker-end', 'url(#arrowhead)');

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g");
      
    // Main node rectangle
    node.append("rect")
      .attr("width", nodeWidth)
      .attr("height", d => calculateNodeHeight(d))
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("x", -nodeWidth/2)
      .attr("y", d => -calculateNodeHeight(d)/2)
      .attr("fill", nodeColor)
      .attr("stroke", "#94a3b8") // slate-400
      .attr("stroke-width", 2);
      
    // Node name
    node.append("text")
      .attr("y", d => -calculateNodeHeight(d)/2 + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .attr("fill", "#ffffff")
      .text(d => d.name);

    // Node type
    node.append("text")
      .attr("y", d => -calculateNodeHeight(d)/2 + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-style", "italic")
      .attr("fill", "#e5e7eb")
      .text(d => d.type);
      
    // Services Section
    const servicesGroup = node.filter(d => d.services.length > 0)
        .append('g')
        .attr('transform', d => `translate(0, ${-calculateNodeHeight(d)/2 + 75})`); 

    // Services Title
    servicesGroup.append("text")
      .attr("x", -nodeWidth/2 + 15)
      .attr("y", 10)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .attr("fill", "#f3f4f6")
      .text("Services:");

    // Individual Service Items
    const serviceItemGroup = servicesGroup.selectAll('.service-item')
      .data(d => d.services)
      .join('g')
      .attr('class', 'service-item')
      .attr('transform', (d, i) => `translate(${-nodeWidth/2 + 15}, ${25 + (i * serviceItemHeight)})`);

    // Service item background
    serviceItemGroup.append('rect')
      .attr('width', nodeWidth - 30)
      .attr('height', 20)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', '#2563eb');

    // Service item text
    serviceItemGroup.append('text')
      .attr('x', 10)
      .attr('y', 14)
      .style('font-size', '11px')
      .attr('fill', '#e5e7eb')
      .text(d => d as string);


    const drag = (simulation: Simulation<ServiceNode, ServiceLink>) => {
      function dragstarted(event: any, d: ServiceNode) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event: any, d: ServiceNode) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event: any, d: ServiceNode) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }
    
    node.call(drag(simulation));

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as ServiceNode).x!)
        .attr("y1", d => (d.source as ServiceNode).y!)
        .attr("x2", d => (d.target as ServiceNode).x!)
        .attr("y2", d => (d.target as ServiceNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Zoom and Pan
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event: any) => {
            container.attr('transform', event.transform);
        });

    svg.call(zoom);

  }, [nodes, links]); // Rerun effect if data changes

  return <svg ref={svgRef} className="w-full h-full"></svg>;
};