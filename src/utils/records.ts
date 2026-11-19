export type Address = {
  id: string;
  name: string;
  address: string;
  image?: string;
};

export function parseAddresses(raw: string | null): Address[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every((item) =>
    item && typeof item.id === 'string' && typeof item.name === 'string' &&
    typeof item.address === 'string' &&
    (item.image === undefined || typeof item.image === 'string')
  )) throw new Error('Invalid saved addresses');
  return data;
}

export function validateAddress(name: string, address: string): 'nameRequired' | 'addressRequired' | null {
  if (!name.trim()) return 'nameRequired';
  if (!address.trim()) return 'addressRequired';
  return null;
}

export function updateAddress(records: Address[], updated: Address): Address[] {
  if (!records.some(item => item.id === updated.id)) throw new Error('Address no longer exists');
  return records.map(item => item.id === updated.id ? updated : item);
}

export function removeAddress(records: Address[], id: string): Address[] {
  return records.filter(item => item.id !== id);
}
