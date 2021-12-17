import React, {useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
import Modal from 'react-modal';
import WaveModal from './WaveModal.jsx';


export default function App() {
/*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveCount, setWaveCount] = useState('');
  const [waveModal, setWaveModal] = useState(false);
  const [sendingWave, setSendingWave] = useState(false);
  const [allWaves, setAllWaves] = useState([]); 
  const contractAddress = '0x9aaF334e2474019Fd733773Ff3Ee914F100880D1';
  const contractABI = abi.abi;
  


  let waveSent;

const checkIfWalletIsConnected = async () => {
  try{
  /*
  * First make sure we have access to window.ethereum
  */
  const { ethereum } = window;
  

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    
      //  Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = new ethers.VoidSigner(contractAddress, provider);
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log('getting waves');
      const count = await wavePortalContract.getTotalWaves();
      console.log(`count is ${count}`);
      setWaveCount(count);
    }catch(error){
      console.log('issue getting waves', error);
    }
  }

    const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        return wavesCleaned;
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  /**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log('NewWave', from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  

  if (window.ethereum) { 
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on('NewWave', onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off('NewWave', onNewWave);
    }
  };
}, []);

useEffect(() => {
  console.log(allWaves.length);
  setWaveCount(allWaves.length);
}, [allWaves])

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    console.log('checking waves');
    getTotalWaves();
  }, [])

  const wave = async (message) => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * Execute the actual wave from your smart contract
        */
        
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 })
        setSendingWave(true);
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        // setWaveCount(waves.length);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally{
      setSendingWave(false);
    }
  }

  const handleSendMessage = (message) => {
    setWaveModal(false);
    wave(message);
  };
  
  return (
    
    <div className="mainContainer">
      <header className='info'>{waveCount ? `${waveCount} waved` : 'membering'}</header>
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        My name is Justin and I like to party. Connect your Ethereum wallet and wave at me!
        </div>
        <Modal 
          isOpen={waveModal}
          onRequestClose={() => setWaveModal(false)}
          className="Modal"
          overlayClassName="Overlay"
        >
        <WaveModal
          onSubmit={(message)=> {handleSendMessage(message)}}
          onClose={()=> {setWaveModal(false)}}
        />
  
        </Modal>
        <button className="waveButton" onClick={() => setWaveModal(true)}>
          Wave at Me
        </button>
       {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div class="loadingContainer">
      {sendingWave ? //not sure why ?? isn't working
        <div class="loading">
          <div class="loadingContent">
            <div class="loadingText">
            Sending Wave
            </div>
          </div>
        </div>
       : <div/> 
       //might add success notification here
       } 
       </div>
        {allWaves.map((wave, index) => {
          return (
            <div key={index} class="waveCards">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
