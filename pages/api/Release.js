import { name, description } from '../../loader!../../repo'

export default (req, res) => {
	res.setHeader('Cache-Control', 's-maxage=31536000')
	res.end(`Origin: ${name}
Label: ${name}
Suite: devel
Codename: devel
Date: ${new Date().toUTCString()}
Architectures: amd64
Components: main
Description: ${description}
`)
}
