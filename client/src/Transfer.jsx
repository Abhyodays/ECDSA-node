import { useState } from "react";
import server from "./server";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    // hash message
    const message = {
      amount: parseInt(sendAmount),
      recipient,
    }
    const bytes = utf8ToBytes(JSON.stringify(message));
    const hash = keccak256(bytes)
    // generate signature
    const signature = secp256k1.sign(hash,privateKey);
    const signatureHex = signature.toCompactHex()
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature:signatureHex,
        message,
        recovery:signature.recovery
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient Public Key
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
