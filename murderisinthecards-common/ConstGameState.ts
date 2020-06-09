import { Room, Suspect, PlayPhase } from 'murderisinthecards-common/Consts';

export type ConstPlayerState = {
	readonly suspect: Suspect,
	readonly name: string,
	readonly x: number,
	readonly y: number,
	readonly room: Room | '',
};

export type ConstGameState = {
	readonly players: {readonly [id: string]: ConstPlayerState},
	readonly phase: PlayPhase,
	readonly turnOrder: string[],
	readonly currentPlayer: string,
	readonly dieRoll: number,
};
