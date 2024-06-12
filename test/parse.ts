const { expect } = require("chai")
const { parse } = require("../src/circuit-wrapper.js");

describe("Parse", async () => {
    it("returns 0 if values are equal", async () => {
        /// http response
        const msg = "{likes:222,follow:5}"
        const comparisonValue = 222;
        const key = "likes:"
        const value = "xxx" // has to be same length

        const msgBytes = toBytesArr(msg);
        /// PRIVATE key-value string that we are looking for
        /// paddedTarget will be PUBLIC to be able to verify that the computation has been done correctly
        const paddedExpression = padTarget(key, value, msg)
        const expressionBytes = toBytesArr(paddedExpression)

        /// minimum value accepted to pass test. HAS to be <= 2^16 = 65536

        const paddedValue = padValue(comparisonValue.toString(), paddedExpression)
        const comparisonValueBytes = toBytesArr(paddedValue)

        const output = await parse({ msg: msgBytes, expression: expressionBytes, comparisonValue: comparisonValueBytes })


        console.log("msgBytes", msgBytes)
        console.log("comparisonValue", comparisonValue)

        console.log("expressionBytes", expressionBytes)
        console.log("comparisonValueBytes", comparisonValueBytes)
        console.log("output.publicSignals", output.publicSignals)

        console.log("msg_____________", msg, msg.length, "(HIDDEN)")
        console.log("paddedExpression", paddedExpression, paddedExpression.length)
        console.log("paddedValue_____", paddedValue, paddedValue.length)

        expect(output.publicSignals[21]).to.eq("0")
        expect(output.publicSignals[20]).to.eq("6")
    })
    it("returns 1 if parsed value is greater", async () => {
        /// http response
        const msg = "{likes:310,follow:5}"
        const msgBytes = toBytesArr(msg);
        const comparisonValue = 222;

        const key = "likes:"
        const value = "xxx"
        const paddedExpression = padTarget(key, value, msg)
        const expressionBytes = toBytesArr(paddedExpression)

        const paddedValue = padValue(comparisonValue.toString(), paddedExpression)
        const comparisonValueBytes = toBytesArr(paddedValue)

        const output = await parse({ msg: msgBytes, expression: expressionBytes, comparisonValue: comparisonValueBytes })

        expect(output.publicSignals[21]).to.eq("1")
        expect(output.publicSignals[20]).to.eq("6")
    })

    it("returns 2 if parsed value is smaller", async () => {
        const msg = "{likes:189,follow:5}"
        const comparisonValue = 222;

        const key = "likes:"
        const value = "xxx"

        const msgBytes = toBytesArr(msg);
        const paddedExpression = padTarget(key, value, msg)
        const expressionBytes = toBytesArr(paddedExpression)

        const paddedValue = padValue(comparisonValue.toString(), paddedExpression)
        const comparisonValueBytes = toBytesArr(paddedValue)

        const output = await parse({ msg: msgBytes, expression: expressionBytes, comparisonValue: comparisonValueBytes })

        expect(output.publicSignals[21]).to.eq("2")
        expect(output.publicSignals[20]).to.eq("6")
    })

    it("fails if expression is tampered", async () => {
        const msg = "{likes:189,follow:5}"
        const comparisonValue = 222;

        const key = "likes:"
        const value = "xxx"

        const msgBytes = toBytesArr(msg);
        let paddedExpression = padTarget(key, value, msg)

        //🚨 ======== manipulate expression HERE 
        paddedExpression = paddedExpression.replace("likes", "token")
        const expressionBytes = toBytesArr(paddedExpression)

        const paddedValue = padValue(comparisonValue.toString(), paddedExpression)
        const comparisonValueBytes = toBytesArr(paddedValue)

        const output = await parse({ msg: msgBytes, expression: expressionBytes, comparisonValue: comparisonValueBytes })

        console.log("msg_____________", msg, msg.length, "(HIDDEN)")
        console.log("paddedExpression", paddedExpression, paddedExpression.length)
        console.log("paddedValue_____", paddedValue, paddedValue.length)

        // 🚨 we don't even need to check comparion result here
        // expect(output.publicSignals[21]).to.eq("2")


        // number of key characters != key.length since key has been manipulated
        //moreover the manipulation is obvious to observer since the expression is public
        expect(output.publicSignals[20]).to.not.eq("6")
    })

    it("fails if expression is tampered in a more ingenious way", async () => {
        const msg = "{likes:189,token:5}"
        const comparisonValue = 222;

        const key = "likes:"
        const value = "xxx"

        const msgBytes = toBytesArr(msg);

        //🚨 ======== manipulate expression HERE 
        // here the manipulation is not obvious for observers who don't have access to the hidden message
        let manipulatedMsg = msg.replace("likes", "nabot")
        manipulatedMsg = manipulatedMsg.replace("token", "likes")
        let paddedExpression = padTarget(key, value, manipulatedMsg)

        const expressionBytes = toBytesArr(paddedExpression)

        const paddedValue = padValue(comparisonValue.toString(), paddedExpression)
        const comparisonValueBytes = toBytesArr(paddedValue)

        const output = await parse({ msg: msgBytes, expression: expressionBytes, comparisonValue: comparisonValueBytes })

        console.log("msg_____________", msg, msg.length, "(HIDDEN)")
        console.log("paddedExpression", paddedExpression, paddedExpression.length)
        console.log("paddedValue_____", paddedValue, paddedValue.length)


        // number of key characters != key.length since key has been manipulated        
        expect(output.publicSignals[20]).to.not.eq("6")
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

