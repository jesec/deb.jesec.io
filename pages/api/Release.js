import crypto from 'crypto'
import { name, description } from '../../loader!../../repo'
import { getPackages } from '../../utils'

export default (req, res) => {
	const expectedPackages = getPackages()

	res.setHeader('Cache-Control', 's-maxage=31536000')
	res.end(`Origin: ${name}
Label: ${name}
Suite: devel
Codename: devel
Date: ${new Date().toUTCString()}
Architectures: amd64
Components: main
Description: ${description}
SHA1:
 ${crypto.createHash('sha1').update(expectedPackages).digest('hex')} ${
		new TextEncoder().encode(expectedPackages).length
	} main/binary-amd64/Packages
SHA256:
 ${crypto.createHash('sha256').update(expectedPackages).digest('hex')} ${
		new TextEncoder().encode(expectedPackages).length
	} main/binary-amd64/Packages
`)
}
