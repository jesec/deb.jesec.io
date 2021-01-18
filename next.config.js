module.exports = {
	async rewrites() {
		return [
			{ source: '/Release', destination: '/api/Release' },
			{ source: '/Packages', destination: '/api/Packages?component=main&arch=binary-amd64' },
			{ source: '/./Release', destination: '/api/Release' },
			{ source: '/./Packages', destination: '/api/Packages?component=main&arch=binary-amd64' },
			{ source: '/dists/devel/Release', destination: '/api/Release' },
			{ source: '/dists/devel/:component/:arch/Packages', destination: '/api/Packages' },
			{ source: '/./api/(.*)', destination: '/api/$1' },
		]
	},
}
