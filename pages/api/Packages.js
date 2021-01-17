import { getPackages } from '../../utils'

export default (req, res) => {
	res.setHeader('Cache-Control', 's-maxage=31536000')
	res.end(getPackages())
}
