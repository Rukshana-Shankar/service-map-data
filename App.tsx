
import React, { useState, useEffect } from 'react';
import { ServiceMapDiagram } from './components/ServiceMapDiagram';
import type { GraphData, ServiceNode } from './types';

const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    const getNodeLayer = (nodeId: string): number => {
      switch(nodeId) {
        case 'web123UI':
        case 'web1234UI':
          return 1;
        case 'pg2gres':
        case 'ec2linux':
          return 2;
        case 'jboss123':
        case 'venafi89':
        case 'dow345er':
          return 3;
        case 'apache45up':
          return 4;
        default:
          return 1; // Default layer
      }
    };

    fetch('/service_map.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const transformedData: GraphData = {
          nodes: data.nodes.map((node: Omit<ServiceNode, 'layer'>) => ({
            ...node,
            layer: getNodeLayer(node.id)
          })),
          links: data.edges
        };
        setGraphData(transformedData);
      })
      .catch(error => {
        console.error('Failed to load service map data:', error);
      });
  }, []);

  if (!graphData) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex justify-center items-center">
        <div className="text-xl">Loading Service Map...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 font-sans">
      <header className="w-full text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">Service Mapping Diagram</h1>
        <p className="text-lg text-gray-400">"Payment Red" Business Process</p>
      </header>
      <main className="w-full flex-grow relative border-2 border-gray-700 rounded-lg bg-gray-800/50 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        <ServiceMapDiagram data={graphData} />
      </main>
       <footer className="w-full text-center py-4 text-gray-500 text-sm">
        <p>Drag nodes to rearrange the diagram. Zoom and pan to navigate.</p>
      </footer>
    </div>
  );
};

export default App;
