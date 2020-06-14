import React from 'react';

import { Card, ClientToServerMessage } from 'murderisinthecards-common/Consts';
import { ConstGameState } from 'murderisinthecards-common/ConstGameState';

export type GameMessage = {id: number, message: string};
export const GameMessagesContext = React.createContext<GameMessage[]>([]);
export const GameStateContext = React.createContext<ConstGameState>(undefined!);
export const SendMessageContext = React.createContext<
	(ty: ClientToServerMessage, m: any) => void
>(undefined!);
export const SessionIdContext = React.createContext<string>(undefined!);
export const YourCardsContext = React.createContext<Card[]>([]);
