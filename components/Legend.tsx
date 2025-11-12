
import React from 'react';

export const nodeColorMapping: { [key: string]: string } = {
  'UI interface': 'bg-blue-500',
  'DB server': 'bg-red-500',
  'Middleware': 'bg-green-500',
  'Connector': 'bg-purple-500',
  'Venafi Application': 'bg-yellow-500',
  'Upstream': 'bg-indigo-500',
  'Downstream': 'bg-pink-500',
  'default': 'bg-gray-600',
};

const nodeTypes = [
  'UI interface',
  'DB server',
  'Middleware',
  'Connector',
  'Venafi Application',
  'Upstream',
  'Downstream'
];

export const Legend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg">
      <h3 className="font-bold text-gray-200 text-sm mb-2">Legend</h3>
      <ul className="space-y-1">
        {nodeTypes.map(type => (
          <li key={type} className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${nodeColorMapping[type] || nodeColorMapping['default']}`}></span>
            <span className="text-xs text-gray-300">{type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
