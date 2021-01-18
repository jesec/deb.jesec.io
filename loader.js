const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const stream = require('stream')

const ar = require('ar')
const axios = require('axios')
const gunzipMaybe = require('gunzip-maybe')
const tar = require('tar-stream')

// Create node_modules/.cache folder
const cacheFolder = path.join(__dirname, 'node_modules', '.cache')
if (!fs.existsSync(cacheFolder)) {
	fs.mkdirSync(cacheFolder)
}

// Load node_modules/.cache/urlsLoader.json
const cacheVersion = 2
const cacheFile = path.join(__dirname, 'node_modules', '.cache', 'urlsLoader.json')
function getCacheFileContents() {
	const emptyCache = {
		version: cacheVersion,
		cache: {},
	}

	if (fs.existsSync(cacheFile)) {
		try {
			const cacheFileContents = require(cacheFile)
			if (cacheFileContents.version !== cacheVersion) return emptyCache
			if (typeof cacheFileContents.cache !== 'object') return emptyCache

			return cacheFileContents
		} catch (error) {
			return emptyCache
		}
	} else {
		return emptyCache
	}
}
const cache = getCacheFileContents().cache
let lastWrittenCache = JSON.stringify(cache)

function extractControlTarGunzipMaybe(data) {
	return new Promise((resolve, reject) => {
		const readableStream = new stream.Readable({
			read() {
				this.push(data)
				this.push(null)
			},
		})

		const extract = tar.extract()

		extract.on('entry', function (header, stream, next) {
			if (header.name === './control') {
				const data = []
				stream.on('data', (chunk) => {
					data.push(chunk)
				})
				stream.on('end', function () {
					resolve(Buffer.concat(data).toString())
				})
				stream.resume()
			} else {
				next()
			}
		})

		extract.on('finish', function () {
			reject(new Error('control file missing'))
		})

		readableStream.pipe(gunzipMaybe()).pipe(extract)
	})
}

function convertControlToObject(control) {
	const controlRegExp = /^([A-Za-z-]+): (.*)$/gm
	const meta = {}

	let result
	while ((result = controlRegExp.exec(control))) {
		meta[result[1]] = result[2]
	}

	delete meta.Icon
	return meta
}

function getPackages(packages) {
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

async function getMetaForURL(url) {
	const { data } = await axios.get(url, { responseType: 'arraybuffer' })

	const archive = new ar.Archive(data)

	const meta = {}

	for (const file of archive.getFiles()) {
		const fileName = file.name()
		if (fileName.startsWith('control.tar')) {
			Object.assign(meta, convertControlToObject(await extractControlTarGunzipMaybe(file.fileData())))
		} else if (fileName.startsWith('data.tar') || fileName === 'debian-binary') {
			// Skip
		} else {
			console.warn('File', fileName, 'not supported; skipping')
		}
	}

	// Calculate Size [size of package]
	meta.Filename = ''
	meta.Size = data.length

	// Calculate MD5sum of package
	meta.MD5sum = crypto.createHash('md5').update(data).digest('hex')

	// Calculate SHA1 of package
	meta.SHA1 = crypto.createHash('sha1').update(data).digest('hex')

	// Calculate SHA256 of package
	meta.SHA256 = crypto.createHash('sha256').update(data).digest('hex')

	meta.Filename = `api/deb/${meta.SHA256}.deb`

	return meta
}

module.exports = async function () {
	const repo = require(this.resourcePath)

	const packages = await Promise.all(
		repo.packages.map(async (url) => {
			const meta = cache[url] || (cache[url] = await getMetaForURL(url))
			return { meta, url }
		}),
	)

	const currentCacheSerialized = JSON.stringify({ version: cacheVersion, cache })
	if (lastWrittenCache !== currentCacheSerialized) {
		fs.writeFileSync(cacheFile, currentCacheSerialized)
		lastWrittenCache = currentCacheSerialized
	}

	const restructuredPackages = {}
	const sha256Table = {}

	for (const p of packages) {
		// package is a reserved variable name
		if (!restructuredPackages[p.meta.Name]) restructuredPackages[p.meta.Name] = {}
		restructuredPackages[p.meta.Name][p.meta.Version] = p
		sha256Table[p.meta.SHA256] = p.url
	}

	const PackagesData = getPackages(restructuredPackages)

	const Packages = {
		data: PackagesData,
		length: new TextEncoder().encode(PackagesData).length,
		md5: crypto.createHash('md5').update(PackagesData).digest('hex'),
		sha1: crypto.createHash('sha1').update(PackagesData).digest('hex'),
		sha256: crypto.createHash('sha256').update(PackagesData).digest('hex'),
	}

	const Release = `Origin: ${repo.name}
Label: ${repo.name}
Suite: devel
Codename: devel
Date: ${new Date().toUTCString()}
Architectures: amd64
Components: main
Description: ${repo.description}
MD5Sum:
 ${Packages.md5} ${Packages.length} main/binary-amd64/Packages
SHA1:
 ${Packages.sha1} ${Packages.length} main/binary-amd64/Packages
SHA256:
 ${Packages.sha256} ${Packages.length} main/binary-amd64/Packages`

	return `export const Packages = ${JSON.stringify(Packages)};
export const Release = ${JSON.stringify(Release)};
export const sha256Table = ${JSON.stringify(sha256Table)};
export const name = ${JSON.stringify(repo.name)};
export const description = ${JSON.stringify(repo.description)};`
}
