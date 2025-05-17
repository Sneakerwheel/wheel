import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * `cn()` function merges the tailwind classes in a predictable way
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
