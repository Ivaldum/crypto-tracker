import React from 'react';
import { Dialog } from '@headlessui/react';
import { Bell, X, AlertCircle } from 'lucide-react';

interface AlertConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thresholdPercentage: number;
  onThresholdChange: (value: number) => void;
  onSubmit: () => void;
  cryptoName?: string;
  currentPrice?: number;
}

const AlertConfigDialog: React.FC<AlertConfigDialogProps> = ({
  isOpen,
  onClose,
  thresholdPercentage,
  onThresholdChange,
  onSubmit,
  cryptoName = '',
  currentPrice,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Configurar Alerta
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Crypto Info */}
            {cryptoName && currentPrice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Configurando alerta para</p>
                <p className="text-lg font-semibold text-gray-900">{cryptoName}</p>
                <p className="text-sm text-gray-500">
                  Precio actual: ${currentPrice.toFixed(2)}
                </p>
              </div>
            )}

            {/* Threshold Slider */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Porcentaje de cambio
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={thresholdPercentage}
                  onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="w-16 px-2 py-1 text-center text-sm font-medium text-gray-900 bg-gray-100 rounded">
                  {thresholdPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100 space-y-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p>
                Al configurar esta alerta, recibirás notificaciones cuando el precio 
                de {cryptoName} cambie más de un {thresholdPercentage}% en cualquier dirección.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Guardar Alerta
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AlertConfigDialog;