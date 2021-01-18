import { Packages } from '../../loader!../../repo'

export default (req, res) => {
	res.setHeader('Cache-Control', 's-maxage=3600')
	res.end(Packages.data)
}
