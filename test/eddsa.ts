const { expect } = require("chai")
const { eddsa } = require("../src/circuit-wrapper.js");
const { toBytesArr } = require("./util")

describe("Eddsa signature", async () => {

    it("should verify signature", async () => {

        const msg = "ahe";
        const msgBytes = toBytesArr(msg)

        const A = [103, 85, 40, 86, 202, 82, 94, 144, 45, 179, 201, 157, 172, 172, 144, 250, 134, 100, 98, 111, 102, 54, 134, 70, 156, 116, 212, 105, 52, 207, 70, 75]
        const R8 = [169, 17, 35, 126, 11, 248, 207, 223, 239, 91, 217, 126, 83, 157, 146, 37, 110, 11, 200, 2, 78, 229, 72, 133, 83, 29, 13, 100, 123, 109, 163, 252]
        const S = [42, 248, 62, 97, 160, 17, 206, 180, 220, 147, 185, 160, 7, 212, 152, 96, 6, 125, 248, 103, 199, 24, 164, 170, 67, 151, 232, 72, 171, 120, 96, 11]

        const output = await eddsa({ msg: msgBytes, A, R8, S })

        console.log("output", output.publicSignals)
    })


})