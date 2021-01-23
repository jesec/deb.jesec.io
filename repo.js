exports.name = 'Debian Repository'
exports.description = 'Debian repository'

exports.packages = {
	amd64: [
		'https://nightly.link/jesec/rtorrent/workflows/publish-rolling/master/rtorrent-deb-amd64.zip',
	],
	arm64: [
		'https://nightly.link/jesec/rtorrent/workflows/publish-rolling/master/rtorrent-deb-arm64.zip',
	],
}
