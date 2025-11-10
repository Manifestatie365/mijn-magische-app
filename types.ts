export enum AppState {
  INPUT_WISH,
  LOADING,
  SHOWING_SPELL,
}

export interface Spell {
  geestenBoodschap: string;
  ritueleInstructie: string;
  energetischeTip: string;
}

export enum SigilState {
  IDLE,
  GENERATING,
  GENERATED,
  ERROR,
}
