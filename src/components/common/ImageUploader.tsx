import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageUpload } from '../../hooks/useImageUpload';

interface ImageUploaderProps {
  initialImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImage,
  onImageUploaded,
  onImageRemoved
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialImage);
  const [isDragging, setIsDragging] = useState(false);

  const {
    isUploading,
    uploadProgress,
    uploadError,
    uploadImage,
    resetUpload
  } = useImageUpload();

  // Déclencher le dialogue de sélection de fichier
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // Gérer la sélection de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    await handleUpload(file);

    e.target.value = '';
  };

  // Gérer le glisser-déposer
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;
    await handleUpload(file);
  };

  // Télécharger le fichier
  const handleUpload = async (file: File) => {
    // Créer une prévisualisation locale
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Télécharger l'image
    const imageUrl = await uploadImage(file);

    // Libérer la mémoire de la prévisualisation locale
    URL.revokeObjectURL(localPreview);

    if (imageUrl) {
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
    } else {
      // Revenir à l'image initiale en cas d'échec
      setPreviewUrl(initialImage);
    }
  };

  // Supprimer l'image
  const handleRemove = () => {
    setPreviewUrl(undefined);
    resetUpload();
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {previewUrl ? (
        // Afficher l'image prévisualisée avec options
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Task image"
            className="w-full h-48 object-cover"
          />

          {/* Overlay avec boutons d'action */}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleSelectClick}
              className="bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              {t('todo.changeImage')}
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
            >
              {t('todo.removeImage')}
            </button>
          </div>
        </div>
      ) : (
        // Zone de téléchargement
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelectClick}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${isDragging
              ? 'border-primary-light bg-primary-light bg-opacity-10'
              : 'border-gray-300 hover:border-primary-light dark:border-gray-600 dark:hover:border-primary-dark'}
          `}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            <p className="text-sm font-medium">
              {t('common.dragDrop')} {t('common.or')} {t('common.selectImage')}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF, WEBP (max 5MB)
            </p>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-primary-light h-2.5 rounded-full dark:bg-primary-dark"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            {t('todo.imageUploading')} {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Message d'erreur */}
      {uploadError && (
        <p className="text-red-500 text-xs mt-1">{uploadError}</p>
      )}
    </div>
  );
};

export default ImageUploader;