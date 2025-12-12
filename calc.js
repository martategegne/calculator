/**
 * Enhanced Calculator - With BODMAS/PEMDAS Support
 * @author Marta Tegegne Mamo
 */

// Calculator state object
const calculator = {
    displayValue: '0',
    previousValue: null,
    operation: null,
    waitingForNewValue: false,
    errorState: false,
    memory: 0,
    lastCalculationTime: 0,
    // Store expression for BODMAS
    expression: [],
    shouldCalculate: false
};

// DOM Elements
const currentOperand = document.querySelector('.current-operand');
const previousOperand = document.querySelector('.previous-operand');
const buttons = document.querySelectorAll('button');

// Operator precedence (BODMAS/PEMDAS)
const PRECEDENCE = {
    '+': 1,
    '-': 1,
    '×': 2,
    '/': 2,
    '%': 3
};

// Initialize calculator
function init() {
    console.log('🧮 Calculator Initialized');
    
    try {
        // Load from localStorage (only memory)
        loadFromStorage();
        
        // Update display
        updateDisplay();
        
        // Add event listeners
        setupEventListeners();
        
        // Setup keyboard support
        setupKeyboardSupport();
        
        // Setup test functions in console
        setupTestFunctions();
        
        console.log('✅ Calculator ready with BODMAS support');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
}

// Check if localStorage is available
const isLocalStorageAvailable = () => {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
};

// Load data from localStorage
function loadFromStorage() {
    if (!isLocalStorageAvailable()) {
        console.warn('⚠️ localStorage not available');
        calculator.memory = 0;
        return;
    }
    
    try {
        const savedMemory = localStorage.getItem('calculator_memory');
        if (savedMemory) {
            calculator.memory = parseFloat(savedMemory);
            console.log('📂 Loaded memory:', calculator.memory);
        }
    } catch (error) {
        console.warn('⚠️ Error loading:', error);
    }
}

// Save to localStorage
function saveToStorage() {
    if (!isLocalStorageAvailable()) return;
    
    try {
        localStorage.setItem('calculator_memory', calculator.memory.toString());
        console.log('💾 Saved memory:', calculator.memory);
    } catch (error) {
        console.warn('⚠️ Error saving:', error);
    }
}

// Update display
function updateDisplay() {
    // Format display value
    currentOperand.textContent = formatDisplay(calculator.displayValue);
    
    // Show expression for BODMAS
    let displayExpr = '';
    if (calculator.expression.length > 0) {
        displayExpr = calculator.expression.map(item => 
            typeof item === 'number' ? formatDisplay(item.toString()) : item
        ).join(' ');
    }
    previousOperand.textContent = displayExpr || '';
    
    // Animation
    currentOperand.style.animation = 'none';
    setTimeout(() => {
        currentOperand.style.animation = 'pulse 0.3s';
    }, 10);
}

// Format display value
function formatDisplay(value) {
    if (value === 'Error' || value === 'Infinity') return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Handle very large/small numbers
    const absNum = Math.abs(num);
    if (absNum > 1e4 || (absNum > 0 && absNum < 1e-6)) {
        return num.toExponential(2);
    }
    
    // Limit decimal places
    const strValue = num.toString();
    if (strValue.includes('.')) {
        const [integer, decimal] = strValue.split('.');
        if (decimal.length > 8) {
            return num.toFixed(8).replace(/\.?0+$/, '');
        }
    }
    
    return strValue;
}

// Get operator symbol for display
function getOperatorSymbol(operation) {
    const symbols = {
        '+': '+',
        '-': '-',
        '×': '×',
        '/': '÷',
        '%': '%'
    };
    return symbols[operation] || operation;
}

// Setup event listeners
function setupEventListeners() {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonClass = button.classList[0];
            const buttonText = button.textContent;
            
            if (calculator.errorState && buttonClass !== 'clear') {
                clearCalculator();
            }
            
            switch(buttonClass) {
                case 'number':
                    inputNumber(buttonText);
                    break;
                case 'operator':
                    inputOperator(buttonText);
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'clear':
                    if (buttonText === 'clr') {
                        clearCalculator();
                    } else if (buttonText === 'DEL') {
                        deleteLastDigit();
                    }
                    break;
                case 'equals':
                    calculate();
                    break;
            }
            
            // Button animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// Setup keyboard support
function setupKeyboardSupport() {
    document.addEventListener('keydown', event => {
        if (event.key >= '0' && event.key <= '9') {
            inputNumber(event.key);
        } else if (event.key === '.') {
            inputDecimal();
        } else if (event.key === '+' || event.key === '-') {
            inputOperator(event.key);
        } else if (event.key === '*') {
            inputOperator('×');
        } else if (event.key === '/') {
            event.preventDefault();
            inputOperator('/');
        } else if (event.key === 'Enter' || event.key === '=') {
            event.preventDefault();
            calculate();
        } else if (event.key === 'Escape') {
            clearCalculator();
        } else if (event.key === 'Backspace') {
            deleteLastDigit();
        } else if (event.key === '%') {
            inputOperator('%');
        }
    });
}

// Input number
function inputNumber(number) {
    if (calculator.errorState) {
        clearCalculator();
        return;
    }
    
    if (calculator.waitingForNewValue || calculator.displayValue === '0') {
        calculator.displayValue = number;
        calculator.waitingForNewValue = false;
    } else {
        // Limit input length
        if (calculator.displayValue.replace('.', '').length < 15) {
            calculator.displayValue += number;
        }
    }
    updateDisplay();
}

// Input operator with BODMAS logic
function inputOperator(op) {
    if (calculator.errorState) return;
    
    const currentValue = parseFloat(calculator.displayValue);
    
    if (op === '%') {
        // Handle percentage
        if (calculator.expression.length > 0) {
            // In context: 100 + 50% = 150
            const lastNumber = calculator.expression[calculator.expression.length - 1];
            if (typeof lastNumber === 'number') {
                const percentValue = lastNumber * (currentValue / 100);
                calculator.displayValue = percentValue.toString();
                calculator.expression[calculator.expression.length - 1] = percentValue;
            }
        } else {
            // Standalone: 50% = 0.5
            calculator.displayValue = (currentValue / 100).toString();
        }
        updateDisplay();
        return;
    }
    
    // Add current value to expression
    if (!calculator.waitingForNewValue) {
        calculator.expression.push(currentValue);
    }
    
    // Handle operator precedence
    if (calculator.expression.length >= 3) {
        const lastOp = calculator.expression[calculator.expression.length - 2];
        if (PRECEDENCE[op] <= PRECEDENCE[lastOp]) {
            // Calculate higher precedence operations first
            const result = evaluateExpression(calculator.expression);
            calculator.expression = [result];
            calculator.displayValue = result.toString();
        }
    }
    
    // Add operator to expression
    calculator.expression.push(op);
    calculator.waitingForNewValue = true;
    calculator.operation = op;
    
    updateDisplay();
}

// Input decimal
function inputDecimal() {
    if (calculator.errorState) return;
    
    if (calculator.waitingForNewValue) {
        calculator.displayValue = '0.';
        calculator.waitingForNewValue = false;
    } else if (!calculator.displayValue.includes('.')) {
        calculator.displayValue += '.';
    }
    updateDisplay();
}

// Clear calculator
function clearCalculator() {
    calculator.displayValue = '0';
    calculator.previousValue = null;
    calculator.operation = null;
    calculator.waitingForNewValue = false;
    calculator.errorState = false;
    calculator.expression = [];
    updateDisplay();
    console.log('🧹 Calculator cleared');
}

// Delete last digit
function deleteLastDigit() {
    if (calculator.errorState) return;
    
    if (calculator.displayValue.length > 1) {
        calculator.displayValue = calculator.displayValue.slice(0, -1);
    } else {
        calculator.displayValue = '0';
    }
    updateDisplay();
}

// Evaluate expression with BODMAS
function evaluateExpression(expression) {
    if (expression.length === 0) return 0;
    
    // Convert to Reverse Polish Notation (RPN) for BODMAS
    const output = [];
    const operators = [];
    
    for (const token of expression) {
        if (typeof token === 'number') {
            output.push(token);
        } else if (token in PRECEDENCE) {
            while (operators.length > 0 && 
                   PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[token]) {
                output.push(operators.pop());
            }
            operators.push(token);
        }
    }
    
    while (operators.length > 0) {
        output.push(operators.pop());
    }
    
    // Evaluate RPN
    const stack = [];
    for (const token of output) {
        if (typeof token === 'number') {
            stack.push(token);
        } else {
            const b = stack.pop();
            const a = stack.pop();
            
            switch(token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '×':
                    stack.push(a * b);
                    break;
                case '/':
                    if (b === 0) throw new Error('Division by zero');
                    stack.push(a / b);
                    break;
            }
        }
    }
    
    return stack[0] || 0;
}

// Calculate final result with BODMAS
function calculate() {
    if (calculator.errorState || calculator.expression.length === 0) {
        return;
    }
    
    console.time('calculationTime');
    const startTime = performance.now();
    
    try {
        // Add current value to expression if not already added
        if (!calculator.waitingForNewValue) {
            const currentValue = parseFloat(calculator.displayValue);
            calculator.expression.push(currentValue);
        }
        
        // Evaluate entire expression with BODMAS
        const result = evaluateExpression(calculator.expression);
        
        if (!isFinite(result)) {
            throw new Error('Number overflow');
        }
        
        // Round to avoid floating point errors
        const roundedResult = Math.round(result * 100000000) / 100000000;
        
        calculator.displayValue = roundedResult.toString();
        calculator.previousValue = null;
        calculator.operation = null;
        calculator.waitingForNewValue = true;
        calculator.expression = [roundedResult]; // Keep result for further operations
        
        calculator.lastCalculationTime = performance.now() - startTime;
        console.timeEnd('calculationTime');
        console.log(`🧮 Calculation completed in ${calculator.lastCalculationTime.toFixed(2)}ms`);
        
    } catch (error) {
        calculator.displayValue = 'Error';
        calculator.errorState = true;
        calculator.expression = [];
        console.warn(`⚠️ Calculation error: ${error.message}`);
    }
    
    updateDisplay();
}

// Memory function
function handleMemoryFunction() {
    const currentValue = parseFloat(calculator.displayValue);
    if (!isNaN(currentValue)) {
        calculator.memory = currentValue;
        saveToStorage();
        console.log(`💾 Memory stored: ${calculator.memory}`);
        currentOperand.textContent = `M = ${formatDisplay(calculator.memory.toString())}`;
        setTimeout(() => updateDisplay(), 1500);
    }
}

// Setup test functions
function setupTestFunctions() {
    window.runCalculatorTests = function() {
        console.group('🧪 Calculator Test Suite (BODMAS)');
        
        const tests = [
            { 
                name: 'Basic Addition', 
                test: () => {
                    clearCalculator();
                    inputNumber('5');
                    inputOperator('+');
                    inputNumber('3');
                    calculate();
                    return calculator.displayValue === '8';
                }
            },
            { 
                name: 'BODMAS: 2 + 3 × 4 = 14', 
                test: () => {
                    clearCalculator();
                    inputNumber('2');
                    inputOperator('+');
                    inputNumber('3');
                    inputOperator('×');
                    inputNumber('4');
                    calculate();
                    return calculator.displayValue === '14'; // Not 20!
                }
            },
            { 
                name: 'Division by Zero', 
                test: () => {
                    clearCalculator();
                    inputNumber('5');
                    inputOperator('/');
                    inputNumber('0');
                    calculate();
                    return calculator.displayValue === 'Error';
                }
            },
            { 
                name: 'Complex BODMAS: 10 - 2 × 3 + 4', 
                test: () => {
                    clearCalculator();
                    inputNumber('1');
                    inputNumber('0');
                    inputOperator('-');
                    inputNumber('2');
                    inputOperator('×');
                    inputNumber('3');
                    inputOperator('+');
                    inputNumber('4');
                    calculate();
                    // 10 - (2×3) + 4 = 10 - 6 + 4 = 8
                    return calculator.displayValue === '8';
                }
            },
            { 
                name: 'Percentage in context', 
                test: () => {
                    clearCalculator();
                    inputNumber('1');
                    inputNumber('0');
                    inputNumber('0');
                    inputOperator('+');
                    inputNumber('5');
                    inputNumber('0');
                    inputOperator('%');
                    calculate();
                    // 100 + 50% of 100 = 150
                    return calculator.displayValue === '150';
                }
            }
        ];
        
        let passed = 0;
        let failed = 0;
        
        tests.forEach((test, index) => {
            try {
                const result = test.test();
                if (result) {
                    console.log(`✅ ${index + 1}. ${test.name}`);
                    passed++;
                } else {
                    console.log(`❌ ${index + 1}. ${test.name} - Got ${calculator.displayValue}`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ${index + 1}. ${test.name} - Error: ${error.message}`);
                failed++;
            }
        });
        
        console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
        console.groupEnd();
        
        return { passed, failed, total: tests.length };
    };
    
    window.showCalculatorState = function() {
        console.group('📊 Calculator State');
        console.table({
            'Display Value': calculator.displayValue,
            'Expression': calculator.expression.join(' '),
            'Operation': calculator.operation,
            'Waiting for Input': calculator.waitingForNewValue,
            'Error State': calculator.errorState,
            'Memory': calculator.memory,
            'Last Calc Time': calculator.lastCalculationTime.toFixed(2) + 'ms'
        });
        console.groupEnd();
    };
    
    window.clearCalculatorMemory = function() {
        calculator.memory = 0;
        saveToStorage();
        console.log('💾 Memory cleared');
    };
    
    console.log('🔧 Test functions available:');
    console.log('- runCalculatorTests(): Run BODMAS tests');
    console.log('- showCalculatorState(): Show current state');
    console.log('- clearCalculatorMemory(): Clear memory');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);