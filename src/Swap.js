import React, { useState } from "react";
import dexABI from "./contract.json";
import { ethers, parseEther } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const dexContractAddress = "0xeC56bC8Fa6AEd2CD45395cAbaF45Cc3162B65bD2";

const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
        try {
            console.log("Connected to provider", provider);

            const signer = await provider.getSigner();
            console.log("signer", signer);
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);

            // Check the current network
            const network = await provider.getNetwork();
            console.log("Current network:", network);

            const crossfiChainId = 4157n; // CrossFi Testnet Chain ID (not a regular number, use 'n' for BigInt)

            if (network.chainId !== crossfiChainId) {
                alert("You are not connected to the CrossFi Testnet. Please switch your network to CrossFi Testnet.");
                return; // Stop execution if on the wrong network
            }

            console.log("dexContract", dexContract);

            const name = await dexContract.name();
            console.log("name", name);

            const totalSupply = await dexContract.totalSupply();
            console.log("swap", totalSupply.toString());

            const tokenIn = ethers.parseEther("0.1");
            console.log("tokenIn", tokenIn);

            const requiredEthForLiquidity = await dexContract.calculateRequiredEthForLiquidity(tokenIn);

            // Execute the transaction
            const tx = await dexContract.swapEthToToken({
                value: tokenIn, // Sending ETH along with the function call
            });

            console.log("Transaction submitted:", tx);

            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log("Transaction mined:", receipt);

            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
};


const handleLiquidityClick = () => {
    alert("Redirecting to Liquidity page...");
    window.location.href = "./add-liquidity"
};

const Swap = () => {
    const [topToken, setTopToken] = useState("XFI");
    const [bottomToken, setBottomToken] = useState("DXFI");
    const [inputValue, setInputValue] = useState("");
    const [calculatedValue, setCalculatedValue] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const handleInputChange = async (e) => {
        const value = (e.target.value).toString();
        setInputValue(value);

        if (topToken === "XFI") {
            // Call calculateEthToToken if topToken is XFI
            const calculated = await calculateEthToToken(value);
            setCalculatedValue(calculated);
        } else if (topToken === "DXFI") {
            // Call calculateTokenToEth if topToken is DXFI
            const calculated = await calculateTokenToEth(value);
            setCalculatedValue(calculated);
        }
    };

    const handleSwapClick = () => {
        setTopToken(bottomToken);
        setBottomToken(topToken);
        setInputValue(""); // Reset input value after swap
        setCalculatedValue(""); // Reset calculated value after swap
    };

    const handleSwap = async () => {
        setIsLoading(true); // Show loading indicator

        try {
            if (topToken === "XFI") {
                // Swap ETH to Token (XFI)
                await swapEthToToken(inputValue);
            } else if (topToken === "DXFI") {
                // Swap Token to ETH (DXFI)
                await swapTokenToEth(inputValue);
            }
        } catch (error) {
            console.error("Error during swap:", error);
        } finally {
            setIsLoading(false); // Hide loading indicator once transaction is done
        }
    };

    // Function to call calculateEthToToken
    const calculateEthToToken = async (ethAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, provider);
            const ethInput = parseEther(ethAmount);
            const result = await dexContract.calculateEthToToken(ethInput);
            return ethers.formatUnits(result, 18); // Assuming the result is in 18 decimals
        } catch (error) {
            console.error("Error calling calculateEthToToken:", error);
        }
    };

    // Function to call calculateTokenToEth
    const calculateTokenToEth = async (tokenAmount) => {
        try {
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, provider);
            const tokenInput = parseEther(tokenAmount);
            const result = await dexContract.calculateTokenToEth(tokenInput);
            return ethers.formatUnits(result, 18); // Assuming the result is in 18 decimals
        } catch (error) {
            console.error("Error calling calculateTokenToEth:", error);
        }
    };

    // Function to swap ETH to Token (XFI)
    const swapEthToToken = async (ethAmount) => {
        try {
            const signer = await provider.getSigner();
            console.log("signer", signer);
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);
            const ethInput = parseEther(ethAmount);
            const tx = await dexContract.swapEthToToken({
                value: ethInput, // Sending ETH to the contract
            });
            console.log("Swap ETH to Token submitted:", tx);
            await tx.wait(); // Wait for the transaction to be mined
            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error swapping ETH to Token:", error);
        }
    };

    // Function to swap Token to ETH (DXFI)
    const swapTokenToEth = async (tokenAmount) => {
        try {
            const signer = await provider.getSigner();
            console.log("signer", signer);
            const dexContract = new ethers.Contract(dexContractAddress, dexABI, signer);
            const tokenInput = parseEther(tokenAmount);

            const tx = await dexContract.swapTokenToEth(tokenInput); // Sending tokens to the contract
            console.log("Swap Token to ETH submitted:", tx);
            await tx.wait(); // Wait for the transaction to be mined
            alert(`Swap successful! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error swapping Token to ETH:", error);
        }
    };

    return (
        <div style={styles.container}>
            <button onClick={handleLiquidityClick} style={styles.liquidityButton}>
                ⚙️ Liquidity
            </button>
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
                        <div style={styles.spinner}></div> // Show spinner when loading
                    ) : (
                        `Swap ${topToken} to ${bottomToken}`
                    )}
                </button>

                {isLoading && (
                    <div style={styles.loadingText}>Processing your transaction...</div>
                )}
            </div>
        </div>
    );
};

const styles = {

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
