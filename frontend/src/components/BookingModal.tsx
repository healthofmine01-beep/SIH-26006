import React, { useState } from 'react';
import { RouteRecommendation, VesselClass } from '../types';
import { X, Zap, ShieldCheck, Check, Sparkles, AlertCircle, ArrowRight, Ship } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  recommendation: RouteRecommendation | null;
  onClose: () => void;
  onConfirmBooking: (recId: string, customDetails: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  recommendation,
  onClose,
  onConfirmBooking,
}) => {
  if (!recommendation) return null;

  const [selectedVessel, setSelectedVessel] = useState<VesselClass>(recommendation.vesselType);
  const [cargoTonnage, setCargoTonnage] = useState<number>(recommendation.cargoVolume);
  const [bunkerHedge, setBunkerHedge] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  // Dynamic calculations
  const perTonneRate = recommendation.currentRate;
  const estimatedFreight = cargoTonnage * perTonneRate;
  const estimatedSavings = recommendation.savingsAmount;
  const totalNetCost = estimatedFreight - estimatedSavings;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0072E9', '#45DABE', '#052439']
      });

      setTimeout(() => {
        onConfirmBooking(recommendation.id, {
          selectedVessel,
          cargoTonnage,
          bunkerHedge,
          totalNetCost,
        });
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#E5E7EB] rounded w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#052439] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#0072E9] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Hanken_Grotesk']">
                Execute Fixture: {recommendation.route}
              </h3>
              <p className="text-xs text-[#728CA5]">
                Optimal Spot Booking • Recommended Loading Window (Laycan): {recommendation.laycanWindow}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isBooked ? (
          /* Success confirmation screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E6F9F5] text-[#009A84] mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-xl font-bold text-[#1B1C1A] font-['Hanken_Grotesk']">
              Fixture Successfully Initiated!
            </h4>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Charter confirmation notice generated for <strong>{recommendation.route}</strong> ({cargoTonnage.toLocaleString()} MT {recommendation.cargoType}). Estimated cost savings of <strong>${estimatedSavings.toLocaleString()}</strong> locked into operational manifest.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#052439] text-white text-xs font-semibold rounded hover:bg-[#001D32] transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Booking form */
          <div className="p-6 space-y-5">
            {/* AI Optimization Summary Banner */}
            <div className="bg-[#F4F2EF] border border-[#E5E7EB] rounded p-3 flex items-start gap-3 text-xs">
              <Sparkles className="w-4 h-4 text-[#0072E9] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#052439]">AI Recommendation Reason:</span>{' '}
                <span className="text-gray-700">
                  Rate is projected to increase from ${perTonneRate.toFixed(2)}/t to ${recommendation.forecastRate7D.toFixed(2)}/t over the next 7 days due to rising Pacific Capesize demand and bunker surges.
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vessel selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                  Vessel Class
                </label>
                <select
                  value={selectedVessel}
                  onChange={(e) => setSelectedVessel(e.target.value as VesselClass)}
                  className="w-full text-xs font-semibold bg-white border border-[#E5E7EB] rounded p-2.5 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9]"
                >
                  <option value="Capesize">Capesize (180k DWT)</option>
                  <option value="Panamax">Panamax (75k DWT)</option>
                  <option value="Supramax">Supramax (58k DWT)</option>
                </select>
              </div>

              {/* Cargo Volume */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1.5">
                  Cargo Volume (MT)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={cargoTonnage}
                  onChange={(e) => setCargoTonnage(Number(e.target.value))}
                  className="w-full text-xs font-semibold font-mono bg-white border border-[#E5E7EB] rounded p-2.5 text-[#1B1C1A] focus:outline-hidden focus:border-[#0072E9]"
                />
              </div>
            </div>

            {/* Cost Breakdown Card */}
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Spot Benchmark Rate:</span>
                <span className="font-mono font-semibold text-[#1B1C1A]">
                  ${perTonneRate.toFixed(2)} / tonne
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Gross Expected Freight:</span>
                <span className="font-mono font-semibold text-[#1B1C1A]">
                  ${estimatedFreight.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-[#009A84] font-medium">
                <span>Forecasted Timing Savings:</span>
                <span className="font-mono font-bold">
                  -${estimatedSavings.toLocaleString()} ({recommendation.savingsPercentage}%)
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-bold text-[#052439] text-sm font-['Hanken_Grotesk']">
                  Estimated Total Outlay:
                </span>
                <span className="font-bold font-mono text-[#0072E9] text-base">
                  ${totalNetCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bunker Hedging Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bunkerHedge}
                onChange={(e) => setBunkerHedge(e.target.checked)}
                className="w-4 h-4 rounded text-[#0072E9] border-gray-300 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-gray-800">
                  Auto-attach VLSFO Bunker Fuel Hedge (Singapore Platt's +1.5%)
                </span>
                <p className="text-gray-500 text-[11px]">Protects voyage against projected crude price spikes</p>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#0072E9] hover:bg-[#0059B9] text-white text-xs font-semibold rounded flex items-center gap-2 shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Confirm & Book Fixture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
