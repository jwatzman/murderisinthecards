import * as Consts from './Consts';

export type PlayerState = {
	readonly suspect: Consts.Suspect,
	readonly name: string,
	readonly x: number,
	readonly y: number,
	readonly room: Consts.Room | '',
};

export type GameState = {
	readonly players: {readonly [id: string]: PlayerState},
	readonly phase: Consts.PlayPhase,
	readonly turnOrder: string[],
	readonly currentPlayer: string,
	readonly dieRoll: number,
};
