// External Dependencies
import Web3 from "web3";
import React, { useEffect, useState } from "react";

// Internal Dependencies
import Navbar from "./Navbar";
import Marketplace from "./../abis/Marketplace.json";
import Main from "./Main";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketplace, setMarketplace] = useState();

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async function loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const _marketplace = web3.eth.Contract(
        Marketplace.abi,
        networkData.address
      );
      setMarketplace(_marketplace);
      const _productCount = await _marketplace.methods.productCount().call();
      setProductCount(_productCount);
      // Load products
      const _products = [];
      for (let i = 1; i <= _productCount; i++) {
        const product = await _marketplace.methods.products(i).call();
        _products.push(product);
      }
      setProducts(_products);
      setLoading(false);
    } else {
      window.alert("Marketplace contract not deployed to detected network.");
    }
  }

  const createProduct = (name, price) => {
    setLoading(true);
    marketplace.methods
      .createProduct(name, Number(price))
      .send({ from: account })
      .on("confirmation", async (confirmation) => {
        loadBlockchainData();
        setProductCount(productCount + 1);
        const product = await marketplace.methods
          .products(productCount + 1)
          .call();
        setProducts([...products, product]);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };

  const purchaseProduct = (id, price) => {
    setLoading(true);
    marketplace.methods
      .purchaseProduct(id)
      .send({ from: account, value: Number(price) })
      .on("confirmation", async (confirmation) => {
        const _prodcuts = products.slice(0, productCount - 2);
        const _product = products[productCount - 1];
        setProducts([..._prodcuts, { ..._product, purchased: true }]);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };
  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex">
            {loading ? (
              <div id="loader" className="text-center">
                <p className="text-center">Loading...</p>
              </div>
            ) : (
              <Main
                products={products}
                createProduct={createProduct}
                purchaseProduct={purchaseProduct}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
