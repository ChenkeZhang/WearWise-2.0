import React from 'react';
import { ClothingAdvice } from '../types';
import { Shirt, Umbrella, AlertTriangle, Info } from 'lucide-react';

interface ClothingCardProps {
  advice: ClothingAdvice;
}

const ClothingCard: React.FC<ClothingCardProps> = ({ advice }) => {
  return (
    <div className="w-full space-y-4">
      {/* Summary */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Stylist's Summary</h3>
        <p className="text-slate-600 italic">"{advice.summary}"</p>
      </div>

      {/* Alerts */}
      {advice.alerts.length > 0 && (
        <div className="space-y-2">
          {advice.alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl flex items-start space-x-3 border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-500 text-red-800' :
                alert.severity === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                'bg-blue-50 border-blue-500 text-blue-800'
              }`}
            >
              <AlertTriangle className="flex-shrink-0 w-5 h-5 mt-0.5" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wide">{alert.type} Alert</p>
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clothing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-4 text-purple-600">
            <Shirt className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">Wear This</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Top</p>
              <div className="flex flex-wrap gap-2">
                {advice.outfitTop.map((item, i) => (
                  <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Bottom</p>
              <div className="flex flex-wrap gap-2">
                {advice.outfitBottom.map((item, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-4 text-teal-600">
            <Umbrella className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">Don't Forget</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {advice.accessories.length > 0 ? (
              advice.accessories.map((item, i) => (
                <span key={i} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium border border-teal-100">
                  {item}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm">No accessories needed today.</span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Reasoning */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center space-x-2 mb-2 text-slate-600">
          <Info className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Why this suggestion?</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          {advice.reasoning}
        </p>
      </div>
    </div>
  );
};

export default ClothingCard;
