include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

include "./quinselector.circom";

template ParseAndCompare (msgBytesLen, targetBytesLen ) {

   // SIGNALS =================================
   signal private input  msg[msgBytesLen]; /// plaintext
   signal private input target[msgBytesLen];  /// bytes to find
   signal input minTargetValue;

   signal output msg_checks[msgBytesLen]; 
   signal output value_checks[msgBytesLen];

   signal output minus[msgBytesLen];
   signal output acc;

   signal output parsedValue;
   signal output msg_check;  /// number of characters found
   signal output result; 

   //CIRCUIT ============================

   component equals[msgBytesLen]; 
   component equalsV[msgBytesLen];

   /// loop through msg bytes to parse the key+value
    for (var i = 0; i < msgBytesLen; i++) {

      equals[i] = IsEqual();
      equals[i].in[0] <== msg[i];
      equals[i].in[1] <== target[i];

      msg_check <== equals[i].out + msg_check
      msg_checks[i] <== equals[i].out;  

      equalsV[i] = IsEqual();
      equalsV[i].in[0] <== target[i];

      /// '42' UTF-8 symbol corresponds to the digits of the value from the padded target string
      /// the padded string is publi
      equalsV[i].in[1] <== 42; 
      value_checks[i] <== equalsV[i].out*(msg[i] - 48) ; 

    }

  
  /// calculate the value by summing all digits
   component gt2[msgBytesLen];
   component iz[msgBytesLen] = IsZero();
    for (var j=0; j<msgBytesLen; j++){
      gt2[j] = GreaterThan(8);
      gt2[j].in[0] <== value_checks[j];
      gt2[j].in[1] <== 0;
      
      iz[j].in <== parsedValue;
      parsedValue <== parsedValue + gt2[j].out*(parsedValue*10 + value_checks[j]) ;
      minus[j] <== minus[j] + iz[j].out*gt2[j].out ; /// will be useful in the next loop
    }

    /// adjust parsed value by substracting the first extra number accounted during the first loop
    for (var k=0; k<msgBytesLen; k++){
      acc <== acc + minus[k]*value_checks[k];

      /// we clean that output signals that are useless now 
      value_checks[k] <== 0; 
      minus[k] <== 0;


    }
    parsedValue <== parsedValue - acc;

    component gt  = GreaterEqThan(16);
      gt.in[0] <==  parsedValue;
      gt.in[1] <== minTargetValue ;
      result <== gt.out; 

      /// clean transitory signal arrays that are useless now and might reveal information
      parsedValue <== 0
      acc <== 0

}

component main = ParseAndCompare(20, 20);