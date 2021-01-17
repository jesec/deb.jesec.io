import { packages } from '../../loader!../../repo'

export default (req, res) => {
	const result = []
	for (const name in packages) {
		const versions = packages[name]
		for (const version in versions) {
			const p = versions[version] // package is a reserved variable name
			const strings = []
			for (const entry in p.meta) {
				strings.push(`${entry}: ${p.meta[entry]}`)
			}

			result.push(strings.join('\n'))
		}
	}

	res.setHeader('Cache-Control', 's-maxage=31536000')
	res.end(result.join('\n\n'))
}
