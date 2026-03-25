import { type Context, type Next } from 'hono';
import type { Env } from '../env';

export const auth = (env: Env) => {
	return async (context: Context, next: Next) => {
		const authHeader = context.req.header('Authorization');

		if (!authHeader) {
			return context.json(
				{
					error: {
						code: 'UNAUTHORIZED',
						message: 'Invalid or missing token',
					},
				},
				401,
			);
		}

		if (!authHeader.startsWith('Bearer ')) {
			return context.json(
				{
					error: {
						code: 'UNAUTHORIZED',
						message: 'Invalid or missing token',
					},
				},
				401,
			);
		}

		const token = authHeader.slice(7);

		// Constant-time comparison to prevent timing attacks
		const target = env.AUTH_TOKEN;
		const actual = token;

		if (target.length !== actual.length) {
			return context.json(
				{
					error: {
						code: 'UNAUTHORIZED',
						message: 'Invalid or missing token',
					},
				},
				401,
			);
		}

		// Use timing-safe comparison when available
		try {
			const targetBuffer = Buffer.from(target);
			const actualBuffer = Buffer.from(actual);
			if (!crypto.timingSafeEqual(targetBuffer, actualBuffer)) {
				return context.json(
					{
						error: {
							code: 'UNAUTHORIZED',
							message: 'Invalid or missing token',
						},
					},
					401,
				);
			}
		} catch {
			// Fallback to regular comparison if timingSafeEqual fails
			let result = 0;
			for (let i = 0; i < target.length; i++) {
				result |= target.charCodeAt(i) ^ actual.charCodeAt(i);
			}
			if (result !== 0) {
				return context.json(
					{
						error: {
							code: 'UNAUTHORIZED',
							message: 'Invalid or missing token',
						},
					},
					401,
				);
			}
		}

		await next();
	};
};
