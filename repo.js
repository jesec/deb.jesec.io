exports.name = 'Debian Repository'
exports.description = 'Debian repository'

exports.packages = {
	amd64: [
		'https://nightly.link/jesec/rtorrent/actions/runs/616318506/rtorrent-deb-amd64.zip',
		'https://github.com/jesec/flood/releases/download/v4.4.1/flood-linux-x64.deb',
	],
	arm64: [
		'https://nightly.link/jesec/rtorrent/actions/runs/616318506/rtorrent-deb-arm64.zip',
		'https://github.com/jesec/flood/releases/download/v4.4.1/flood-linux-arm64.deb',
	],
}
