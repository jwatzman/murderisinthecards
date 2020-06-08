import React from 'react';

import { ClientToServerMessage } from 'murderisinthecards-common/Consts';

import { GameState } from './GameState';

export const GameStateContext = React.createContext<GameState>(undefined!);
export const SendMessageContext = React.createContext<
	(ty: ClientToServerMessage, m: any) => void
>(undefined!);
