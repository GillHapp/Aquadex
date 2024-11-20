import React, { useState } from "react";
import { ethers, parseEther } from "ethers";
import dexABI from "./contract.json";

const provider = new ethers.BrowserProvider(window.ethereum);
const liquidityContractAddress = "0xeC56bC8Fa6AEd2CD45395cAbaF45Cc3162B65bD2"; // Replace with your actual contract address

const LiquidityManager = () => {
    const [activeTab, setActiveTab] = useState("add"); // Tracks active tab: "add" or "remove"
    const [amount, setAmount] = useState(""); // User's input for DXFI token (Add Liquidity)
    const [removeAmount, setRemoveAmount] = useState(""); // User's input for removing liquidity
    const [requiredXFI, setRequiredXFI] = useState(""); // Calculated required XFI (ETH) for liquidity
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [removedLiquidity, setRemovedLiquidity] = useState(null); // Store ETH and token amounts returned from removeLiquidity

    const calculateRequiredXFIForLiquidity = async (amount) => {
        try {
            const signer = await provider.getSigner();
            const liquidityContract = new ethers.Contract(
                liquidityContractAddress,
                dexABI,
                signer
            );

            const amountInWei = parseEther(amount); // Convert DXFI amount to Wei
            const requiredXFIWei = await liquidityContract.calculateRequiredEthForLiquidity(amountInWei); // Call the smart contract method

            return ethers.formatUnits(requiredXFIWei, 18); // Convert Wei to XFI (ETH)
        } catch (error) {
            console.error("Error calculating required XFI:", error);
            return "";
        }
    };

    const handleAmountChange = async (e) => {
        const value = e.target.value;
        setAmount(value);

        if (value) {
            const calculatedXFI = await calculateRequiredXFIForLiquidity(value);
            setRequiredXFI(calculatedXFI);
        } else {
            setRequiredXFI(""); // Clear the XFI value if the input is empty
        }
    };

    const handleAddLiquidity = async () => {
        setIsLoading(true);

        try {
            const signer = await provider.getSigner();
            const liquidityContract = new ethers.Contract(
                liquidityContractAddress,
                dexABI,
                signer
            );

            const amountInWei = parseEther(amount);
            const requiredXFIWei = parseEther(requiredXFI);

            const tx = await liquidityContract.addLiquidity(amountInWei, {
                value: requiredXFIWei,
            });
            console.log("Liquidity Add Transaction submitted:", tx);

            const receipt = await tx.wait();
            console.log("Transaction mined:", receipt);

            alert(`Liquidity added successfully! Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error("Error adding liquidity:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveLiquidity = async () => {
        setIsLoading(true);

        try {
            const signer = await provider.getSigner();
            const liquidityContract = new ethers.Contract(
                liquidityContractAddress,
                dexABI,
                signer
            );

            const removeAmountInWei = parseEther(removeAmount);

            const tx = await liquidityContract.removeLiquidity(removeAmountInWei);
            console.log("Remove Liquidity Transaction submitted:", tx);

            const receipt = await tx.wait();
            console.log("Transaction mined:", receipt);

            const [ethAmount, tokenAmount] = receipt.logs[0].args;
            setRemovedLiquidity({
                eth: ethers.formatUnits(ethAmount, 18),
                tokens: ethers.formatUnits(tokenAmount, 18),
            });

            alert(`Liquidity removed successfully!`);
        } catch (error) {
            console.error("Error removing liquidity:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Liquidity Manager</h2>
            <div style={styles.buttonGroup}>
                <button
                    style={{
                        ...styles.tabButton,
                        backgroundColor: activeTab === "add" ? "black" : "#ccc",
                        color: activeTab === "add" ? "white" : "black",
                    }}
                    onClick={() => setActiveTab("add")}
                >
                    Add Liquidity
                </button>
                <button
                    style={{
                        ...styles.tabButton,
                        backgroundColor: activeTab === "remove" ? "black" : "#ccc",
                        color: activeTab === "remove" ? "white" : "black",
                    }}
                    onClick={() => setActiveTab("remove")}
                >
                    Remove Liquidity
                </button>
            </div>
            {activeTab === "add" && (
                <div style={styles.swapBox}>
                    {/* <h3>Add Liquidity</h3> */}
                    <div style={styles.tokenGroup}>
                        <label style={styles.label}>DXFI Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            style={styles.input}
                            placeholder="Enter DXFI amount"
                        />
                    </div>
                    <div style={styles.tokenGroup}>
                        <label style={styles.label}>Required XFI</label>
                        <input
                            type="text"
                            value={requiredXFI}
                            readOnly
                            style={styles.input}
                            placeholder="Calculated XFI amount"
                        />
                    </div>
                    <button onClick={handleAddLiquidity} style={styles.actionButton}>
                        {isLoading ? "Processing..." : "Add Liquidity"}
                    </button>
                </div>
            )}
            {activeTab === "remove" && (
                <div style={styles.swapBox}>
                    {/* <h3>Remove Liquidity</h3> */}
                    <div style={styles.tokenGroup}>
                        <label style={styles.label}>Liquidity Amount</label>
                        <input
                            type="number"
                            value={removeAmount}
                            onChange={(e) => setRemoveAmount(e.target.value)}
                            style={styles.input}
                            placeholder="Enter amount to remove"
                        />
                    </div>
                    <button onClick={handleRemoveLiquidity} style={styles.actionButton}>
                        {isLoading ? "Processing..." : "Remove Liquidity"}
                    </button>
                    {removedLiquidity && (
                        <div style={styles.result}>
                            <p>Returned ETH: {removedLiquidity.eth}</p>
                            <p>Returned Tokens: {removedLiquidity.tokens}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        marginTop: "110px",
        padding: "2rem",
        background:
            "linear-gradient(135deg, rgba(18, 194, 233, 0.9), rgba(196, 113, 237, 0.9), rgba(247, 121, 125, 0.9))",
        borderRadius: "15px",
        maxWidth: "400px",
        margin: "2rem auto",
        color: "#ffffff",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    },
    title: {
        textAlign: "center",
        fontSize: "1.8rem",
        marginBottom: "1.5rem",
        fontWeight: "bold",
        color: "black",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
    },
    tabButton: {
        padding: "0.75rem",
        fontSize: "1rem",
        fontWeight: "bold",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        flex: 1,
        margin: "0 0.5rem",
    },
    swapBox: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    input: {
        padding: "0.8rem",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        background: "rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
        fontSize: "1rem",
        outline: "none",
    },
    actionButton: {
        padding: "0.75rem",
        backgroundColor: "black",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "1.1rem",
        fontWeight: "bold",
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
    result: {
        marginTop: "1rem",
        padding: "1rem",
        background: "rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
    },
};

export default LiquidityManager;
