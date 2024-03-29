import type { PlayPhase, Room, Solution, Suspect } from 'common/Consts';

export type ConstPlayerState = {
	readonly suspect: Suspect;
	readonly name: string;
	readonly eliminated: boolean;
	readonly x: number;
	readonly y: number;
	readonly room: Room | '';
	readonly teleported: boolean;
};

export type ConstGameState = {
	readonly players: Map<string, ConstPlayerState>;
	readonly phase: PlayPhase;
	readonly turnOrder: string[];
	readonly currentPlayer: string;
	readonly dieRoll: number;
	readonly suggestion: Solution;
	readonly currentPlayerDisprovingSuggestion: string;
	readonly leftRoom: Room | '';
};
