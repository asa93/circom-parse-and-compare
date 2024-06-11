const { expect } = require("chai")
const { hello } = require("../src/circuit-wrapper.js");

describe("hello", async () => {
    it("works", async () => {

        101
        99

        /// http response
        const msg = "{likes:25,follows:5}"
        const msgBytes = toBytesArr(msg);
        console.log("msg", msg, msg.length)

        /// PRIVATE key-value string that we are looking for
        const key = "likes:"
        const value = "25"
        /// paddedTarget will be PUBLIC to be able to verify that the computation has been done correctly
        const padded = padTarget(key, value, msg)
        console.log("padded msg", padded, padded.length)
        const targetBytes = toBytesArr(padded)
        console.log("msg bytes", msgBytes)
        console.log("targetBytes", targetBytes)

        /// minimum value accepted to pass test. HAS to be <= 2^16 = 65536
        const minTargetValue = 24;
        console.log("minTargetValue", minTargetValue)

        const output = await hello({ msg: msgBytes, target: targetBytes, minTargetValue })
        console.log("output.publicSignals", output.publicSignals)
        expect(output.publicSignals[output.publicSignals.length - 2]).to.eq("1")
    })
})

export { }

/// pad target value to have same length as the plaintext
/// 
function padTarget(target: string, value: string, msg: string): string {
    const i = msg.indexOf(target)
    let out = ""
    for (let j = 0; j < msg.length; j++) {
        if (j < i || j > i + target.length + value.length - 1) out += '+'
        else if (j > i + target.length - 1) out += "*"
        else out += msg[j]
    }
    return out;
}

/// convert string to array of strying representing bytes
/// snarkjs only accepts big number in string
function toBytesArr(str: string): string[] {
    const byteArray = Buffer.from(str, 'utf-8');
    let bytesArrayStr: string[] = []
    byteArray.forEach(byte => {
        bytesArrayStr.push(byte.toString())
    });

    return bytesArrayStr

}

