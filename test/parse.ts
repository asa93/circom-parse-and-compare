const { expect } = require("chai")
const { parse } = require("../src/circuit-wrapper.js");

describe("Parse", async () => {
    it("returns 0 if values are equal", async () => {
        /// http response
        const msg = "{likes:311,follow:5}"
        const msgBytes = toBytesArr(msg);

        /// PRIVATE key-value string that we are looking for
        const key = "likes:"
        const value = "xxx" // has to be same length
        /// paddedTarget will be PUBLIC to be able to verify that the computation has been done correctly
        const paddedExpression = padTarget(key, value, msg)
        const expressionBytes = toBytesArr(paddedExpression)

        /// minimum value accepted to pass test. HAS to be <= 2^16 = 65536
        const comparisonValue = 222;
        const paddedValue = padValue(comparisonValue.toString(), paddedExpression)
        const comparisonValueBytes = toBytesArr(paddedValue)

        const output = await parse({ msg: msgBytes, expression: expressionBytes, comparisonValue: comparisonValueBytes })

        console.log("msg", msg, msg.length)
        console.log("paddedExpression", paddedExpression, paddedExpression.length)
        console.log("msgBytes", msgBytes)
        console.log("expressionBytes", expressionBytes)
        console.log("comparisonValue", comparisonValue)
        console.log("paddedValue", paddedValue)
        console.log("comparisonValueBytes", comparisonValueBytes)
        console.log("output.publicSignals", output.publicSignals)

        expect(output.publicSignals[output.publicSignals.length - 1]).to.eq("1")
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

