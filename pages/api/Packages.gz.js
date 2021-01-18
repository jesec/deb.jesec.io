import { gzipSync } from 'zlib'

import Packages from './Packages'

export default (req, res) => {
	const fakeRes = {
		setHeader() {},
		end(end) {
			this.end = end
		},
	}
	Packages(req, fakeRes)
	res.setHeader('Cache-Control', 's-maxage=3600')
	res.end(gzipSync(Buffer.from(fakeRes.end)))
}
