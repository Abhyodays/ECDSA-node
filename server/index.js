const express = require("express");
const app = express();
const cors = require("cors");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03f2371614071865f9aee8b0e29c6e401f964dd775c0104c2eb25e400ee02b5213": 100,
  "02cbf7ee5f2f6f5fb7b525c67963cffee6f364d17347552f4d0d36bea6770dd331": 50,
  "026c2b13987d880fe4fd14db8fd72c32c3cd8fe7e4d55bfc1db2cb9addce332977": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, message, recovery } = req.body;
  // hash received message
  const { amount, recipient } = message;
  const bytes = utf8ToBytes(JSON.stringify(message));
  const hash = keccak256(bytes);
  // get public key
  const sig = secp256k1.Signature.fromCompact(signature);
  sig.recovery = recovery;
  const sender = sig.recoverPublicKey(hash).toHex();
  setInitialBalance(sender);
  setInitialBalance(recipient);


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
