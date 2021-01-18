import { sha256Table } from '../../../loader!../../../repo'

export default (req, res) => {
	if (req.method === 'HEAD') {
		res.status(200)
		res.end()
		return
	}

	const query = req.query['sha256.deb']
	const sha256 = query.substr(0, query.length - 4)
	const url = sha256Table[sha256]
	if (!url) {
		res.status(404)
	} else {
		res.setHeader('Location', url)
		res.status(302)
	}
	res.end()
}
