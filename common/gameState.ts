import * as z from 'zod/mini';

import { allRooms, allSuspects, allWeapons } from './cards';
import { allPlayPhases } from './playPhase';

export const solutionSchema = z.tuple([
	z.enum(allSuspects),
	z.enum(allWeapons),
	z.enum(allRooms),
]);
export type Solution = z.infer<typeof solutionSchema>;

export const playerStateSchema = z.strictObject({
	suspect: z.nullable(z.enum(allSuspects)),
	name: z.string(),
	eliminated: z.boolean(),
	x: z.number(),
	y: z.number(),
	room: z.nullable(z.enum(allRooms)),
	teleported: z.boolean(),
});
export type PlayerState = z.infer<typeof playerStateSchema>;

export const gameStateSchema = z.strictObject({
	players: z.codec(
		z.record(z.string(), playerStateSchema),
		z.map(z.string(), playerStateSchema),
		{
			decode: (players) => new Map(Object.entries(players)),
			encode: (players) => Object.fromEntries(players),
		},
	),
	phase: z.enum(allPlayPhases),
	turnOrder: z.array(z.string()),
	currentPlayer: z.string(),
	dieRoll: z.number(),
	suggestion: z.nullable(solutionSchema),
	currentPlayerDisprovingSuggestion: z.string(),
	leftRoom: z.nullable(z.enum(allRooms)),
});
export type GameState = z.infer<typeof gameStateSchema>;
