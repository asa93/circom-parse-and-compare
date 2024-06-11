include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

include "./quinselector.circom";

template ParseAndCompare (msgBytesLen, targetBytesLen ) {

   // SIGNALS =================================
   signal private input  msg[msgBytesLen]; /// plaintext
   signal private input target[msgBytesLen];  /// bytes to find
   signal input minTargetValue;

   signal output msg_check;  /// number of characters found
   signal output msg_checks[msgBytesLen]; 
   signal output value_checks[msgBytesLen];

   signal output minus[msgBytesLen];
   signal output acc;

   signal output parsedValue;
   signal output result;

   //CIRCUIT ============================

   component equals[msgBytesLen]; 
   component equalsV[msgBytesLen];

   /// loop through msg bytes
   var numBitsEqual=0;
    for (var i = 0; i < msgBytesLen; i++) {

      equals[i] = IsEqual();
      equals[i].in[0] <== msg[i];
      equals[i].in[1] <== target[i];

      msg_check <== equals[i].out + msg_check
      msg_checks[i] <== equals[i].out;  

      equalsV[i] = IsEqual();
      equalsV[i].in[0] <== target[i];
      equalsV[i].in[1] <== 42;
      value_checks[i] <== equalsV[i].out*(msg[i] - 48) ; 

    }

 
   component gt2[msgBytesLen];
   component iz[msgBytesLen] = IsZero();

   //component gt3[msgBytesLen];
 
    for (var j=0; j<msgBytesLen; j++){
      gt2[j] = GreaterThan(8);
      gt2[j].in[0] <== value_checks[j];
      gt2[j].in[1] <== 0;
      
      iz[j].in <== parsedValue;
      minus[j] <== minus[j] + iz[j].out*gt2[j].out ;

      parsedValue <== parsedValue + gt2[j].out*(parsedValue*10 + value_checks[j]) ;

    }

    for (var k=0; k<msgBytesLen; k++){
      acc <== acc + minus[k]*value_checks[k]
    }
    parsedValue <== parsedValue - acc;
   //  for (var k=0; k<msgBytesLen; k++){
   //          iz[k].in <== value_checks[k-1];

   //          gt3[k] = GreaterThan(8);
   //          gt3[k].in[0] <== value_checks[k];
   //          gt3[k].in[1] <== 0;

   //          parsedValue <== parsedValue - iz[k].out*gt3[k].out ;
   //  }

    component gt  = GreaterEqThan(16);
      gt.in[0] <==  parsedValue;
      gt.in[1] <== minTargetValue ;
      result <== gt.out; 

      //parsedValue <== 33

}

component main = ParseAndCompare(20, 20);