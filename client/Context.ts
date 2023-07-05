import React from 'react';

import type { ConstGameState } from 'common/ConstGameState';
import type { Card, ClientToServerMessage } from 'common/Consts';

export type GameMessage = { id: number; message: string };
export const GameMessagesContext = React.createContext<GameMessage[]>([]);
export const GameStateContext = React.createContext<ConstGameState>(undefined!);
export const RoomIdContext = React.createContext<string>(undefined!);
export const SendMessageContext = React.createContext<
	(ty: ClientToServerMessage, m: any) => void
>(undefined!);
export const SessionIdContext = React.createContext<string>(undefined!);
export const YourCardsContext = React.createContext<Card[]>([]);
