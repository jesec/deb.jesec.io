import { Packages } from '../../loader!../../repo'

export default (req, res) => {
	const { component } = req.query
	const archMeta = req.query.arch?.split('-')

	let type = null
	let arch = null
	if (archMeta?.length) {
		type = archMeta[0]
		arch = archMeta[1]
	}

	if (component !== 'main' || type !== 'binary' || arch == null || Packages[arch] == null) {
		res.status(404)
		res.end()
		return
	}

	res.end(Packages[arch].data)
}
