include "../node_modules/circomlib/circuits/comparators.circom";

/// This circuit parses an integer from a string (bytes array) and compares it to another value passed as parameter
/// all values are padded to have the same length in order to facilitates circuit execution
/// they are padded with character '+' = charcode(42) and '*' = charcode(43)
/// RESULT is such that: 
///             - 0 = values are EQUAL
///             - 1 = parsed value is GREATER than target value   
///             - 2 = parsed value is SMALLER than target value  

template ParseAndCompare (msgBytesLen, targetBytesLen ) {

   // SIGNALS =================================
   //INPUTS
   signal private input  msg[msgBytesLen]; /// plaintext 
   signal private input target[msgBytesLen];  /// bytes of key to find | NOTE: TO SWITCH TO PUBLIC to control that the user created the proof correctly
   signal private input minValue[msgBytesLen];  /// bytes of value to find
   
   signal input minTargetValue;

  // OUTPUTS
   signal output acc[msgBytesLen]; /// temporary array for the purpose of calculation.

   signal output key_check;  /// number of key characters found. Has to be equal to key length.
   signal output comparison_result;  /// comparison result : 1 = value is greater than min; 2 = value smaller ; 0 = equal

   //CIRCUIT ============================

   component equals[msgBytesLen]; 
   component equalsV[msgBytesLen];

   component gt[msgBytesLen];
   component gt2[msgBytesLen];

   /// loop through msg bytes to parse the key+value
    for (var i = 0; i < msgBytesLen; i++) {

      equals[i] = IsEqual();
      equals[i].in[0] <== msg[i];
      equals[i].in[1] <== target[i];

      key_check <== equals[i].out + key_check

      //parse digits
      equalsV[i] = IsEqual();
      equalsV[i].in[0] <== target[i];
      // '42' UTF-8 symbol corresponds to the digits of the value from the padded target string
      // msg[i] = plain digit, target[i]='*'=42
      equalsV[i].in[1] <== 42; 

      // compare parsed digits 
      gt[i] = GreaterThan(8);
      gt[i].in[0] <== equalsV[i].out*msg[i] + (1-equalsV[i].out)*43;
      gt[i].in[1] <== minValue[i];

      gt2[i] = LessThan(8);
      gt2[i].in[0] <== equalsV[i].out*msg[i] + (1-equalsV[i].out)*43;
      gt2[i].in[1] <== minValue[i];

      acc[i] <== gt[i].out*1 + gt2[i].out*2

    }
    component gt3[msgBytesLen];
    // fill accumulator
    for (var j=0; j<msgBytesLen; j++){
       
      gt3[j] = IsZero();
      gt3[j].in <== comparison_result;

      comparison_result <== comparison_result + acc[j]* gt3[j].out

    }

}

component main = ParseAndCompare(20, 20);