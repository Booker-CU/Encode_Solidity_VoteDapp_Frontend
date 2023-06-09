import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
import { useSigner, useNetwork, useBalance, useContract } from "wagmi"
import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import tokenABI from "./assets/MyERC20Votes.json";
import tokenizedBallotABI from "./assets/TokenizedBallot.json"



const tokenAddress = "0x0936Be36ACd102CC7AF17Df760ca390f69891a17";
const tokenizedBallotAddress = "0xfbFa68808D69E306d4AAF8F8647EfDA45F815C7F";

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const provider = new ethers.providers.AlchemyProvider(
	"maticmum",
	apiKey
)

const tokenContract = new ethers.Contract(tokenAddress,tokenABI.abi,provider);
const tokenizedBallot = new ethers.Contract(tokenizedBallotAddress,tokenizedBallotABI.abi, provider)



export default function InstructionsComponent() {
	const router = useRouter();



	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<h1>
					VotingDapp

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
		<div className={styles.container}>
			<WalletInfo/>
		</div>
	)
}

function WalletInfo() {

	const {data: signer, isError, isLoading } = useSigner();
	const {chain, chains} = useNetwork();

	if (signer) return(
		<div className={styles.buttons_container}>
			{/* <p>{signer._address}</p>
			<p>{chain.name}</p> */}
			{/* <button onClick={() => signMessage(signer, "sign my message")}>Sign</button> */}
			{/* <WalletBalance/> */}
			<RequestTokens/>
			<DelegateTokens/>
			<Vote/>
			

		</div>
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
		<div >
			<p>Transaction Complete!</p>
			<div className={styles.button_textTx_wrap}>
			<a  href={"https://mumbai.polygonscan.com/tx/" + txData.hash} target="_blank">{txData.hash}</a>
			</div>
		</div>
	)

	if(isLoading) return <p>Requesting Tokens To Be Minted </p>
	return (
		<div>
			<button className={styles.button} onClick={() => requestTokens(signer,"signature", setLoading, setTxData)}>Tokens Please </button>
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
	fetch("http://localhost:3003/request-tokens", requestOptions)
	.then(response => response.json())
	.then((data) => {
		setTxData(data);
		setLoading(true);
	})
}

function DelegateTokens() {
	const {data: signer} = useSigner();

	return (
		<div>
			<p><button className={styles.button} onClick={() => tokenContract.connect(signer).delegate(signer._address) }> Delegate</button></p>
		</div>
	)
}

function Vote() {
	const {data: signer} = useSigner();

	return (
		<div >
			<button className={styles.button} onClick={() => tokenizedBallot.connect(signer).vote(0,ethers.utils.parseUnits("1")) }> Vote Proposal 1 </button>
			<button className={styles.button} onClick={() => tokenizedBallot.connect(signer).vote(1,ethers.utils.parseUnits("1")) }> Vote Proposal 2 </button>
			<button className={styles.button} onClick={() => tokenizedBallot.connect(signer).vote(2,ethers.utils.parseUnits("1")) }> Vote Proposal 3 </button>
		</div>
	)
}







