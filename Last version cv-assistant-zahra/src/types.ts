export interface Message {
  id: string;
  role: 'user' | 'zahra';
  text: string;
}

export type TabState = 'chat' | 'voice' | 'history' | 'settings';
export type Language = 'en' | 'fr';
