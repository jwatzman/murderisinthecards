import React from 'react';

import { ClientToServerMessage } from 'murderisinthecards-common/Consts';
import { ConstGameState } from 'murderisinthecards-common/ConstGameState';

export const GameMessagesContext = React.createContext<string[]>([]);
export const GameStateContext = React.createContext<ConstGameState>(undefined!);
export const SecretStateContext = React.createContext<string>(undefined!);
export const SendMessageContext = React.createContext<
	(ty: ClientToServerMessage, m: any) => void
>(undefined!);
