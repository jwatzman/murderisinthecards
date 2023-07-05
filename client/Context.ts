import React from 'react';

import { Card, ClientToServerMessage } from 'common/Consts';
import { ConstGameState } from 'common/ConstGameState';

export type GameMessage = { id: number; message: string };
export const GameMessagesContext = React.createContext<GameMessage[]>([]);
export const GameStateContext = React.createContext<ConstGameState>(undefined!);
export const RoomIdContext = React.createContext<string>(undefined!);
export const SendMessageContext = React.createContext<
	(ty: ClientToServerMessage, m: any) => void
>(undefined!);
export const SessionIdContext = React.createContext<string>(undefined!);
export const YourCardsContext = React.createContext<Card[]>([]);
