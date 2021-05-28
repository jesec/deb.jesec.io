exports.name = 'Debian Repository'
exports.description = 'Debian repository'

exports.packages = {
	amd64: [
		'https://nightly.link/jesec/rtorrent/actions/runs/878467218/rtorrent-deb-amd64.zip',
		'https://github.com/jesec/flood/releases/download/v4.6.0/flood-linux-x64.deb',
	],
	arm64: [
		'https://nightly.link/jesec/rtorrent/actions/runs/878467218/rtorrent-deb-arm64.zip',
		'https://github.com/jesec/flood/releases/download/v4.6.0/flood-linux-arm64.deb',
	],
}
