import * as Consts from './Consts';

export type PlayerState = {
	suspect: Consts.Suspect,
	name: string,
	x: number,
	y: number,
	room: Consts.Room | '',
};

export type GameState = {
	players: {[id: string]: PlayerState},
	phase: Consts.PlayPhase,
	turnOrder: string[],
	currentPlayer: string,
	dieRoll: number,
};
