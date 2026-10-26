const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "x":
      return multiply(a, b);
    case "÷":
      return divide(a, b);
  }
}

class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "";
    this.previousOperand = "";
    this.operation = undefined;
    this.justComputed = false;
  }

  delete() {
    if (this.justComputed) {
      this.clear();
      return;
    }
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (this.justComputed) {
      this.currentOperand = "";
      this.justComputed = false;
    }
    const current = this.currentOperand.toString();
    if (number === "." && current.includes(".")) return;
    this.currentOperand = current + number;
  }

  chooseOperation(operation) {
    // Consecutive operators: just swap the operator, don't evaluate
    if (this.currentOperand === "" && this.previousOperand !== "") {
      this.operation = operation;
      return;
    }
    if (isNaN(parseFloat(this.currentOperand))) return;
    if (this.previousOperand !== "") {
      this.compute();
      if (isNaN(parseFloat(this.currentOperand))) return; // divide-by-zero message
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
    this.justComputed = false;
  }

  compute() {
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current) || !this.operation) return;

    if (this.operation === "÷" && current === 0) {
      this.clear();
      this.currentOperand = "Nice try. Can't divide by 0 😏";
      this.justComputed = true;
      return;
    }

    const result = operate(this.operation, prev, current);
    this.currentOperand = parseFloat(result.toFixed(8)); // round long decimals
    this.operation = undefined;
    this.previousOperand = "";
    this.justComputed = true;
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    if (isNaN(Number(stringNumber))) return stringNumber; // error message
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand,
    );
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }
  }
}

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const equalsButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const allClearButton = document.querySelector("[data-all-clear]");
const previousOperandTextElement = document.querySelector(
  "[data-previous-operand]",
);
const currentOperandTextElement = document.querySelector(
  "[data-current-operand]",
);

const calculator = new Calculator(
  previousOperandTextElement,
  currentOperandTextElement,
);

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener("click", () => {
  calculator.compute();
  calculator.updateDisplay();
});

allClearButton.addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (/^[0-9.]$/.test(e.key)) {
    calculator.appendNumber(e.key);
  } else if (e.key === "+" || e.key === "-") {
    calculator.chooseOperation(e.key);
  } else if (e.key === "*" || e.key.toLowerCase() === "x") {
    calculator.chooseOperation("x");
  } else if (e.key === "/") {
    e.preventDefault(); // stops Firefox's quick-find
    calculator.chooseOperation("÷");
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault(); // stops Enter from re-clicking a focused button
    calculator.compute();
  } else if (e.key === "Backspace") {
    calculator.delete();
  } else if (e.key === "Escape") {
    calculator.clear();
  } else {
    return;
  }
  calculator.updateDisplay();
});
