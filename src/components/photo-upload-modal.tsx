import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Camera, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePhotoUpload } from "@/hooks/use-event-photos";
import { validateImageFiles } from "@/lib/image-compression";
import type { UploadedPhoto, PhotoValidationError } from "@/types/photo";
import LoadingSpinner from "./loading-spinner";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

export default function PhotoUploadModal({ 
  isOpen, 
  onClose, 
  eventId, 
  eventName 
}: PhotoUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<UploadedPhoto[]>([]);
  const [validationErrors, setValidationErrors] = useState<PhotoValidationError[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const uploadMutation = usePhotoUpload(eventId);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Validation
    const { validFiles, errors } = validateImageFiles(acceptedFiles);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    setSelectedFiles(validFiles);
    
    // Create previews
    const newPreviews: UploadedPhoto[] = validFiles.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      tempUrl: URL.createObjectURL(file),
      file,
      status: 'uploading',
    }));
    
    setPreviews(newPreviews);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index].tempUrl);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploadProgress(0);
      
      // Simulate progress (since we don't have real progress from upload)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const results = await uploadMutation.mutateAsync(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Check results
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);
      
      if (failedUploads.length > 0) {
        const errors: PhotoValidationError[] = failedUploads.map(result => ({
          file: 'upload',
          error: result.error || 'Error desconocido'
        }));
        setValidationErrors(errors);
      } else {
        // All successful, close modal
        handleClose();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setValidationErrors([{
        file: 'upload',
        error: 'Error al subir las fotos. Por favor, inténtalo de nuevo.'
      }]);
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.tempUrl));
    
    setSelectedFiles([]);
    setPreviews([]);
    setValidationErrors([]);
    setUploadProgress(0);
    onClose();
  };

  const canUpload = selectedFiles.length > 0 && !uploadMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Subir fotos a "{eventName}"</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Disclaimer Legal */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-800 mb-2">
                ⚖️ Responsabilidad Legal - LEE ANTES DE SUBIR
              </p>
              <ul className="text-red-700 space-y-1 text-xs">
                <li>• <strong>Confirmas</strong> que eres propietario de las imágenes o tienes autorización para publicarlas</li>
                <li>• <strong>Aceptas</strong> la responsabilidad total sobre el contenido subido</li>
                <li>• <strong>Autorizas</strong> el uso de las imágenes para promoción de las fiestas</li>
                <li>• <strong>Te comprometes</strong> a no subir contenido ofensivo, ilegal o que viole derechos</li>
                <li>• <strong>Entiendes</strong> que las fotos serán públicas y moderadas por el equipo</li>
              </ul>
              <p className="mt-2 font-medium text-red-800 text-xs bg-red-100 p-2 rounded border">
                ⚠️ <strong>IMPORTANTE:</strong> Al hacer clic en "Subir fotos" confirmas haber leído y aceptas TODOS estos términos de responsabilidad completamente.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      {error.file !== 'general' && error.file !== 'upload' && (
                        <span className="font-medium">{error.file}:</span>
                      )} {error.error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600">Subiendo fotos...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-500">{uploadProgress}% completado</p>
            </div>
          )}

          {/* Drop Zone */}
          {selectedFiles.length === 0 && !uploadMutation.isPending && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-festival-orange bg-festival-orange/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Suelta las fotos aquí' : 'Arrastra fotos aquí'}
              </h3>
              <p className="text-gray-500 mb-4">
                o haz clic para seleccionar archivos
              </p>
              <div className="text-xs text-gray-400">
                Máximo 5 fotos • JPG, PNG, WebP • Hasta 5MB cada una
              </div>
            </div>
          )}

          {/* Preview Grid */}
          {selectedFiles.length > 0 && !uploadMutation.isPending && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Vista previa ({selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''})
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={preview.tempUrl}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="mt-2 text-xs text-gray-500 truncate">
                      {selectedFiles[index]?.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add more button */}
              {selectedFiles.length < 5 && (
                <div
                  {...getRootProps()}
                  className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    Añadir más fotos ({5 - selectedFiles.length} restante{5 - selectedFiles.length !== 1 ? 's' : ''})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="bg-festival-orange hover:bg-festival-red text-white"
            >
              {uploadMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir {selectedFiles.length} foto{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
