import React, { useState, useEffect } from "react";
import Liquidity from "./Liquidity"; // Import your Liquidity component
import dexABI from "./contract.json";
import { ethers, parseEther } from "ethers";

const tokenContractAddress = "0xc094c8843Ef7329C4ba6De95afF792e650ce74A0";
const dexContractAddress = "0xeC56bC8Fa6AEd2CD45395cAbaF45Cc3162B65bD2";

const Swap = () => {
    const [topToken, setTopToken] = useState("XFI");
    const [bottomToken, setBottomToken] = useState("DXFI");
    const [inputValue, setInputValue] = useState("");
    const [calculatedValue, setCalculatedValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showLiquidity, setShowLiquidity] = useState(false);
    const [signer, setSigner] = useState(null); // State to store the signer
    const [provider, setProvider] = useState(null); // State to store the provider

    useEffect(() => {
        // Initialize provider and check if wallet is already connected
        const initializeProvider = async () => {
            if (window.ethereum) {
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(newProvider);
            } else {
                alert("Please install a wallet like MetaMask to use this DEX.");
            }
        };
        initializeProvider();
    }, []);

    const connectWallet = async () => {
        try {
            if (!provider) return alert("Wallet provider not found.");
            const accounts = await provider.send("eth_requestAccounts", []);
            const walletSigner = await provider.getSigner();
            setSigner(walletSigner);
            console.log("Wallet connected:", accounts[0]);
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value.toString();
        setInputValue(value);

        if (topToken === "XFI") {
            const calculated = await calculateEthToToken(value);
            setCalculatedValue(calculated);
        } else if (topToken === "DXFI") {
            const calculated = await calculateTokenToEth(value);
            setCalculatedValue(calculated);
        }
    };

    const handleSwapClick = () => {
        setTopToken(bottomToken);
        setBottomToken(topToken);
        setInputValue("");
        setCalculatedValue("");
    };

    const handleSwap = async () => {
        if (!signer) {
            await connectWallet();
        }

        if (!signer) return alert("Wallet connection required to proceed.");

        setIsLoading(true);
        try {
            if (topToken === "XFI") {
                await swapEthToToken(inputValue);
            } else if (topToken === "DXFI") {
                await swapTokenToEth(inputValue);
            }
        } catch (error) {
            console.error("Error during swap:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateEthToToken = async (ethAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, provider);
            const ethInput = parseEther(ethAmount);
            const result = await dexContract.calculateEthToToken(ethInput);
            return ethers.formatUnits(result, 18);
        } catch (error) {
            console.error("Error calling calculateEthToToken:", error);
        }
    };

    const calculateTokenToEth = async (tokenAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, provider);
            const tokenInput = parseEther(tokenAmount);
            const result = await dexContract.calculateTokenToEth(tokenInput);
            return ethers.formatUnits(result, 18);
        } catch (error) {
            console.error("Error calling calculateTokenToEth:", error);
        }
    };

    const swapEthToToken = async (ethAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);
            const ethInput = parseEther(ethAmount);
            const tx = await dexContract.swapEthToToken({
                value: ethInput,
            });
            console.log("Swap ETH to Token submitted:", tx);
            await tx.wait();
            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error swapping ETH to Token:", error);
        }
    };

    const swapTokenToEth = async (tokenAmount) => {
        try {
            const tokenContract = new ethers.Contract(tokenContractAddress, dexABI, signer);
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);
            const tokenInput = parseEther(tokenAmount);

            // Check allowance first
            const allowance = await tokenContract.allowance(await signer.getAddress(), dexContractAddress);
            if (allowance < tokenInput) {
                const approveTx = await tokenContract.approve(dexContractAddress, tokenInput);
                console.log("Approval submitted:", approveTx);
                await approveTx.wait(); // Wait for approval to be mined
                console.log("Approval granted!");
            }

            // Estimate gas for the swap function
            const gasEstimate = await dexContract.estimateGas.swapTokenToEth(tokenInput);
            console.log("Estimated Gas:", gasEstimate.toString());

            // Proceed with the swap and send gas estimation
            const tx = await dexContract.swapTokenToEth(tokenInput, {
                value: gasEstimate, // Set the gas limit
            });

            console.log("Swap Token to ETH submitted:", tx);
            await tx.wait(); // Wait for the transaction to be mined
            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error swapping Token to ETH:", error);
            alert(`Error: ${error.message}`); // Display the error to the user
        }
    };


    return (
        <div style={styles.wrapper}>
            <div style={styles.infoBanner}>
                In order to interact with the DEX you need to be on CrossFi Testnet
            </div>

            <div style={styles.container}>
                <button
                    onClick={() => setShowLiquidity(!showLiquidity)}
                    style={styles.liquidityButton}
                >
                    ⚙️ Liquidity
                </button>

                {showLiquidity ? (
                    <Liquidity />
                ) : (
                    <>
                        <h2 style={styles.title}>Swap</h2>
                        <div style={styles.swapBox}>
                            <div style={styles.tokenGroup}>
                                <label style={styles.label}>{topToken}</label>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder={`Enter ${topToken} amount`}
                                />
                            </div>

                            <button onClick={handleSwapClick} style={styles.swapButton}>
                                ⇅
                            </button>

                            <div style={styles.tokenGroup}>
                                <label style={styles.label}>{bottomToken}</label>
                                <input
                                    type="text"
                                    value={calculatedValue}
                                    readOnly
                                    style={styles.input}
                                    placeholder={`Calculated ${bottomToken} amount`}
                                />
                            </div>

                            <button onClick={handleSwap} style={styles.actionButton}>
                                {isLoading ? (
                                    <div style={styles.spinner}></div>
                                ) : (
                                    `Swap ${topToken} to ${bottomToken}`
                                )}
                            </button>

                            {isLoading && (
                                <div style={styles.loadingText}>Processing your transaction...</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};




const styles = {
    wrapper: {
        position: "relative",
    },
    infoBanner: {
        backgroundColor: "#f0a500",
        padding: "0.5rem 0.5rem",
        textAlign: "center",
        fontSize: "0.5rem",
        fontWeight: "bold",
        color: "linear-gradient(135deg, rgba(18, 194, 233, 0.9), rgba(196, 113, 237, 0.9), rgba(247, 121, 125, 0.9))",
        borderRadius: "5px 5px 0 0",
        marginTop: "2rem",
        marginBottom: "1rem",
        marginLeft: "30rem",
        marginRight: "30rem",
    },
    container: {
        marginTop: "120px",
        padding: "2rem",
        background:
            "linear-gradient(135deg, rgba(18, 194, 233, 0.9), rgba(196, 113, 237, 0.9), rgba(247, 121, 125, 0.9))",
        borderRadius: "15px",
        maxWidth: "400px",
        margin: "2rem auto",
        color: "#ffffff",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        position: "relative",
    },
    liquidityButton: {
        position: "absolute",
        top: "10px",
        left: "10px", // Positioning it on the top-left corner
        padding: "0.6rem 1rem",
        backgroundColor: "black", // Set background to black
        color: "white", // White text to match the Swap component
        fontWeight: "bold",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.9rem",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.2s, box-shadow 0.2s",
    },
    link: {
        color: "white",
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "16px",
    },
    swapBox: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        position: "relative",
    },
    input: {
        padding: "0.8rem",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        background: "rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
        fontSize: "1rem",
        outline: "none",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
    },
    title: {
        textAlign: "center",
        fontSize: "1.8rem",
        marginBottom: "1.5rem",
        fontWeight: "bold",
        color: "black",
    },
    swapButton: {
        padding: "0.5rem",
        backgroundColor: "black",
        color: "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        alignSelf: "center",
        width: "3rem",
        height: "3rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.5rem",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    tokenGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    label: {
        fontWeight: "bold",
        fontSize: "1.1rem",
        color: "black",
    },
    actionButton: {
        marginTop: "0.5rem",
        padding: "0.75rem",
        backgroundColor: "black",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "1.1rem",
        textAlign: "center",
        fontWeight: "bold",
    },
    spinner: {
        border: "4px solid rgba(255, 255, 255, 0.3)",
        borderTop: "4px solid #ffffff",
        borderRadius: "50%",
        width: "24px",
        height: "24px",
        animation: "spin 1s linear infinite",
    },
    loadingText: {
        textAlign: "center",
        fontSize: "1rem",
        marginTop: "1rem",
        color: "white",
    },
};

export default Swap;
