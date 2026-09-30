'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (sku: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onDetected,
}: BarcodeScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'piiprec-qr-reader';

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      setIsScanning(false);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setScannedResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError('No se detectó ninguna cámara disponible en este dispositivo.');
        return;
      }

      // Prefer back camera on mobile devices
      const backCamera = cameras.find((cam) =>
        cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('trasera')
      );
      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 12,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.333334,
        },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // ignore frame scan errors
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError(
        err.message || 'No se pudo acceder a la cámara. Concede los permisos en el navegador o utiliza la opción de subir una foto.'
      );
      setIsScanning(false);
    }
  };

  const handleSuccess = (barcode: string) => {
    setScannedResult(barcode);
    stopScanner();
    setTimeout(() => {
      onDetected(barcode);
      onClose();
    }, 700);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp');
      const decoded = await html5QrCode.scanFile(file, true);
      handleSuccess(decoded);
    } catch {
      setCameraError('No se encontró un código de barras legible en la imagen subida. Prueba con una foto más nítida o iluminada.');
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-blue-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Escáner Óptico de Código de Barras</h3>
              <p className="text-xs text-blue-100">Lectura real de productos (EAN-13 / UPC)</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Solo opciones reales */}
        <div className="flex p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Cámara en Vivo</span>
          </button>
          <button
            onClick={() => {
              stopScanner();
              setActiveTab('file');
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'file'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Foto del Código</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {scannedResult ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">¡Código Detectado!</h4>
              <p className="font-mono text-blue-700 text-base font-semibold mt-1 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {scannedResult}
              </p>
              <p className="text-xs text-slate-500 mt-2">Buscando información del producto...</p>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs w-full mb-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{cameraError}</p>
                    <p className="mt-1 text-slate-600">
                      Puedes utilizar la pestaña <strong>Subir Foto del Código</strong> para seleccionar una fotografía tomada con tu teléfono.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Viewport container */}
              <div className="w-full relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border border-slate-300">
                <div id={readerElementId} className="w-full h-full" />
                {!isScanning && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mb-2 text-blue-400" />
                    <p className="text-xs">Iniciando cámara...</p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 text-center mt-3">
                Apunta la cámara al código de barras del producto (EAN-13 / UPC).
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div id="file-scanner-temp" className="hidden" />
              <label className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
                <Upload className="w-9 h-9 text-blue-600 mb-2" />
                <span className="text-sm font-semibold text-slate-800">Seleccionar imagen o foto</span>
                <span className="text-xs text-slate-500 mt-1">Sube una foto clara del código de barras</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {cameraError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
