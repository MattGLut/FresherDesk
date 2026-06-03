import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'

export function tailwindPlugin({ rootDir, config, fs, path, logger }) {
    const clientDir = path.join(rootDir, config.clientDir)
    const inputPath = path.join(clientDir, 'app.css')
    const outputPath = path.join(clientDir, 'app.tailwind.css')

    async function compile() {
        const input = fs.readFileSync(inputPath, 'utf8')
        const result = await postcss([tailwindcss()]).process(input, { from: inputPath, to: outputPath })
        fs.writeFileSync(outputPath, result.css)
        logger.info('Generated Tailwind CSS')
    }

    return {
        name: 'tailwind',
        buildStart: compile,
    }
}
