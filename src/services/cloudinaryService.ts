/**
 * Service pour gérer l'upload d'images vers Cloudinary comme alternative à Firebase Storage
 */

// Interface pour la réponse de Cloudinary
interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
    resource_type: string;
    tags: string[];
    original_filename: string;
  }

  // Classe pour gérer les uploads Cloudinary
  export class CloudinaryService {
    private cloudName: string;
    private uploadPreset: string;
    private uploadUrl: string;

    constructor() {
      this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
      this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
      this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

      // Logging de débogage pour voir si la configuration est chargée
      console.log('CloudinaryService initialized with:', {
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset ? 'PRESENT' : 'MISSING',
        uploadUrl: this.uploadUrl
      });
    }

    /**
     * methode de test de connexion à cloudinary
     */
    async testConnection(): Promise<boolean> {
        try {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${this.cloudName}/ping`,
            { method: 'GET' }
          );

          if (response.ok) {
            console.log('Cloudinary connection successful');
            return true;
          } else {
            console.error('Cloudinary connection failed:', await response.text());
            return false;
          }
        } catch (error) {
          console.error('Error testing Cloudinary connection:', error);
          return false;
        }
    }

    /**
     * Upload une image vers Cloudinary
     * @param file - Le fichier image à uploader
     * @returns Promise avec l'URL de l'image uploadée
     */
    async uploadImage(file: File): Promise<string> {
        if (!this.cloudName || !this.uploadPreset) {
        console.warn('Cloudinary configuration is missing, falling back to base64 encoding');
        return this.getBase64Fallback(file);
        }

        try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);

        const response = await fetch(this.uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            // Récupérer les détails de l'erreur
            const errorData = await response.json();
            console.error('Cloudinary upload failed:', errorData);

            // Si l'erreur concerne le preset non configuré, utilisez la solution de secours
            if (errorData?.error?.message?.includes('upload preset') ||
                errorData?.error?.message?.includes('whitelist')) {
            console.warn('Using base64 fallback due to Cloudinary preset configuration issue');
            return this.getBase64Fallback(file);
            }

            throw new Error(`Failed to upload image to Cloudinary: ${JSON.stringify(errorData)}`);
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url;
        } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);

        // Si une erreur se produit, utiliser la solution de secours
        console.warn('Falling back to base64 encoding after Cloudinary error');
        return this.getBase64Fallback(file);
        }
    }

    /**
     * Solution alternative: convertir l'image en Base64 si Cloudinary n'est pas configuré
     * @param file - Le fichier image à encoder
     * @returns Promise avec la chaîne Base64
     */
    async getBase64Fallback(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert file to base64'));
            }
          };
          reader.onerror = error => reject(error);
        });
    }

    /**
     * Utilise l'API Cloudinary pour redimensionner une image
     * @param imageUrl - URL de l'image à transformer
     * @param width - Largeur souhaitée
     * @param height - Hauteur souhaitée
     * @returns URL de l'image transformée
     */
    getResizedImageUrl(imageUrl: string, width: number, height: number): string {
      if (!imageUrl) return '';

      // Vérifie si c'est une URL Cloudinary
      if (imageUrl.includes('cloudinary.com')) {
        return imageUrl.replace(/\/upload\//, `/upload/c_fill,w_${width},h_${height}/`);
      }

      // Vérifie si c'est une URL data (Base64)
      if (imageUrl.startsWith('data:')) {
        return imageUrl; // Impossible de redimensionner une image Base64 directement
      }

      // Retourne l'URL originale si ce n'est pas une URL Cloudinary
      return imageUrl;
    }
  }

  // Exporte une instance unique du service
  export const cloudinaryService = new CloudinaryService();