export default class SsrComponents {
	modules: Set<string>;

	constructor() {
		this.modules = new Set();
	}

	/**
	 * Add a component to the context
	 *
	 * @param context
	 */
	addToContext(ctx: Map<string, any>) {
		ctx.set('modules', this.modules);
	}

	/**
	 * Returns preload for js and link stylesheet for css
	 */
	toHead(ssrManifest: Record<string, string[]>) {
		const requirements = new Set<string>();
		for (const mod of this.modules) {
			const deps = ssrManifest[mod] ?? [];
			deps.forEach(dep => requirements.add(dep));
		}

		let head = '';
		for (const req of requirements) {
			if (req.endsWith('.js')) {
				head += `\n\t\t<link rel="preload" href="${req}" as="script" crossOrigin="anonymous">`;
			} else if (req.endsWith('.css')) {
				head += `\n\t\t<link rel="stylesheet" href="${req}">`;
			}
		}

		return head;
	}
}

// todo need to replace this
// relative should be the function from ``
/*
import { relative } from 'path';
usedSsrComponents(f => relative(__dirname, f))
*/
export function usedSsrComponents(relativeFn: (f: string) => string): any {
	return {
		transform(code: any, id: any, options: any) {
			if (!options?.ssr || !id.endsWith('.svelte')) return;

			const file = relativeFn(id);

			const initFnSign =
				'create_ssr_component(($$result, $$props, $$bindings, slots) => {';

			let idx = code.indexOf(initFnSign);
			if (idx < 0) return;
			idx += initFnSign.length;

			code = `
import { getContext as __modulesGetContext } from 'svelte';
${code.substr(0, idx)}
(() => {
const ctx = __modulesGetContext('modules');
if (ctx && ctx instanceof Set) {
	ctx.add('${file.replaceAll('\\', '\\\\')}');
}
})();
${code.substr(idx)}
`;

			return code;
		},
	};
}
