include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template Tlsn () {

   // Declaration of signals.
   signal input plaintext; // Adjust size as needed
   signal input public_hash;

   signal output c;
   signal output check;

 
   // Hash the plaintext
   component hasher = Poseidon(1);
   hasher.inputs[0] <== plaintext;
   // // Compare computed hash with public hash

   component hash_check = IsEqual();
    hash_check.in[0] <== hasher.out;
    hash_check.in[1] <== public_hash;

    check <== hash_check.out;
}

component main = Tlsn();