const { expect } = require("chai")
const { parse } = require("../src/circuit-wrapper.js");

describe("Parse", async () => {
    it("works", async () => {


        /// http response
        const msg = "{likes:222,follow:5}"
        const msgBytes = toBytesArr(msg);
        console.log("msg", msg, msg.length)

        /// PRIVATE key-value string that we are looking for
        const key = "likes:"
        const value = "xxx" // has to be same length
        /// paddedTarget will be PUBLIC to be able to verify that the computation has been done correctly
        const paddedTarget = padTarget(key, value, msg)
        console.log("padded msg", paddedTarget, paddedTarget.length)
        const targetBytes = toBytesArr(paddedTarget)
        console.log("msg bytes", msgBytes)
        console.log("targetBytes", targetBytes)

        /// minimum value accepted to pass test. HAS to be <= 2^16 = 65536
        const minTargetValue = 222;
        console.log("minTargetValue", minTargetValue)
        const paddedMinTgtValue = padValue(minTargetValue.toString(), paddedTarget)
        console.log("paddedMinTgtValue", paddedMinTgtValue)
        const minValueBytes = toBytesArr(paddedMinTgtValue)
        console.log("minValueBytes", minValueBytes)

        const output = await parse({ msg: msgBytes, target: targetBytes, minValue: minValueBytes, minTargetValue })
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

function padValue(value: string, msg: string) {

    let padded = ""
    for (let i = 0; i < msg.length; i++) {
        padded += msg[i] !== "*" ? "+" : msg[i]
    }
    return padded.replace("*".repeat(value.length), value)
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

