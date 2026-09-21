import React from 'react';

import type { Card } from '#common/cards';
import type { GameState } from '#common/gameState';
import type { ClientToServerMessage } from '#common/message';

export type GameMessage = { id: number; message: string };
export const GameMessagesContext = React.createContext<GameMessage[]>([]);
export const GameStateContext = React.createContext<GameState>(undefined!);
export const RoomIdContext = React.createContext<string>(undefined!);
export const SendMessageContext = React.createContext<
	(m: ClientToServerMessage) => void
>(undefined!);
export const PlayerIdContext = React.createContext<string>(undefined!);
export const YourCardsContext = React.createContext<Card[]>([]);
