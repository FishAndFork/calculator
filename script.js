const SPACE_BETWEEN_BUTTONS = 5;
const CALCULATOR_WIDTH = 560;
const CALCULATOR_HEIGHT = 460;
const BUTTONS_HORIZONTALLY = 4;
const BUTTONS_VERTICALLY = 6;
const BUTTONS_QUANTITY = BUTTONS_HORIZONTALLY * BUTTONS_VERTICALLY;
const buttonsSymbols = ['MR', 'M+', 'M-', 'MC',
                        '^', 'C', '<-', '/', 
                        '7', '8', '9', 'X', 
                        '4', '5', '6', '-',
                        '1', '2', '3', '+', 
                        '+/-', '0', '.', '='];
const keyboardCodes = ['MemoryRead', '', '', '',
                    '', 46, 8, 111,
                    103, 104, 105, 106,
                    100, 101, 102, 109,
                    97, 98, 99, 107,
                    '', 96, 110, 13];

let gCurrentData = 0;
let gPreviousData = 0;
let gOperation = '';
let gAddingNewOperand = false;
let gMemoryData = 0;
let gMemoryInitialized = false;

const container = document.querySelector('.container')
const display = document.querySelector('.display');
const displaySecondary = document.querySelector('.display-secondary');

drawCalculator();

window.addEventListener('keydown', pressKeyboardButton);

window.addEventListener('keyup', releaseKeyboardButton);


// -----Functions-----
function add(x, y) {
    return x + y;
}

function substract(x, y) {
    return x - y;
}

function multiply(x, y) {
    return x * y;
}

function divide(x, y) {
    if (y === 0) {
        return 'Error';
    }
    let result = x / y;
    let resultString = result.toString();
    let dotPlace = resultString.indexOf('.');
    let digitsAfterDot = 13 - (dotPlace + 1);
    var rounded = Math.round(result * 10**digitsAfterDot) / 10**digitsAfterDot;
    return rounded;
}

function power(x, y) {
    // Negative number to fraction exponent
    if (x < 0 && (y < 1 && y > 0)) {
        return 'Error';
    }
    // Negative number to negative fraction exponent 
    // becomes (1/negative number) to fraction exponent, basically first case
    if (x < 0 && y < 0 && y > -1) {
        return 'Error';
    }
	return x**y;
}

function operate(operator, x, y) {
    return operator(x, y);
}

function drawCalculator() {
    const buttonWidth = 
        (CALCULATOR_WIDTH - SPACE_BETWEEN_BUTTONS*2 * 2 * BUTTONS_HORIZONTALLY) 
        / BUTTONS_HORIZONTALLY;
    const buttonHeight = 
        (CALCULATOR_HEIGHT - SPACE_BETWEEN_BUTTONS * 2 * BUTTONS_VERTICALLY) 
        / BUTTONS_VERTICALLY;
    for (let i = 1; i <= BUTTONS_QUANTITY; i++) {
        const button = document.createElement('div');
        button.classList.add('calcButton');
        const newPadding = (Math.abs(53 - buttonHeight) / 2).toString() + 'px 0';
        button.style.padding = newPadding;
        button.style.width = buttonWidth.toString() + 'px';
        // button.style.height = buttonHeight.toString() + 'px';
        const remainder = (i - 1) % BUTTONS_HORIZONTALLY;
        if (remainder == 0) {
            button.style.clear = 'left';
        }

        if (i <= buttonsSymbols.length) {
            button.textContent = buttonsSymbols[i-1];
        }
        if (i <= keyboardCodes.length) {
            button.setAttribute('data-key', keyboardCodes[i-1]);
        }

        switch(button.textContent) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '.':
                button.addEventListener('click', populateDisplay);
                break;
            case 'C':
                button.addEventListener('click', clearAll);
                break;
            case '/':
            case 'X':
            case '+':
            case '-':
            case '^':
                button.addEventListener('click', startOperation);
                break;
            case '=':
                button.addEventListener('click', makeResults);
                break;
            case '<-':
                button.addEventListener('click', backSpace);
                break;
            case '+/-':
                button.addEventListener('click', switchPlusMinus);
                break;
            case 'MR':
                button.addEventListener('click', readFromMemory);
                break;
            case 'M+':
                button.addEventListener('click', addToMemory);
                break;
            case 'M-':
                button.addEventListener('click', subtractFromMemory);
                break;
            case 'MC':
                button.addEventListener('click', clearMemory);
                break;
        }

        container.appendChild(button);
    }
}

function startOperation(e) {
    if (display.textContent === '' || gOperation !== '') {
        return;
    }
    gCurrentData = parseFloat(display.textContent);
    gPreviousData += gCurrentData;
    // gCurrentData = 0;
    gOperation = e.target.textContent;
    e.target.classList.add('operating');
    gAddingNewOperand = true;
}

function makeResults(e) {
    if (gOperation === '' || display.textContent === '' || gAddingNewOperand) {
        return;
    }
    let operator;
    switch (gOperation) {
        case '/':
            operator = divide;
            break;
        case 'X':
            operator = multiply;
            break;
        case '+':
            operator = add;
            break;
        case '-':
            operator = substract;
            break;
         case '^':
            operator = power;
            break;
    }
    let x = gPreviousData;
    let y = gCurrentData;
    let result = operate(operator, x, y);
    if (typeof result === 'number') {
        if (!isFinite(result)) {
            result = "Too big";
            gCurrentData = 0;
        }
        else {
            result = handleNumberBigger13(result);
            gCurrentData = parseFloat(result);
        }
    }
    else {
        gCurrentData = 0;
    }
    display.textContent = result.toString();
    displaySecondary.textContent = '';
    gPreviousData = 0;
    if (typeof result === 'number') {
        gCurrentData = result;
    }
    
    gOperation = '';
    const buttons = document.querySelectorAll('.calcButton');
    buttons.forEach(button => button.classList.remove('operating'));
    if (gMemoryInitialized) {
        const buttonMR = document.querySelector(`.calcButton[data-key="MemoryRead"]`);
        buttonMR.classList.add('operating');
    }
}

function handleNumberBigger13(number) { // 13 to fit the display
    let numberString = number.toString();
    if (numberString.length <= 13) {
        return number;
    }
    let expNumberString = number.toExponential().toString();
    console.log(expNumberString);
    let indexOfE = expNumberString.indexOf('e');
    let expPartString = expNumberString.slice(indexOfE);
    let expPartLength = expPartString.length;

    // -1 to actually fit to 13 size (because of the dot in the number)
    // second -1 to leave space for minus
    // (yeah, it was deliberate to make it that way instead of '-2')
    return number.toPrecision(13 - expPartLength - 1 - 1);
    // Example:
    // 1.9999999999998e+13 => 2.000000e+13
    // 1.9999999999998e+13 has 4 characters in 'expPart' (including 'e')
    // .toPrecision(<precision>) leaves <precision> digits before and after dot and before 'e'
    // here: number.toPrecision(13 - expPartLength - 1 - 1) will have .toPrecision(7)
    // indeed, 2.000000e+13 has 7 'valuable' digits ('2' and six zeroes)
    // and totally 12 characters leaving one for minus, so with minus it's 13
    // the minus could be either because of negative value or pressing the '+/-' button later
}

function populateDisplay(e) {
    if (gAddingNewOperand) {
        if (gOperation === '/' && e.target.textContent === '0') {
            return;
        }
        display.textContent = '';
        displaySecondary.textContent = handleNumberBigger13(gPreviousData);
        gAddingNewOperand = false;
    }
    if (display.textContent.length >= 13) {
        return;
    }
    if (display.textContent.includes('.') && e.target.textContent === '.') {
        return;
    }
    // In case user started typing second operand for dividing, then erased it 
    // and trying to type "0"
    if (gOperation === '/' && e.target.textContent === '0'
        && display.textContent === '') {
        return;
    }
    display.textContent += e.target.textContent;
    gCurrentData = parseFloat(display.textContent);
}

function clearAll(e) {
    gCurrentData = 0;
    gPreviousData = 0;
    gOperation = '';
    display.textContent = '';
    displaySecondary.textContent = '';
    const buttons = document.querySelectorAll('.calcButton');
    buttons.forEach(button => button.classList.remove('operating'));
    if (gMemoryInitialized) {
        const buttonMR = document.querySelector(`.calcButton[data-key="MemoryRead"]`);
        buttonMR.classList.add('operating');
    }
    buttons.forEach(button => button.classList.remove('clickSimulate'));
}

function pressKeyboardButton(e) {
    const button = document.querySelector(`.calcButton[data-key="${e.keyCode}"]`);
    if (!button) {
        return;
    }
    button.click();
    button.classList.add('clickSimulate');
}

function releaseKeyboardButton(e) {
    let calcButtonPressed = false;
    let buttonCode = e.keyCode;
    for (var i = 0; i < keyboardCodes.length; i++) {
        if (keyboardCodes[i] === buttonCode) {
            calcButtonPressed = true;
            break;
        }
    }
    if (!calcButtonPressed) {
        return;
    }
    const button = document.querySelector(`.calcButton[data-key="${buttonCode}"]`);
    button.classList.remove('clickSimulate');
}

function backSpace(e) {
    if (gOperation !== '' && gAddingNewOperand) {
        gOperation = '';
        gAddingNewOperand = false;
        gCurrentData = gPreviousData;
        gPreviousData -= parseFloat(display.textContent);
        const buttons = document.querySelectorAll('.calcButton');
        buttons.forEach(button => button.classList.remove('operating'));
        return;
    }
    let displayString = display.textContent;
    if (displayString === '') {
        return;
    }
    display.textContent = displayString.slice(0, displayString.length - 1);
    gCurrentData = parseFloat(display.textContent);
}

function switchPlusMinus(e) {
    if (display.textContent.length >= 13) {
        if (gCurrentData < 0) { // if negative number with '-' and 12 other characters
            display.textContent = display.textContent.slice(1);
            gCurrentData = -gCurrentData;
            return;
        }
        else {
            return;
        }
    }
    if (gCurrentData > 0) {
        display.textContent = '-' + display.textContent;
        gCurrentData = -gCurrentData;
    }
    else if (gCurrentData < 0) {
        display.textContent = display.textContent.slice(1);
        gCurrentData = -gCurrentData;
    }
}

function readFromMemory() {
    if (!gMemoryInitialized) {
        return;
    }
    if (gAddingNewOperand) {
        if (gOperation === '/' && gMemoryData === '0') {
            return;
        }
        displaySecondary.textContent = handleNumberBigger13(gPreviousData);
        gAddingNewOperand = false;
    }
    if (gOperation === '/' && gMemoryData === '0'
        && display.textContent === '') {
        return;
    }
    gCurrentData = handleNumberBigger13(gMemoryData);
    display.textContent = gCurrentData.toString();
}

function addToMemory(e) {
    if (display.textContent === '') {
        return;
    }
    gMemoryData += gCurrentData;
    gMemoryInitialized = true;
    const buttonMR = document.querySelector(`.calcButton[data-key="MemoryRead"]`);
    buttonMR.classList.add('operating');
}

function subtractFromMemory() {
    if (!gMemoryInitialized || display.textContent === '') {
        return;
    }
    gMemoryData -= gCurrentData;
}

function clearMemory() {
    if (!gMemoryInitialized) {
        return;
    }
    gMemoryData = 0;
    gMemoryInitialized = false;
    const buttonMR = document.querySelector(`.calcButton[data-key="MemoryRead"]`);
    buttonMR.classList.remove('operating');
}

