var rechner = (function (rechner) {

    rechner.logic = (function (logic) {

        // --------------------------------------------------------------------------------
        // Private properties
        // --------------------------------------------------------------------------------
        
        var inputEnum = {
            Decimal: 1,
            Binary: 2,
            System: 3,
            FunctionalButton: 4,
        };

        //var signed = true;

        // --------------------------------------------------------------------------------
        // DOM objects
        // --------------------------------------------------------------------------------

        // Options

        var $inputGroupSelectBit = $('#inputGroupSelectBit');
        var $SignedUnsignedSwitch = $('#switch-SignedUnsigned');
        var $ACButton = $('#ACButton');
        var $inputGroupSelectSystem = $('#inputGroupSelectSystem');
        
        // Input Group - Operand 1

        var $operand1Decimal = $('#operand1Decimal');
        var $operand1DecimalPlus = $('#operand1DecimalPlus');
        var $operand1DecimalMinus = $('#operand1DecimalMinus');

        var $operand1Binary = $('#operand1Binary');
        var $operand1NOT = $('#operand1NOT');
        var $operand1LEFTSHIFT = $('#operand1LEFTSHIFT');
        var $operand1RIGHTSHIFT = $('#operand1RIGHTSHIFT');

        var $operand1System = $('#operand1System');

        // Input Group - Operand 2

        var $operand2Decimal = $('#operand2Decimal');
        var $operand2DecimalPlus = $('#operand2DecimalPlus');
        var $operand2DecimalMinus = $('#operand2DecimalMinus');

        var $operand2Binary = $('#operand2Binary');
        var $operand2NOT = $('#operand2NOT');
        var $operand2LEFTSHIFT = $('#operand2LEFTSHIFT');
        var $operand2RIGHTSHIFT = $('#operand2RIGHTSHIFT');

        var $operand2System = $('#operand2System');

        // Input Group - Result

        var $resultDecimal = $('#resultDecimal');
        var $resultCopy = $('#resultCopy');

        var $resultBinary = $('#resultBinary');

        var $resultSystem = $('#resultSystem');

        // Input Group - Function Buttons

        var $addBtn = $('#addBtn');
        var $subBtn = $('#subBtn');
        var $mulBtn = $('#mulBtn');
        var $divBtn = $('#divBtn');

        var $ANDBtn = $('#ANDBtn');
        var $ORBtn = $('#ORBtn');
        var $XORBtn = $('#XORBtn');

        // --------------------------------------------------------------------------------
        // Private functions
        // --------------------------------------------------------------------------------
        function Init() {

            // Init Bootstrap Switch for Signed/Unsigned Checkbox

            $SignedUnsignedSwitch.bootstrapSwitch();

            // Init Select Change & Button Listener

            selectChangeListener();
            buttonChangeListener()

            // Init Input Change Listener

            inputChangeListener($operand1Decimal, $operand1Binary, $operand1System);
            inputChangeListener($operand2Decimal, $operand2Binary, $operand2System);

            // Init Input Spinner

            inputSpinner($operand1Decimal, $operand1Binary, $operand1System, $operand1DecimalPlus, $operand1DecimalMinus);
            inputSpinner($operand2Decimal, $operand2Binary, $operand2System, $operand2DecimalPlus, $operand2DecimalMinus);

            // Init Copy Button & Input Formats

            new ClipboardJS("#resultCopy");

            $(".binaryInputs").keydown(function (e) {
                // Allow: backspace, delete
                if ($.inArray(e.keyCode, [46, 8]) !== -1 ||
                    // Allow: Ctrl+A, Command+A
                    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                    // Allow: home, end, left, right, down, up
                    (e.keyCode >= 35 && e.keyCode <= 40)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 49)) && (e.keyCode < 96 || e.keyCode > 97)) {
                    e.preventDefault();
                }
            });

        }

        Init();

        function inputSpinner(decimalInputID, binaryInputID, systemInputID, spinnerPlusID, spinnerMinusID) {
            (function ($) {
                spinnerPlusID.on('click', function () {
                    if (decimalInputID.val() === '' || decimalInputID.val() == 'NaN') {
                        decimalInputID.val(1);
                    } else {
                        decimalInputID.val(parseInt(decimalInputID.val(), 10) + 1);
                    }
                    updateAll(decimalInputID, binaryInputID, systemInputID, inputEnum.Decimal);
                });
                spinnerMinusID.on('click', function () {
                    if (decimalInputID.val() === '' || decimalInputID.val() == 'NaN') {
                        decimalInputID.val(0);
                    } else {
                        decimalInputID.val(parseInt(decimalInputID.val(), 10) - 1);
                    }
                    updateAll(decimalInputID, binaryInputID, systemInputID, inputEnum.Decimal);
                });
            })(jQuery);
        }

        // logical logic

        function updateAll(decimalInputID, binaryInputID, systemInputID, inputType) {

            console.log("input type " + inputType);

            if (inputType == inputEnum.Decimal && (decimalInputID.val() < Math.pow(2, $inputGroupSelectBit.val()))) {
                binaryInputID.val(float64ToInt64Binary(decimalInputID.val()).substr(pos_to_neg($inputGroupSelectBit.val())));
                systemInputID.val(intToSystem(decimalInputID.val()));
            } else if (inputType == inputEnum.Binary || inputType == inputEnum.FunctionalButton) {
                decimalInputID.val(binaryToInt(binaryInputID.val()));
                systemInputID.val(intToSystem(decimalInputID.val()));
            } else if (inputType == inputEnum.System) {
                decimalInputID.val(systemToInt(systemInputID.val()));
                binaryInputID.val(float64ToInt64Binary(systemToInt(systemInputID.val())).substr(pos_to_neg($inputGroupSelectBit.val())));
            } else {
                // TODO: Signed Function
                //if (signed) {
                //    alert("Error: Only Numbers Between " + pos_to_neg((Math.pow(2, $inputGroupSelectBit.val()) / 2)) + " and " + ((Math.pow(2, $inputGroupSelectBit.val()) / 2 ) - 1) + " can be converted to " + $inputGroupSelectBit.val() + "-Bit");
                //} else {
                alert("Error: Only Numbers Between 0 and " + Math.pow(2, $inputGroupSelectBit.val()) + " can be converted to " + $inputGroupSelectBit.val() + "-Bit");
                //}
                binaryInputID.val("");
            }

            // Active Functional Button logic
            if (inputType != inputEnum.FunctionalButton) {
                if ($addBtn.hasClass("active")) {
                    binaryAddition($operand1Binary, $operand2Binary);
                }
                else if ($subBtn.hasClass("active")) {
                    binarySubtraction($operand1Binary, $operand2Binary);
                }
                else if ($mulBtn.hasClass("active")) {
                    binaryMultiplication($operand1Binary, $operand2Binary);
                }
                else if ($divBtn.hasClass("active")) {
                    binaryDivision($operand1Binary, $operand2Binary);
                }
                else if ($ANDBtn.hasClass("active")) {
                    binaryAND($operand1Binary, $operand2Binary);
                }
                else if ($ORBtn.hasClass("active")) {
                    binaryOR($operand1Binary, $operand2Binary);
                }
                else if ($XORBtn.hasClass("active")) {
                    binaryXOR($operand1Binary, $operand2Binary);
                }
            }

            console.log("$operand1Decimal input");
        }

        // Button Listener

        function buttonChangeListener() {

            $ACButton.button().click(function () {
                allClear();
            });

            // TODO: Signed Function

            //if ($("#switch-SignedUnsigned").is(':checked')) {
            //    $("#txtAge").show();  // checked
            //} else {
            //    $("#txtAge").hide();  // unchecked
            //}

            // Bitwise Operators - The Buttons right side from the operand

            $operand1NOT.button().click(function () {
                bitwiseNot($operand1Binary);
                updateAll($operand1Decimal, $operand1Binary, $operand1System, inputEnum.Binary);
            });

            $operand1LEFTSHIFT.button().click(function () {
                bitwiseLeftShift($operand1Binary);
                updateAll($operand1Decimal, $operand1Binary, $operand1System, inputEnum.Binary);
            });

            $operand1RIGHTSHIFT.button().click(function () {
                bitwiseRightShift($operand1Binary);
                updateAll($operand1Decimal, $operand1Binary, $operand1System, inputEnum.Binary);
            });

            $operand2NOT.button().click(function () {
                bitwiseNot($operand2Binary);
                updateAll($operand2Decimal, $operand2Binary, $operand2System, inputEnum.Binary);
            });

            $operand2LEFTSHIFT.button().click(function () {
                bitwiseLeftShift($operand2Binary);
                updateAll($operand2Decimal, $operand2Binary, $operand2System, inputEnum.Binary);
            });

            $operand2RIGHTSHIFT.button().click(function () {
                bitwiseRightShift($operand2Binary);
                updateAll($operand2Decimal, $operand2Binary, $operand2System, inputEnum.Binary);
            });

            // Functional Buttons - Buttons Active class
            var $btns = $('#BTNContainer .button');

            // Loop through the buttons and add the active class to the current/clicked button
            for (var i = 0; i < $btns.length; i++) {
                $btns[i].addEventListener("click", function () {
                    var current = document.getElementsByClassName("active");
                    current[0].className = current[0].className.replace(" active", "");
                    this.className += " active";
                    if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {
                        updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.Binary);
                    }
                });
            }
        }

        // Select Change Listener

        function selectChangeListener() {
            $inputGroupSelectBit.on('change', function (e) {
                updateAll($operand1Decimal, $operand1Binary, $operand1System, inputEnum.Decimal);
                updateAll($operand2Decimal, $operand2Binary, $operand2System, inputEnum.Decimal);
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.Decimal);
            });

            $inputGroupSelectSystem.on('change', function (e) {
                updateAll($operand1Decimal, $operand1Binary, $operand1System, inputEnum.Decimal);
                updateAll($operand2Decimal, $operand2Binary, $operand2System, inputEnum.Decimal);
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.Decimal);
            });
        }

        // logical inputs - input change listener

        function inputChangeListener(decimalInputID, binaryInputID, systemInputID) {
            decimalInputID.on('input', function () {
                console.log("test: " + inputEnum.Decimal);
                updateAll(decimalInputID, binaryInputID, systemInputID, inputEnum.Decimal);
            });
            binaryInputID.on('input', function () {
                updateAll(decimalInputID, binaryInputID, systemInputID, inputEnum.Binary);
            });
            systemInputID.on('input', function () {
                updateAll(decimalInputID, binaryInputID, systemInputID, inputEnum.System);
            });
        }
        
        // logic decimal to system (hex, octal, ternary, etc.)

        function intToSystem(int) {
            if ($inputGroupSelectSystem.val() == 16) {  // if hexdecimal
                return "#" + ("0" + (Number(int).toString(16))).toUpperCase()
            } else {
                var integer = new BigNumber(int, 10);
                var base = Number($inputGroupSelectSystem.val());
                int = integer.toString(base);  // ex. for octal toString(8), ternary toString(3)
                return int;
            }
        }

        // logic system to decimal (hex,octal,ternary etc.)

        function systemToInt(system) {
            if ($inputGroupSelectSystem.val() == 16) {  // if hexdecimal
                system = system.replace(/#/g, "");  // Replace # with nothing
                return parseInt(system, $inputGroupSelectSystem.val());
            } else {
                var systemNumber = new BigNumber(system, Number($inputGroupSelectSystem.val()));
                system = systemNumber.toString(10);  // the base for decimal is 10, toString(10)
                return system;
            }
        }

        // logic binary to decimal

        function binaryToInt(binary) {
            return parseInt(binary, 2);
        }

        // logic decimal to binary

        // IIFE to scope internal variables
        var float64ToInt64Binary = (function () {
            // create union
            var flt64 = new Float64Array(1)
            var uint16 = new Uint16Array(flt64.buffer)
            // 2**53-1
            var MAX_SAFE = 9007199254740991
            // 2**31
            var MAX_INT32 = 2147483648

            function uint16ToBinary() {
                var bin64 = ''

                // generate padded binary string a word at a time
                for (var word = 0; word < 4; word++) {
                    bin64 = uint16[word].toString(2).padStart(16, 0) + bin64
                }

                return bin64
            }

            return function float64ToInt64Binary(number) {
                // NaN would pass through Math.abs(number) > MAX_SAFE
                if (!(Math.abs(number) <= MAX_SAFE)) {
                    throw new RangeError('Absolute value must be less than 2**53')
                }

                var sign = number < 0 ? 1 : 0

                // shortcut using other answer for sufficiently small range
                if (Math.abs(number) <= MAX_INT32) {
                    return (number >>> 0).toString(2).padStart(64, sign)
                }

                // little endian byte ordering
                flt64[0] = number

                // subtract bias from exponent bits
                var exponent = ((uint16[3] & 0x7FF0) >> 4) - 1023

                // encode implicit leading bit of mantissa
                uint16[3] |= 0x10
                // clear exponent and sign bit
                uint16[3] &= 0x1F

                // check sign bit
                if (sign === 1) {
                    // apply two's complement
                    uint16[0] ^= 0xFFFF
                    uint16[1] ^= 0xFFFF
                    uint16[2] ^= 0xFFFF
                    uint16[3] ^= 0xFFFF
                    // propagate carry bit
                    for (var word = 0; word < 3 && uint16[word] === 0xFFFF; word++) {
                        // apply integer overflow
                        uint16[word] = 0
                    }

                    // complete increment
                    uint16[word]++
                }

                // only keep integer part of mantissa
                var bin64 = uint16ToBinary().substr(11, Math.max(exponent, 0))
                // sign-extend binary string
                return bin64.padStart(64, sign)
            }
        })()

        function pos_to_neg(num) {
            return -Math.abs(num);
        }

        // functions Buttons 

        // AC - All Clear

        function allClear() {
            
            $operand1Decimal.val('');
            $operand1Binary.val('');
            $operand1System.val('');
            $operand2Decimal.val('');
            $operand2Binary.val('');
            $operand2System.val('');
            $resultDecimal.val('');
            $resultBinary.val('');
            $resultSystem.val('');

        }

        // Bitwise Operators - The Buttons right side from the operand
        // Not (~) or (!)

        function bitwiseNot(binaryInputID) {
            
            var binary = binaryInputID.val();
            var reversedBinary = "";

            for (var i = 0; i < binary.length; i++) {
                if (binary.substr(i, 1) == 0) { // Get Each char and check if it's 0, if true replace it by 1
                    reversedBinary += "1";
                } else {
                    reversedBinary += "0";
                }
            }

            binaryInputID.val(reversedBinary);

        }

        // Left Shift (<<)
        function bitwiseLeftShift(binaryInputID) {
            binaryInputID.val(binaryInputID.val().substr(1) + "0");

        }

        // Right Shift (>>)
        function bitwiseRightShift(binaryInputID) {
            binaryInputID.val("0" + (binaryInputID.val().slice(0, - 1)));
        }

        // Bitwise Operators - The Buttons under the inputs

        // Addition (+)

        function binaryAddition(binaryInputID, binaryInputID2) {
            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {

                // if the Result is higher than the maximum allowed Bits (ex. 2^16 = 65536), give more space for the result
                if ((binaryToInt(binaryInputID.val()) + binaryToInt(binaryInputID2.val())) > (Math.pow(2, $inputGroupSelectBit.val()) - 1)) {
                    $resultBinary.val(float64ToInt64Binary(binaryToInt(binaryInputID.val()) + binaryToInt(binaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val()) + Number($inputGroupSelectBit.val())))));
                } else {
                    $resultBinary.val(float64ToInt64Binary(binaryToInt(binaryInputID.val()) + binaryToInt(binaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val())))));
                }

                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Subtraction (-)

        function binarySubtraction(binaryInputID, binaryInputID2) {
            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {
                $resultBinary.val(float64ToInt64Binary(binaryToInt(binaryInputID.val()) - binaryToInt(binaryInputID2.val())).substr(pos_to_neg($inputGroupSelectBit.val())));
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Multiplication (*)

        function binaryMultiplication(binaryInputID, binaryInputID2) {
            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {

                // if the Result is higher than the maximum allowed Bits (ex. 2^16 = 65536), give more space for the result
                if ((binaryToInt(binaryInputID.val()) * binaryToInt(binaryInputID2.val())) > (Math.pow(2, $inputGroupSelectBit.val()) - 1)) {
                    $resultBinary.val(float64ToInt64Binary(binaryToInt(binaryInputID.val()) * binaryToInt(binaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val()) + Number($inputGroupSelectBit.val())))));
                } else {
                    $resultBinary.val(float64ToInt64Binary(binaryToInt(binaryInputID.val()) * binaryToInt(binaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val())))));
                }

                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Division (/)

        function binaryDivision(binaryInputID, binaryInputID2) {
            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {
                $resultBinary.val(float64ToInt64Binary(binaryToInt(binaryInputID.val()) / binaryToInt(binaryInputID2.val())).substr(pos_to_neg($inputGroupSelectBit.val())));
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
                $resultDecimal.val($resultDecimal.val());

                // TODO : Fix Error Message on switching the numeral system, when Division is activated.
                //$resultDecimal.val($resultDecimal.val() + " ,% " + binaryToInt(binaryInputID.val()) % binaryToInt(binaryInputID2.val()));
            }
        }

        // AND (&)

        function binaryAND(binaryInputID, binaryInputID2) {

            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {

                var binary = binaryInputID.val();
                var binary2 = binaryInputID2.val();
                var binAND = "";

                for (var i = 0; i < binary.length; i++) {
                    if (binary.substr(i, 1) == 1) { // Get Each char and check if it's 1
                        if (binary2.substr(i, 1) == 1) { // Get Each char of Binary 2 and check if it's 1, if true replace it by 1
                            binAND += "1";
                        } else {
                            binAND += "0";
                        }
                    } else {
                        binAND += "0";
                    }
                }

                $resultBinary.val(binAND);
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // OR (&)

        function binaryOR(binaryInputID, binaryInputID2) {

            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {

                var binary = binaryInputID.val();
                var binary2 = binaryInputID2.val();
                var binOR = "";

                for (var i = 0; i < binary.length; i++) {
                    if (binary.substr(i, 1) == 1) { // Get Each char and check if it's 1
                        if (binary2.substr(i, 1) == 1) { // Get Each char of Binary 2 and check if it's 1, if true replace it by 1
                            binOR += "1";
                        } else {
                            binOR += "1";
                        }
                    } else {
                        if (binary2.substr(i, 1) == 1) { // Get Each char of Binary 2 and check if it's 1, if true replace it by 1
                            binOR += "1";
                        } else {
                            binOR += "0";
                        }
                    }
                }

                $resultBinary.val(binOR);
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // XOR (^)

        function binaryXOR(binaryInputID, binaryInputID2) {

            if ($operand1Binary.val() != "" && $operand2Binary.val() != "") {

                var binary = binaryInputID.val();
                var binary2 = binaryInputID2.val();
                var binXOR = "";

                for (var i = 0; i < binary.length; i++) {
                    if (binary.substr(i, 1) == 1) { // Get Each char and check if it's 1
                        if (binary2.substr(i, 1) == 1) { // Get Each char of Binary 2 and check if it's 1, if true replace it by 0
                            binXOR += "0";
                        } else {
                            binXOR += "1";
                        }
                    } else {
                        if (binary2.substr(i, 1) == 1) { // Get Each char of Binary 2 and check if it's 1
                            if (binary.substr(i, 1) == 0) { // Get Each char and check if it's 0, if true replace it by 1
                                binXOR += "1";
                            }
                        } else {
                            binXOR += "0";
                        }
                    }
                }

                $resultBinary.val(binXOR);
                updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Update all fields at the start
        updateAll($operand1Decimal, $operand1Binary, $operand1System, inputEnum.Decimal);
        updateAll($operand2Decimal, $operand2Binary, $operand2System, inputEnum.Decimal);
        updateAll($resultDecimal, $resultBinary, $resultSystem, inputEnum.Decimal);

        return logic;

    }(rechner.logic || {}));

    return rechner;

}(rechner || {}));