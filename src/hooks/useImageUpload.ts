import { useState } from 'react';
import { cloudinaryService } from '../services/cloudinaryService';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Télécharge une image vers Cloudinary
   * @param file - L'objet File à télécharger
   * @returns L'URL de l'image téléchargée
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    // Vérifier le type de fichier (seulement des images)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setUploadError('Seules les images JPEG, PNG, GIF et WEBP sont acceptées');
      return null;
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('L\'image ne doit pas dépasser 5MB');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Simuler la progression du téléchargement
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Télécharger l'image vers Cloudinary
      const imageUrl = await cloudinaryService.uploadImage(file);

      // Nettoyer et finaliser
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);

      return imageUrl;
    } catch (error) {
      setUploadError('Échec du téléchargement de l\'image');
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Error uploading image:', error);
      return null;
    }
  };

  /**
   * Convertit une URL de données (base64) en objet File
   * @param dataUrl - L'URL de données à convertir
   * @param filename - Le nom de fichier souhaité
   * @returns Un objet File
   */
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) {
      throw new Error('Invalid data URL');
    }

    const mimeMatch = (arr[0] ?? "").match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2) {
      throw new Error('Could not extract MIME type from data URL');
    }

    const mime = mimeMatch[1];
    const bstr = atob(arr[1] ?? "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  /**
   * Redimensionne une image à partir d'une URL
   * @param imageUrl - L'URL de l'image à redimensionner
   * @param width - La largeur souhaitée
   * @param height - La hauteur souhaitée
   * @returns L'URL Cloudinary redimensionnée
   */
  const getResizedImageUrl = (imageUrl: string, width: number, height: number): string => {
    return cloudinaryService.getResizedImageUrl(imageUrl, width, height);
  };

  /**
   * Réinitialise l'état d'upload
   */
  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  };

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadImage,
    dataUrlToFile,
    getResizedImageUrl,
    resetUpload
  };
};