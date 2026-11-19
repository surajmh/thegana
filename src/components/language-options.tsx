import { Text } from '@/components/localized-text';
import { languages, type Language } from '@/i18n/messages';
import { SelectionRow } from './selection-row';

export function LanguageOptions({ selected, onChoose }: {
  selected: Language | null; onChoose: (language: Language) => void;
}) {
  return languages.map(language => <SelectionRow key={language.code} label={language.name}
    language={language.code} selected={selected === language.code} onPress={() => onChoose(language.code)}
    leading={<Text accessible={false} style={{ fontSize: 34 }}>{language.flag}</Text>} />);
}
