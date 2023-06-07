import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
import { useSigner, useNetwork, useBalance, useContract } from "wagmi"
import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import tokenABI from "./assets/MyERC20Token.json";



const tokenAddress = "0x0936Be36ACd102CC7AF17Df760ca390f69891a17";
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const provider = new ethers.providers.AlchemyProvider(
	"maticmum",
	apiKey
)

const tokenContract = new ethers.Contract(tokenAddress,tokenABI.abi, signer)



export default function InstructionsComponent() {
	const router = useRouter();

	const {data: signer, isError, isLoading } = useSigner();

	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<h1>
					mydapp

				</h1>

			</header>

			<div className={styles.buttons_container}>
					<Pageblock/>

			</div>
			<div className={styles.footer}>
				Footer
			</div>
		</div>
	);
}

function Pageblock() {
	return(
		<div>
			<WalletInfo/>
		</div>
	)
}
function WalletInfo() {

	const {data: signer, isError, isLoading } = useSigner();
	const {chain, chains} = useNetwork();

	if (signer) return(
		<divv>
			<p>{signer._address}</p>
			<p>{chain.name}</p>
			<button onClick={() => signMessage(signer, "sign my message")}>Sign</button>
			<WalletBalance/>
			<ApiInfo/>
			<RequestTokens/>


		</divv>
	)
	else if (isLoading )return(
		<div>
			<p>Loading...</p>
		</div>
	)
	else return (
		<>
		<p>Connect account to continue</p>
		</>
	)
}

function WalletBalance() {

	const { data: signer } = useSigner();
	const { data, isError, isLoading } = useBalance({
		address: signer._address,
	  })

	  if (isLoading) return <div>Fetching balance…</div>
	  if (isError) return <div>Error fetching balance</div>
	  return (
		<div>
		  Balance: {data?.formatted} {data?.symbol}
		</div>
	)
}

function signMessage(signer, message) {
	signer.signMessage(message).then(
		(signature) => {console.log(signature)},
		(error) => {console.error(error)})
}

function ApiInfo() {

	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetch('https://random-data-api.com/api/v2/users')
		.then((res) => res.json())
		.then((data) => {
			setData(data);
			setLoading(false);
		});
	}, []);

	if (isLoading) return <p>Loading...</p>;
	if (!data) return <p>No profile data</p>;

	return (
		<div>
		<h1>{data.username}</h1>
		<p>{data.email}</p>
		</div>
	);

}

function RequestTokens() {
	const {data: signer} = useSigner();
	const [txData, setTxData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	if (txData) return (
		<div>
			<p>Transaction Complete!</p>
			<a href={"https://mumbai.polygonscan.com/tx/" + txData.hash} target="_blank">{txData.hash}</a>
			<button onClick={() => delegateTokens }> Delegate</button>
		</div>
	)
	if(isLoading) return <p>Requesting Tokens To Be Minted </p>
	return (
		<div>
			<button onClick={() => requestTokens(signer,"signature", setLoading, setTxData)}>Tokens Please </button>
		</div>
	)
}

function requestTokens(signer, signature, setLoading, setTxData) {
	setLoading(true);
	const requestOptions = {
		method: "Post",
		headers: {"Content-Type" : "application/json"},
		body: JSON.stringify({ address: signer._address, signature: signature })
	};
	fetch("http://localhost:3006/request-tokens", requestOptions)
	.then(response => response.json())
	.then((data) => {
		setTxData(data);
		setLoading(true);
	})
}

function delegateTokens(address) {
	const {data: signer} = useSigner();
	tokenContract.connect(signer).mint()
}

function vote() {

}
