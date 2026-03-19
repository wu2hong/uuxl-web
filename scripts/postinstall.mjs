import fs from 'node:fs'
import path from 'node:path'

// uni-app-x 构建时，vite-plugin-uni 会把内置模块解析到：
// node_modules/@dcloudio/uni-app/dist-x/uni-app.es.js
//
// 但部分 uni-app 包版本只提供 dist/uni-app.es.js，不提供 dist-x/。
// 为了让 XBuilder/Vite 能通过解析，这里做一个兜底：缺 dist-x 时复制 dist/。

const pkgDir = path.resolve('node_modules', '@dcloudio', 'uni-app')
const srcFile = path.join(pkgDir, 'dist', 'uni-app.es.js')
const destDir = path.join(pkgDir, 'dist-x')
const destFile = path.join(destDir, 'uni-app.es.js')

try {
	if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
		fs.mkdirSync(destDir, { recursive: true })
		fs.copyFileSync(srcFile, destFile)
		// eslint-disable-next-line no-console
		console.log('[postinstall] created missing uni-app dist-x entry')
	}
} catch (e) {
	// eslint-disable-next-line no-console
	console.warn('[postinstall] uni-app dist-x fix failed:', e)
}

