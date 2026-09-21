import * as z from 'zod/mini';

import { allRooms, allSuspects, allWeapons } from './cards';
import { gameStateSchema, solutionSchema } from './gameState';

const cardSchema = z.enum([...allSuspects, ...allWeapons, ...allRooms]);

export const clientToServerMessageSchema = z.discriminatedUnion('type', [
	z.strictObject({
		type: z.literal('player_setup'),
		name: z.string(),
		suspect: z.enum(allSuspects),
	}),
	z.strictObject({ type: z.literal('begin_game') }),
	z.strictObject({ type: z.literal('roll_die') }),
	z.strictObject({
		type: z.literal('move_to_coord'),
		coord: z.tuple([z.int(), z.int()]),
	}),
	z.strictObject({ type: z.literal('move_to_room'), room: z.enum(allRooms) }),
	z.strictObject({
		type: z.literal('move_through_passage'),
		room: z.enum(allRooms),
	}),
	z.strictObject({
		type: z.literal('make_suggestion'),
		suggestion: solutionSchema,
	}),
	z.strictObject({
		type: z.literal('disprove_suggestion'),
		card: z.nullable(cardSchema),
	}),
	z.strictObject({
		type: z.literal('make_accusation'),
		accusation: solutionSchema,
	}),
	z.strictObject({ type: z.literal('end_turn') }),
]);
export type ClientToServerMessage = z.infer<typeof clientToServerMessageSchema>;

export const serverToClientMessageSchema = z.discriminatedUnion('type', [
	z.strictObject({
		type: z.literal('room_info'),
		room: z.string(),
		player: z.string(),
	}),
	z.strictObject({ type: z.literal('game_state'), state: gameStateSchema }),
	z.strictObject({ type: z.literal('game_message'), message: z.string() }),
	z.strictObject({ type: z.literal('your_cards'), cards: z.array(cardSchema) }),
	z.strictObject({ type: z.literal('error'), err: z.string() }),
]);
export type ServerToClientMessage = z.infer<typeof serverToClientMessageSchema>;
