import { useRef } from 'react'

import { name as repoName } from '../loader!../repo'
import Page from '../components/Page'
import { getRepoUrl } from '../utils'

export default function Home({ repoURL }) {
	const inputRef = useRef()
	return (
		<Page>
			<style jsx>{`
				h1 {
					text-align: center;
					margin-bottom: 100px;
				}

				h2 {
					text-align: center;
					margin-bottom: 100px;
				}

				.input-container {
					width: 320px;
					max-width: 90%;
					position: relative;
					margin: 32px auto;
				}

				.input-container > input {
					border: 0 none;
					padding: 0 68px 0 12px;
					font-size: 18px;
					height: 50px;
					width: 100%;
					border-radius: 12px;
					flex-grow: 1;
					background-color: #333333;
					color: #ffffff;
				}

				.input-container > button {
					font-size: 16px;
					position: absolute;
					height: 30px;
					right: 10px;
					top: 10px;
					padding: 6px 8px;
					border-radius: 6px;
					background-color: #1e90ff;
					color: #ffffff;
					border: 0 none;
					line-height: 16px;
				}
			`}</style>

			<h1>{repoName}</h1>

			<h2>
				<a href={`${repoURL}Packages`}>Available Packages</a>
			</h2>

			<div className="input-container">
				<input
					value={repoURL}
					readOnly
					ref={inputRef}
					onClick={() => {
						inputRef.current.select()
						inputRef.current.setSelectionRange(0, repoURL.length)
					}}
				/>
				<button
					onClick={() => {
						if (navigator.clipboard && navigator.clipboard.writeText) {
							navigator.clipboard.writeText(repoURL)
						} else {
							inputRef.current.select()
							inputRef.current.setSelectionRange(0, repoURL.length)
							document.execCommand('copy')
						}
					}}
				>
					Copy
				</button>
			</div>
		</Page>
	)
}

Home.getInitialProps = ({ req }) => ({
	repoURL: getRepoUrl(req),
})
