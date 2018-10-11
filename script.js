const SPACE_BETWEEN_BUTTONS = 5;
const CALCULATOR_WIDTH = 600;
const CALCULATOR_HEIGHT = 400;
const BUTTONS_HORIZONTALLY = 4;
const BUTTONS_VERTICALLY = 5;
const BUTTONS_QUANTITY = BUTTONS_HORIZONTALLY * BUTTONS_VERTICALLY;
const buttonsSymbols = ['', 'C', '<-', '/', 
                        '7', '8', '9', 'X', 
                        '4', '5', '6', '-',
                        '1', '2', '3', '+', 
                        '+/-', '0', '.', '='];
const keyboardCodes = ['', 46, 8, 111,
                    103, 104, 105, 106,
                    100, 101, 102, 109,
                    97, 98, 99, 107,
                    '', 96, 110, 13];

let gCurrentData = 0;
let gMemoryData = 0;
let gResult = 0;
let gOperation = 0;
let gAddingNewOperand = false;

const container = document.querySelector('.container')
const display = document.querySelector('.display');

drawCalculator();

window.addEventListener('keydown', pressKeyboardButton);


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
    let result = x / y;
    let resultString = result.toString();
    let dotPlace = resultString.indexOf('.');
    let digitsAfterDot = 13 - (dotPlace + 1);
    var rounded = Math.round(result * 10**digitsAfterDot) / 10**digitsAfterDot;
    return rounded;
}

function operate(operator, x, y) {
    return operator(x, y);
}

function drawCalculator() {
    const buttonWidth = 
        (CALCULATOR_WIDTH - SPACE_BETWEEN_BUTTONS * 2 * BUTTONS_HORIZONTALLY) 
        / BUTTONS_HORIZONTALLY;
    const buttonHeight = 
        (CALCULATOR_HEIGHT - SPACE_BETWEEN_BUTTONS * 2 * BUTTONS_VERTICALLY) 
        / BUTTONS_VERTICALLY;
    for (let i = 1; i <= BUTTONS_QUANTITY; i++) {
        const button = document.createElement('div');
        button.classList.add('calcButton');
        const newPadding = (Math.abs(48 - buttonHeight) / 2).toString() + 'px 0';
        button.style.padding = newPadding;
        button.style.width = buttonWidth.toString() + 'px';
        // button.style.height = buttonHeight.toString() + 'px';
        const remainder = (i - 1) % BUTTONS_HORIZONTALLY;
        if (remainder == 0) {
            button.style.clear = 'left';
        }

        if (i <= buttonsSymbols.length) {
            button.textContent = buttonsSymbols[i-1];
            // button.setAttribute('data-value', buttonsSymbols[i-1]);
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
        }

        container.appendChild(button);
    }
}

function startOperation(e) {
    if (display.textContent === '') {
        return;
    }
    gCurrentData = parseFloat(display.textContent);
    gMemoryData += gCurrentData;
    gCurrentData = 0;
    gOperation = e.target.textContent;
    e.target.classList.add('operating');
    gAddingNewOperand = true;
}

function makeResults(e) {
    if (gOperation === '' || display.textContent === '') {
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
    }
    let x = gMemoryData;
    let y = gCurrentData;
    gResult = operate(operator, x, y);
    display.textContent = gResult.toString();
    gMemoryData = 0;
    gCurrentData = gResult;
    gResult = 0;
    const buttons = document.querySelectorAll('.calcButton');
    buttons.forEach(button => button.classList.remove('operating'));
}

function populateDisplay(e) {
    if (gAddingNewOperand) {
        display.textContent = '';
        gAddingNewOperand = false;
    }
    if (display.textContent.length >= 13) {
        return;
    }
    if (display.textContent.includes('.') && e.target.textContent === '.') {
        return;
    }
    if (gOperation === '/' && e.target.textContent === '0'
        && display.textContent === '') {
        return;
    }
    display.textContent += e.target.textContent;
    gCurrentData = parseFloat(display.textContent);
}

function clearAll(e) {
    gCurrentData = 0;
    gMemoryData = 0;
    gResult = 0;
    gOperation = '';
    display.textContent = '';
    const buttons = document.querySelectorAll('.calcButton');
    buttons.forEach(button => button.classList.remove('operating'));
    buttons.forEach(button => button.classList.remove('clickSimulate'));
}

function pressKeyboardButton(e) {
    const button = document.querySelector(`.calcButton[data-key="${e.keyCode}"]`);
    // setTimeout(() => button.click(), 1000);
    button.click();
    button.classList.add('clickSimulate');
    button.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'box-shadow') return;
        e.target.classList.remove('clickSimulate');
    });
}

function backSpace(e) {
    let displayString = display.textContent;
    if (displayString === '') {
        return;
    }
    display.textContent = displayString.slice(0, displayString.length - 1);
    gCurrentData = parseFloat(display.textContent);
}

function switchPlusMinus(e) {
    if (gCurrentData > 0) {
        display.textContent = '-' + display.textContent;
        gCurrentData = -gCurrentData;
    }
    else if (gCurrentData < 0) {
        display.textContent = display.textContent.slice(1);
        gCurrentData = -gCurrentData;
    }
    
}