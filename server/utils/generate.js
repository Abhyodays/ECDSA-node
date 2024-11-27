const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils')

const privateKey = toHex(secp256k1.utils.randomPrivateKey());
const publicKey = toHex(secp256k1.getPublicKey(privateKey))
console.log("private key:", privateKey)
console.log("public key:", publicKey)
