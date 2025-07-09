export interface Competitor {
  id: string;
  name: string;
  team: string;
  level: string;
  scores: { [eventName: string]: number };
  totalScore: number;
  rank: number;
}

export interface Event {
  id: string;
  name: string;
  shortName: string;
  maxScore: number;
  icon: string;
}

export interface Competition {
  id: string;
  name: string;
  date: string;
  section: 'men' | 'women';
  events: Event[];
  competitors: Competitor[];
}