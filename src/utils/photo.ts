import { Directory, File, Paths } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';

export function keepPhoto(asset: ImagePickerAsset, id: string) {
  const directory = new Directory(Paths.document, 'address-photos');
  directory.create({ idempotent: true, intermediates: true });
  const photo = new File(directory, `${id}.${asset.mimeType === 'image/png' ? 'png' : 'jpg'}`);
  new File(asset.uri).copy(photo);
  return photo.uri;
}
