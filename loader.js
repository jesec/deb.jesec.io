const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const stream = require('stream')
const { unzipSync } = require('fflate')

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
const cache = process.env.NODE_ENV === 'development' ? getCacheFileContents().cache : {}
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

async function getMetaForURL(url) {
	const { data: response } = await axios.get(url, { responseType: 'arraybuffer' })

	let data = response
	if (url.endsWith('.zip')) {
		const unzipped = unzipSync(new Uint8Array(response))
		const debFile = Object.keys(unzipped).filter((filename) => filename.endsWith('.deb'))[0]
		data = Buffer.from(unzipped[debFile])
	}

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

const sha256Table = {}

async function getRestructuredPackages(urls) {
	const packages = await Promise.all(
		urls.map(async (url) => {
			const meta = cache[url] || (cache[url] = await getMetaForURL(url))
			const finalUrl = url.endsWith('.zip') ? `https://decompressor.jesec.workers.dev/?decompress=${url}` : url
			return { meta, url: finalUrl }
		}),
	)

	const currentCacheSerialized = JSON.stringify({ version: cacheVersion, cache })
	if (lastWrittenCache !== currentCacheSerialized) {
		fs.writeFileSync(cacheFile, currentCacheSerialized)
		lastWrittenCache = currentCacheSerialized
	}

	const restructuredPackages = {}

	for (const p of packages) {
		// package is a reserved variable name
		if (!restructuredPackages[p.meta.Name]) restructuredPackages[p.meta.Name] = {}
		restructuredPackages[p.meta.Name][p.meta.Version] = p
		sha256Table[p.meta.SHA256] = p.url
	}

	return restructuredPackages
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

module.exports = async function () {
	const repo = require(this.resourcePath)

	const PackagesData = {
		amd64: getPackages(await getRestructuredPackages(repo.packages.amd64)),
		arm64: getPackages(await getRestructuredPackages(repo.packages.arm64)),
	}

	const Packages = {
		amd64: {
			data: PackagesData.amd64,
			length: new TextEncoder().encode(PackagesData.amd64).length,
			md5: crypto.createHash('md5').update(PackagesData.amd64).digest('hex'),
			sha1: crypto.createHash('sha1').update(PackagesData.amd64).digest('hex'),
			sha256: crypto.createHash('sha256').update(PackagesData.amd64).digest('hex'),
		},
		arm64: {
			data: PackagesData.arm64,
			length: new TextEncoder().encode(PackagesData.arm64).length,
			md5: crypto.createHash('md5').update(PackagesData.arm64).digest('hex'),
			sha1: crypto.createHash('sha1').update(PackagesData.arm64).digest('hex'),
			sha256: crypto.createHash('sha256').update(PackagesData.arm64).digest('hex'),
		},
	}

	const Release = `Origin: ${repo.name}
Label: ${repo.name}
Suite: devel
Codename: devel
Date: ${new Date().toUTCString()}
Architectures: amd64 arm64
Components: main
Description: ${repo.description}
MD5Sum:
 ${Packages.amd64.md5} ${Packages.amd64.length} main/binary-amd64/Packages
 ${Packages.arm64.md5} ${Packages.arm64.length} main/binary-arm64/Packages
SHA1:
 ${Packages.amd64.sha1} ${Packages.amd64.length} main/binary-amd64/Packages
 ${Packages.arm64.sha1} ${Packages.arm64.length} main/binary-arm64/Packages
SHA256:
 ${Packages.amd64.sha256} ${Packages.amd64.length} main/binary-amd64/Packages
 ${Packages.arm64.sha256} ${Packages.arm64.length} main/binary-arm64/Packages`

	return `export const Packages = ${JSON.stringify(Packages)};
export const Release = ${JSON.stringify(Release)};
export const sha256Table = ${JSON.stringify(sha256Table)};
export const name = ${JSON.stringify(repo.name)};
export const description = ${JSON.stringify(repo.description)};`
}
