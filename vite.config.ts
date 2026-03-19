import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import uniPlugin from '@dcloudio/vite-plugin-uni'

// 关键：不要用 process.cwd()，在 XBuilder 内部运行时 cwd 可能不是项目目录
// 这里固定使用 vite.config.ts 所在目录作为项目根目录
const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const inputDir = projectRoot
process.env.UNI_INPUT_DIR = process.env.UNI_INPUT_DIR || inputDir

export default defineConfig({
	resolve: {
		alias: [
			// 只劫持裸导入 `vue`，不影响 `vue/dist/*`
			{ find: /^vue$/, replacement: path.resolve(projectRoot, 'src/shims/vue.ts') },
		],
	},
	plugins: [
		{
			name: 'suppress-hideLoading-cancel',
			enforce: 'pre',
			transformIndexHtml(html) {
				const script = `
<script>
(() => {
  const noise = (x) => {
    const s = String(x?.message ?? x?.reason?.message ?? x?.errMsg ?? x ?? '');
    return s.includes('hideLoading:fail cancel') || s.includes('$triggerParentHide');
  };
  window.addEventListener('error', (e) => {
    if (noise(e?.error ?? e?.message)) {
      e.preventDefault?.();
      e.stopImmediatePropagation?.();
      return;
    }
  }, true);
  const prevOnError = window.onerror;
  window.onerror = (msg, src, line, col, err) => {
    if (noise(err ?? msg)) return true;
    return prevOnError ? prevOnError(msg, src, line, col, err) : false;
  };
  window.addEventListener('unhandledrejection', (e) => {
    if (noise(e?.reason)) e.preventDefault?.();
  });
  const raw = console.error;
  console.error = (...args) => {
    if (args.some((a) => noise(a))) return;
    raw(...args);
  };
})();
</script>`
				return html.replace('</head>', `${script}\n</head>`)
			},
		},
		// 兼容不同发布形态（CJS/ESM）的默认导出
		((uniPlugin as any).default ?? uniPlugin)(),
	],
})

