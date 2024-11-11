import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { remarkReadingTime } from './src/utils/readTime.ts'
import fs from 'fs'
import path from 'path'

// https://astro.build/config
export default defineConfig({
	site: 'https://portblog-five.vercel.app/', // Your site URL
	markdown: {
		remarkPlugins: [remarkReadingTime],
		drafts: true,
		shikiConfig: {
			theme: 'material-theme-palenight',
			wrap: true
		}
	},
	integrations: [
		mdx({
			syntaxHighlight: 'shiki',
			shikiConfig: {
				experimentalThemes: {
					light: 'vitesse-light',
					dark: 'material-theme-palenight',
				},
				wrap: true
			},
			drafts: true
		}),
		sitemap(),
		tailwind()
	],
	build: {
		// Copy the images during the build process
		prerender: {
			async afterBuild() {
				const srcPath = path.resolve('./src/assets/images/')
				const destPath = path.resolve('./public/assets/images/')

				// Ensure the destination folder exists
				if (!fs.existsSync(destPath)) {
					fs.mkdirSync(destPath, { recursive: true })
				}

				// Recursively copy images and subdirectories
				const copyDirectory = (source, target) => {
					const files = fs.readdirSync(source)
					files.forEach((file) => {
						const currentPath = path.join(source, file)
						const targetPath = path.join(target, file)
						if (fs.lstatSync(currentPath).isDirectory()) {
							if (!fs.existsSync(targetPath)) {
								fs.mkdirSync(targetPath, { recursive: true })
							}
							copyDirectory(currentPath, targetPath) // Recursive copy
						} else {
							fs.copyFileSync(currentPath, targetPath) // Copy file
						}
					})
				}

				// Start copying from src/assets/images to public/assets/images
				copyDirectory(srcPath, destPath)
			}
		},
		// Image path rewrite logic to adjust during the build
		transform: {
			async transformHtml(html) {
				// Replace all /src/assets/images/ paths with /assets/images/ for image references
				return html.replace(/\/src\/assets\/images\//g, '/assets/images/');
			}
		}
	}
})
