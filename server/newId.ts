import { randomBytes } from 'node:crypto';

export function newId() {
	return randomBytes(15).toString('base64url');
}
