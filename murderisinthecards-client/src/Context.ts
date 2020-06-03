import React from 'react';

import { ClientToServerMessage } from './Consts';
import { GameState } from './GameState';

export const GameStateContext = React.createContext<GameState | null>(null);
export const SendMessageContext = React.createContext<
	(ty: ClientToServerMessage, m: string) => void
>(undefined!);
