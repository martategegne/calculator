/**
 * Enhanced Calculator - Without Theme Switching
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
    // theme: 'light', // DISABLED: Theme feature
    lastCalculationTime: 0
};

// DOM Elements
const currentOperand = document.querySelector('.current-operand');
const previousOperand = document.querySelector('.previous-operand');
const buttons = document.querySelectorAll('button');

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
        
        // DISABLED: Theme toggle button
        // createThemeToggle();
        
        // Setup keyboard support
        setupKeyboardSupport();
        
        // Setup test functions in console
        setupTestFunctions();
        
        console.log('✅ Calculator ready with memory functions');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
}     
/*   new local storage function

*/
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

// Load data from localStorage with fallback
function loadFromStorage() {
    if (!isLocalStorageAvailable()) {
        console.warn('⚠️ localStorage not available - using session memory only');
        calculator.memory = 0;
        return;
    }
    
    try {
        const savedMemory = localStorage.getItem('calculator_memory');
        
        if (savedMemory) {
            calculator.memory = parseFloat(savedMemory);
            console.log('📂 Loaded memory from localStorage:', calculator.memory);
        } else {
            calculator.memory = 0;
        }
        
    } catch (error) {
        console.warn('⚠️ Error loading from localStorage:', error);
        calculator.memory = 0;
    }
}

//save it to the local storage
// saveToStorage() 
function saveToStorage() {
    if (!isLocalStorageAvailable()) return;
    
    try {
        localStorage.setItem('calculator_memory', calculator.memory.toString());
        console.log('💾 Saved memory:', calculator.memory);
    } catch (error) {
        console.warn('⚠️ Error saving to localStorage:', error);
    }
}

// Update display
function updateDisplay() {
    currentOperand.textContent = calculator.displayValue;
    previousOperand.textContent = calculator.previousValue 
        ? `${calculator.previousValue} ${getOperatorSymbol(calculator.operation)}` 
        : '';
    
    // Add animation
    currentOperand.style.animation = 'none';
    setTimeout(() => {
        currentOperand.style.animation = 'pulse 0.3s';
    }, 10);
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
    return symbols[operation] || '';
}

// DISABLED: Theme functions
/*
function createThemeToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.innerHTML = calculator.theme === 'light' ? '🌙' : '☀️';
    toggleBtn.title = 'Toggle theme';
    toggleBtn.setAttribute('aria-label', 'Toggle theme');
    
    toggleBtn.addEventListener('click', toggleTheme);
    
    document.querySelector('.calculator').appendChild(toggleBtn);
}

function toggleTheme() {
    calculator.theme = calculator.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', calculator.theme === 'dark');
    
    // Update theme button icon
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = calculator.theme === 'light' ? '🌙' : '☀️';
    }
    
    saveToStorage();
    
    console.log(`🎨 Theme changed to: ${calculator.theme}`);
}
*/

// Setup event listeners
function setupEventListeners() {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonClass = button.classList[0];
            
            if (calculator.errorState && buttonClass !== 'clear') {
                clearCalculator();
            }
            
            switch(buttonClass) {
                case 'number':
                    inputNumber(button.textContent);
                    break;
                case 'operator':
                    inputOperator(button.textContent);
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'clear':
                    if (button.textContent === 'clr') {
                        clearCalculator();
                    } else if (button.textContent === 'DEL') {
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
        } else if (event.key === 'm' || event.key === 'M') {
            handleMemoryFunction();
        }
    });
}

// Input number
function inputNumber(number) {
    if (calculator.waitingForNewValue) {
        calculator.displayValue = number;
        calculator.waitingForNewValue = false;
    } else {
        calculator.displayValue = calculator.displayValue === '0' 
            ? number 
            : calculator.displayValue + number;
    }
    
    calculator.errorState = false;
    updateDisplay();
}

// Input operator
function inputOperator(op) {
    if (calculator.errorState) return;
    
    const inputValue = parseFloat(calculator.displayValue);
    
    if (op === '%') {
    if (calculator.operation && calculator.previousValue !== null) {
        // For operations like: 100 + 50%
        const percentValue = calculator.previousValue * (inputValue / 100);
        calculator.displayValue = percentValue.toString();
    } else {
        // Standalone percentage: 50% → 0.5
        calculator.displayValue = (inputValue / 100).toString();
    }
    updateDisplay();
    return;
}g
    
    if (calculator.previousValue === null) {
        calculator.previousValue = inputValue;
    } else if (calculator.operation) {
        const result = performCalculation();
        calculator.displayValue = String(result);
        calculator.previousValue = result;
    }
    
    calculator.waitingForNewValue = true;
    calculator.operation = op;
    updateDisplay();
}

// Input decimal
function inputDecimal() {
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

// Perform calculation
function calculate() {
    if (calculator.errorState || calculator.operation === null || calculator.previousValue === null) {
        return;
    }
    
    console.time('calculationTime');
    const startTime = performance.now();
    
    const currentValue = parseFloat(calculator.displayValue);
    let result;
    
    try {
        switch(calculator.operation) {
            case '+':
                result = calculator.previousValue + currentValue;
                break;
            case '-':
                result = calculator.previousValue - currentValue;
                break;
            case '×':
                result = calculator.previousValue * currentValue;
                break;
            case '/':
                if (currentValue === 0) {
                    throw new Error('Division by zero');
                }
                result = calculator.previousValue / currentValue;
                break;
            default:
                return;
        }
        
        if (!isFinite(result)) {
            throw new Error('Number overflow');
        }
        
        result = Math.round(result * 100000000) / 100000000;
        
        calculator.displayValue = String(result);
        calculator.previousValue = null;
        calculator.operation = null;
        calculator.waitingForNewValue = true;
        
        console.timeEnd('calculationTime');
        calculator.lastCalculationTime = performance.now() - startTime;
        
        console.log(`🧮 Calculation completed in ${calculator.lastCalculationTime.toFixed(2)}ms`);
        
    } catch (error) {
        calculator.displayValue = 'Error';
        calculator.errorState = true;
        console.warn(`⚠️ Calculation error: ${error.message}`);
    }
    
    updateDisplay();
}

// Perform individual calculation
function performCalculation() {
    const currentValue = parseFloat(calculator.displayValue);
    
    switch(calculator.operation) {
        case '+':
            return calculator.previousValue + currentValue;
        case '-':
            return calculator.previousValue - currentValue;
        case '×':
            return calculator.previousValue * currentValue;
        case '/':
            if (currentValue === 0) {
                throw new Error('Division by zero');
            }
            return calculator.previousValue / currentValue;
        default:
            return currentValue;
    }
}

// Memory function
function handleMemoryFunction() {
    const currentValue = parseFloat(calculator.displayValue);
    calculator.memory = currentValue;
    saveToStorage();
    
    console.log(`💾 Memory stored: ${calculator.memory}`);
    currentOperand.textContent = `M = ${calculator.memory}`;
    setTimeout(() => updateDisplay(), 1000);
}

// Setup test functions in console
function setupTestFunctions() {
    window.runCalculatorTests = function() {
        console.group('🧪 Calculator Test Suite');
        
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
                name: 'Percentage', 
                test: () => {
                    clearCalculator();
                    inputNumber('50');
                    inputOperator('%');
                    return calculator.displayValue === '0.5';
                }
            },
            { 
                name: 'Clear Function', 
                test: () => {
                    clearCalculator();
                    return calculator.displayValue === '0';
                }
            },
            { 
                name: 'Memory Function', 
                test: () => {
                    clearCalculator();
                    inputNumber('42');
                    handleMemoryFunction();
                    return calculator.memory === 42;
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
                    console.log(`❌ ${index + 1}. ${test.name} - Failed`);
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
            'Previous Value': calculator.previousValue,
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
    console.log('- runCalculatorTests(): Run all tests');
    console.log('- showCalculatorState(): Show current state');
    console.log('- clearCalculatorMemory(): Clear memory');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);