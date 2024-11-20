# AquaDex - Decentralized Exchange on Crossifi Testnet

AquaDex is a cutting-edge **Automated Market Maker (AMM)** protocol designed and deployed on the **Crossifi Testnet** blockchain. AquaDex aims to provide a seamless and decentralized platform for adding liquidity to a pool containing the **XFI** (native token) and **DXFI** (derived token) pair, as well as enabling users to easily swap between these two tokens. AquaDex empowers liquidity providers (LPs) by rewarding them with a share of the platform’s transaction fees in exchange for their liquidity, ensuring a dynamic and efficient DeFi ecosystem.

## 🌟 Table of Contents
- [AquaDex - Decentralized Exchange on Crossifi Testnet](#aquadex---decentralized-exchange-on-crossifi-testnet)
  - [🌟 Table of Contents](#-table-of-contents)
  - [🌐 Overview](#-overview)
    - [Core Features:](#core-features)
  - [💡 Features](#-features)
  - [🚀 Getting Started](#-getting-started)
    - [🛠️ Prerequisites](#️-prerequisites)
    - [📦 Installation](#-installation)
    - [🏃 Running the Project](#-running-the-project)
  - [📜 Smart Contracts](#-smart-contracts)
    - [➕ Liquidity Add Function](#-liquidity-add-function)
    - [➖ Liquidity Remove Function](#-liquidity-remove-function)
  - [📁 Project Structure](#-project-structure)
    - [Key Files:](#key-files)
  - [📃 License](#-license)
  - [🤝 Contributing](#-contributing)
    - [How to Contribute:](#how-to-contribute)
    - [Acknowledgments:](#acknowledgments)

---

## 🌐 Overview

**AquaDex** is a fully decentralized exchange protocol that utilizes an **Automated Market Maker (AMM)** to allow token swaps and liquidity provision. It is designed for users to interact with **XFI** (the native token) and **DXFI** (a derivative token) on the **Crossifi Testnet** blockchain. AquaDex enables users to add liquidity to a pool, swap tokens, and remove liquidity—all in a trustless, permissionless, and secure environment.

By providing liquidity to the **XFI/DXFI** pool, users contribute to the overall health of the decentralized exchange while earning rewards. AquaDex offers a fast, efficient, and cost-effective way for users to engage with DeFi applications on the Crossifi Testnet.

### Core Features:
- **Add Liquidity**: Users can add liquidity to the pool by depositing **XFI** and **DXFI** tokens in equal amounts. Liquidity providers receive LP tokens as proof of their contribution.
- **Remove Liquidity**: Users can withdraw their liquidity and receive back a proportional share of **XFI** and **DXFI** tokens.
- **Token Swap**: Users can perform token swaps between **XFI** and **DXFI** tokens at market prices set by the liquidity pool.
- **Crossifi Testnet Compatibility**: AquaDex is deployed on the **Crossifi Testnet**, enabling users to interact with the platform without spending real funds.

---

## 💡 Features

- **💧 Add Liquidity to the Pool**: Liquidity providers can deposit equal amounts of **XFI** and **DXFI** tokens, adding liquidity to the platform. In return, they receive LP tokens representing their share of the pool.
- **❌ Remove Liquidity**: Liquidity providers can withdraw their liquidity and get a proportional share of **XFI** and **DXFI** tokens based on their share in the pool.
- **🔄 Token Swap**: Swap between **XFI** and **DXFI** tokens with instant execution. The price is automatically set based on the liquidity pool.
- **⚙️ Crossifi Testnet Integration**: AquaDex works seamlessly with the **Crossifi Testnet**, allowing users to test and interact with the protocol before moving to the mainnet.

---

## 🚀 Getting Started

To get started with **AquaDex**, follow the steps below to set up the development environment, install dependencies, and interact with the protocol.

### 🛠️ Prerequisites

Before you begin, make sure you have the following tools installed:

1. **Node.js**: [Download and Install Node.js](https://nodejs.org/) (Recommended version: LTS).
2. **Metamask**: [Install Metamask](https://metamask.io/) - this wallet will interact with the Ethereum-compatible blockchain, including the Crossifi Testnet.
3. **Crossifi Testnet Configuration**: Add the **Crossifi Testnet** network to your Metamask wallet. Use the provided RPC and chain ID for the testnet.

### 📦 Installation

To set up AquaDex locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/GillHapp/Aquadex
   cd aquadex
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

### 🏃 Running the Project

To run the AquaDex project locally:

1. Ensure that your Metamask wallet is connected to the **Crossifi Testnet**.
2. Start the development server:

   ```bash
   npm start
   ```

3. Open your browser and visit `http://localhost:3000` to interact with the AquaDex platform.

---

## 📜 Smart Contracts

The AquaDex decentralized exchange relies on two main smart contract functions: **addLiquidity** and **removeLiquidity**. These smart contracts manage the liquidity pool and facilitate token swaps, ensuring a trustless, transparent, and decentralized environment.

### ➕ Liquidity Add Function

The **addLiquidity** function allows users to deposit **XFI** and **DXFI** tokens into the liquidity pool. Liquidity providers receive LP tokens as a representation of their share in the pool.

```solidity
function addLiquidity(uint256 _dxfiAmount) external payable returns (bool) {
    require(_dxfiAmount > 0, "Amount should be greater than zero");
    uint256 _ethAmount = calculateRequiredEthForLiquidity(_dxfiAmount);
    require(msg.value >= _ethAmount, "Insufficient ETH provided for liquidity");
    
    // Add liquidity logic
    liquidityPool[_msgSender()] += _dxfiAmount;
    totalSupply += _dxfiAmount;
    return true;
}
```

### ➖ Liquidity Remove Function

The **removeLiquidity** function enables liquidity providers to withdraw their liquidity from the pool. Upon withdrawal, the user will receive the proportional amount of **XFI** and **DXFI** tokens.

```solidity
function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
    require(_amount > 0, "Amount should be greater than zero");

    uint256 _reservedEth = address(this).balance;
    uint256 _totalSupply = totalSupply();
    uint256 _ethAmount = (_reservedEth * _amount) / _totalSupply;
    uint256 _tokenAmount = (getTokensInContract() * _amount) / _totalSupply;

    _burn(msg.sender, _amount);
    payable(msg.sender).transfer(_ethAmount);
    ERC20(token).transfer(msg.sender, _tokenAmount);

    return (_ethAmount, _tokenAmount);
}
```

---

## 📁 Project Structure

AquaDex is built with **ReactJS** for the frontend and **Ethers.js** for blockchain interactions. Here is an overview of the project structure:

```
/aquadex
|-- /src
|   |-- /components
|   |   |-- AddLiquidity.js  (UI for adding liquidity)
|   |   |-- RemoveLiquidity.js (UI for removing liquidity)
|   |   |-- LiquidityManager.js (Main liquidity management logic)
|   |-- /utils
|   |   |-- contract.js (Smart contract interaction functions)
|   |-- App.js (Main app entry point)
|   |-- index.js (React entry point)
|-- /public
|   |-- index.html
|-- /node_modules
|-- package.json
|-- package-lock.json
|-- .gitignore
```

### Key Files:
- **AddLiquidity.js**: Contains the UI and logic for adding liquidity to the pool.
- **RemoveLiquidity.js**: Contains the UI and logic for removing liquidity from the pool.
- **LiquidityManager.js**: A component that handles toggling between add and remove liquidity functions.
- **contract.js**: Contains all smart contract interaction logic using **Ethers.js**.

---

## 📃 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## 🤝 Contributing

We welcome contributions to AquaDex! If you'd like to improve the project, feel free to fork the repository, make your changes, and submit a pull request.

### How to Contribute:
1. **Fork the repository**.
2. **Clone your fork**:

   ```bash
   git clone https://github.com/GillHapp/Aquadex
   ```

3. **Create a new branch**:

   ```bash
   git checkout -b feature-branch
   ```

4. **Make your changes** and commit:

   ```bash
   git commit -m 'Add new feature'
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature-branch
   ```

6. **Submit a pull request**.

---

### Acknowledgments:
- **Crossifi Testnet**: This project is built on the **Crossifi Testnet** blockchain, providing a robust testing environment for AquaDex.
- **Metamask**: For secure interaction with Ethereum-based networks.
- **Ethers.js**: To interact with the Ethereum blockchain in a seamless and efficient manner.

---

**Thank you for using AquaDex!** We hope this decentralized exchange platform enhances your experience in decentralized finance (DeFi) on the **Crossifi Testnet**.