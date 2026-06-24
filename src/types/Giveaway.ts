import { Timestamp } from 'firebase/firestore';

export type Giveaway = {
  name: string;
  description: string;
  active: boolean;
  duration: string;
  giveawayStartTime: string;
  giveawayEndTime: string;
  winnerAnnounced: string;
  prize: string;
  prizeValue: number;
  summary: string;
  testMode?: boolean;
  gameData: {
    [key: string]: string;
  };
};

export interface GiveawayEntry {
  giveawayName: string;
  uid: string;
  id?: number;
  displayName: string;
  email: string;
  instagram: string | null;
  facebook: string | null;
  timestamp?: Timestamp;
  bypassGame: boolean;
  entryStartTime?: Date;
  entryEndTime?: Date;
}

export type GiveawayFormData = Pick<GiveawayEntry, 'displayName' | 'email' | 'instagram' | 'facebook'>;
