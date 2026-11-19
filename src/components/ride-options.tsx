import { Image } from 'expo-image';
import { rideProviders, type RideProvider } from '@/utils/rideshare';
import { rideLogos } from '@/utils/ride-logos';
import { SelectionRow } from './selection-row';

export function RideOptions({ selected, onChange }: {
  selected: RideProvider[]; onChange: (providers: RideProvider[]) => void;
}) {
  return rideProviders.map(provider => <SelectionRow key={provider} label={provider} multiple
    selected={selected.includes(provider)}
    onPress={() => onChange(selected.includes(provider) ? selected.filter(item => item !== provider) : [...selected, provider])}
    leading={<Image source={rideLogos[provider]} accessible={false} contentFit="contain"
      style={{ width: 48, height: 48, borderRadius: 12 }} />} />);
}
