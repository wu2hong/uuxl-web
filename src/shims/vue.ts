// 仅用于 uni-app-x H5 开发期的兼容 shim：
// 某些 uni-app-x 运行时代码会从 `vue` 裸导入内部符号（如 injectHook / isInSSRComponentSetup），
// 但 Vue 正式包不对外导出这些符号，会导致运行时报错白屏。
//
// 这里对外补齐缺失导出，同时把 Vue 的正常导出透传出去。

import * as VueRuntime from 'vue/dist/vue.runtime.esm-bundler.js'

export * from 'vue/dist/vue.runtime.esm-bundler.js'

// Vue 运行时默认导出（兼容少数场景）
export default (VueRuntime as any).default ?? VueRuntime

// uni-app/uni-h5 兼容：部分入口会使用 createVueApp
export function createVueApp(...args: any[]) {
	const fn =
		(VueRuntime as any).createSSRApp ??
		(VueRuntime as any).createApp
	if (typeof fn === 'function') return fn(...args)
}

// uni-app-x 运行时在 H5 侧会尝试导入该值，实际仅用于 SSR 分支判断
export const isInSSRComponentSetup = false

// 最小 injectHook 实现：把 hook 挂到目标实例对应的生命周期数组上
// 这里用 any 规避不同 Vue 内部实例结构差异
export function injectHook(type: any, hook: any, target?: any, prepend?: boolean) {
	const inst = target ?? (VueRuntime as any).getCurrentInstance?.()
	if (!inst) return
	const hooks = inst[type] || (inst[type] = [])
	if (Array.isArray(hooks)) {
		prepend ? hooks.unshift(hook) : hooks.push(hook)
	}
}

// uni-h5 在部分构建形态下会从 `vue` 导入该函数用于统一错误输出
export function logError(err: any, context?: any) {
	const msg =
		String(err?.message ?? '') ||
		String(err?.errMsg ?? '') ||
		String(err ?? '')
	// 过滤 uni-h5 常见的非致命噪音日志，避免污染控制台
	if (msg.includes('hideLoading:fail cancel')) return
	if (msg.includes('$triggerParentHide')) return
	// eslint-disable-next-line no-console
	console.error('[uni-h5]', err, context ?? '')
}

// uni-h5 兼容：部分运行时代码会使用该 API（Vue 本体无此导出）
// 为避免触发 h5 侧父子页面生命周期副作用，这里保持安全空实现
export function onBeforeActivate(hook: any, target?: any) {
	return
}

// uni-h5 兼容：同上，保持空实现
export function onBeforeDeactivate(hook: any, target?: any) {
	return
}

