import { Room, Suspect, PlayPhase } from 'murderisinthecards-common/Consts';

export type PlayerState = {
	readonly suspect: Suspect,
	readonly name: string,
	readonly x: number,
	readonly y: number,
	readonly room: Room | '',
};

export type GameState = {
	readonly players: {readonly [id: string]: PlayerState},
	readonly phase: PlayPhase,
	readonly turnOrder: string[],
	readonly currentPlayer: string,
	readonly dieRoll: number,
};
