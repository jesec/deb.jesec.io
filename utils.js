import { packages } from './loader!./repo'

export const getPackages = () => {
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
	return result.join('\n\n')
}

export const getRepoUrl = (req) => {
	if (req) {
		return `${
			req.headers['x-forwarded-proto']
				? req.headers['x-forwarded-proto']
				: process.env.NODE_ENV === 'production'
				? 'https'
				: 'http'
		}://${req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host}/`
	}

	return `${window.location.protocol}//${window.locations.host}/`
}
