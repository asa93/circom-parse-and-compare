const snarkjs = require("snarkjs")
const math = require("./math.js")

export const parse = (inputObj: any) => snarkjs.groth16.fullProve(inputObj, "./build/parse.main.wasm", "./build/parse.main.zkey")

export const eddsa = (inputObj: any) => snarkjs.groth16.fullProve(inputObj, "./build/eddsa.main.wasm", "./build/eddsa.main.zkey")
