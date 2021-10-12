exports.name = 'Debian Repository'
exports.description = 'Debian repository'

exports.packages = {
	amd64: [
		'https://github.com/jesec/rtorrent/releases/download/v0.9.8-r15/rtorrent-linux-amd64.deb',
		'https://github.com/jesec/flood/releases/download/v4.7.0/flood-linux-x64.deb',
	],
	arm64: [
		'https://github.com/jesec/rtorrent/releases/download/v0.9.8-r15/rtorrent-linux-arm64.deb',
		'https://github.com/jesec/flood/releases/download/v4.7.0/flood-linux-arm64.deb',
	],
}
