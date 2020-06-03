import * as Consts from './Consts';

export type PlayerState = {suspect: Consts.Suspect, name: string};
export type GameState = {
	players: {[id: string]: PlayerState},
	phase: Consts.PlayPhase,
};
