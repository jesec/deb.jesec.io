exports.name = 'Debian Repository'
exports.description = 'Debian repository'

exports.packages = {
	amd64: [
		'https://nightly.link/jesec/rtorrent/workflows/publish-rolling/master/rtorrent-deb-amd64.zip',
		'https://github.com/jesec/flood/releases/latest/download/flood-linux-x64.deb',
	],
	arm64: [
		'https://nightly.link/jesec/rtorrent/workflows/publish-rolling/master/rtorrent-deb-arm64.zip',
		'https://github.com/jesec/flood/releases/latest/download/flood-linux-arm64.deb',
	],
}
