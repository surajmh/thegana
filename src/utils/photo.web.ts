import type { ImagePickerAsset } from 'expo-image-picker';

export function keepPhoto(asset: ImagePickerAsset, _id: string) {
  if (!asset.base64) throw new Error('Photo data unavailable');
  return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
}
