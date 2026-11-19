import 'expo-sqlite/localStorage/install';
import { parseAddresses, type Address } from './records';

const key = 'addressbook.v1';
export const loadAddresses = () => parseAddresses(localStorage.getItem(key));
export const saveAddresses = (addresses: Address[]) =>
  localStorage.setItem(key, JSON.stringify(addresses));
