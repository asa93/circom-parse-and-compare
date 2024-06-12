include "../node_modules/circomlib/circuits/comparators.circom";

/// This circuit parses an integer from a string (bytes array) and compares it to another value passed as parameter
/// all values are padded to have the same length in order to facilitates circuit execution
/// they are padded with character '+' = charcode(42) and '*' = charcode(43)
/// COMPARISON_RESULT is such that: 
///             - 0 = values are EQUAL
///             - 1 = parsed value is GREATER than comparison value   
///             - 2 = parsed value is SMALLER than comparison value  

template ParseAndCompare (msgBytesLen ) {

   // SIGNALS =================================
   //INPUTS
   signal private input  msg[msgBytesLen]; /// plaintext 
   signal input expression[msgBytesLen];  /// bytes of key to find | NOTE: TO SWITCH TO PUBLIC to control that the user created the proof correctly
   signal input comparisonValue[msgBytesLen];  /// bytes of value to find, padded.
   

  // OUTPUTS
   signal acc[msgBytesLen]; /// intermediate signal for the purpose of calculation.

   signal output key_check;  /// number of key characters found. Has to be equal to key length.
   signal output comparison_result;  /// comparison result : 1 = value is greater than min; 2 = value smaller ; 0 = equal

   //CIRCUIT ============================

   component equals[msgBytesLen]; 
   component equalsV[msgBytesLen];

   component gt[msgBytesLen];
   component gt2[msgBytesLen];
   component gt3[msgBytesLen];


    for (var i = 0; i < msgBytesLen; i++) {

      equals[i] = IsEqual();
      equals[i].in[0] <== msg[i];
      equals[i].in[1] <== expression[i];


      key_check <== equals[i].out + key_check

      equalsV[i] = IsEqual();
      equalsV[i].in[0] <== expression[i];
      // '42' UTF-8 symbol corresponds to the digits of the value from the padded expression
      equalsV[i].in[1] <== 42; 

      // compare parsed digits 
      gt[i] = GreaterThan(8);
      gt[i].in[0] <== equalsV[i].out*msg[i] + (1-equalsV[i].out)*43;
      gt[i].in[1] <== comparisonValue[i];

      gt2[i] = LessThan(8);
      gt2[i].in[0] <== equalsV[i].out*msg[i] + (1-equalsV[i].out)*43;
      gt2[i].in[1] <== comparisonValue[i];

      acc[i] <== gt[i].out*1 + gt2[i].out*2

      gt3[i] = IsZero();
      gt3[i].in <== comparison_result;
      comparison_result <== comparison_result + acc[i]* gt3[i].out

    }

}

component main = ParseAndCompare(20);