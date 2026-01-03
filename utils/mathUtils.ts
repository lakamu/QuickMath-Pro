
import { Question } from '../types';

export const generateQuestion = (score: number): Question => {
  const level = Math.floor(score / 5) + 1;
  let num1: number, num2: number, operator: string;

  if (level === 1) {
    // Basic addition
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    operator = '+';
  } else if (level === 2) {
    // Addition & Subtraction
    num1 = Math.floor(Math.random() * 20) + 5;
    num2 = Math.floor(Math.random() * 15) + 1;
    operator = Math.random() > 0.5 ? '+' : '-';
    if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
  } else if (level === 3) {
    // Multiplication intro
    num1 = Math.floor(Math.random() * 10) + 2;
    num2 = Math.floor(Math.random() * 5) + 1;
    operator = '×';
  } else if (level < 6) {
    // Mixed basic operations
    const ops = ['+', '-', '×'];
    operator = ops[Math.floor(Math.random() * ops.length)];
    num1 = Math.floor(Math.random() * (10 * level)) + level;
    num2 = Math.floor(Math.random() * (5 * level)) + 1;
    if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
  } else {
    // Hard mode
    const ops = ['+', '-', '×'];
    operator = ops[Math.floor(Math.random() * ops.length)];
    num1 = Math.floor(Math.random() * 50) + 10;
    num2 = Math.floor(Math.random() * 12) + 2;
    if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
  }

  let answer: number;
  let displayOp = operator;
  switch (operator) {
    case '+': answer = num1 + num2; break;
    case '-': answer = num1 - num2; break;
    case '×': answer = num1 * num2; break;
    default: answer = num1 + num2;
  }

  return {
    text: `${num1} ${displayOp} ${num2}`,
    answer,
    difficulty: level
  };
};
