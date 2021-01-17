module.exports = {
	async rewrites() {
		return [
			{ source: '/Release', destination: '/api/Release' },
			{ source: '/./Release', destination: '/api/Release' },
			{ source: '/./Packages', destination: '/api/Packages' },
			{ source: '/./Packages.gz', destination: '/api/Packages.gz' },
			{ source: '/dists/devel/Release', destination: '/api/Release' },
			{ source: '/dists/devel/main/binary-amd64/Packages', destination: '/api/Packages' },
			{ source: '/dists/devel/main/binary-amd64/Packages.gz', destination: '/api/Packages.gz' },
			{ source: '/Packages', destination: '/api/Packages' },
			{ source: '/Packages.gz', destination: '/api/Packages.gz' },
			{ source: '/./CydiaIcon.png', destination: '/CydiaIcon.png' },
			{ source: '/./api/(.*)', destination: '/api/$1' },
		]
	},
}
