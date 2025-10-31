// app.js - 메인 애플리케이션

const Calculator = require('./calculator');
const { add, sum } = require('./mathUtils');
const { processArray, filterEvenNumbers, formatDate } = require('./externalLibHelper');
const _ = require('lodash');

console.log('=== List Code Usages Sample (Node.js) ===\n');

// add 함수 직접 사용
console.log('Direct add usage:', add(5, 3));

// sum 함수 사용 (내부적으로 add 사용)
const numbers = [1, 2, 3, 4, 5];
console.log('Sum of array:', sum(numbers));

// Calculator 클래스 사용
const calc = new Calculator();
console.log('Calculator add:', calc.addNumbers(10, 20));
console.log('Calculator multiply:', calc.multiplyNumbers(4, 5));
console.log('Calculator increment:', calc.increment(3));

// 또 다른 add 사용
const result = add(100, 200);
console.log('Another add usage:', result);

console.log('\n=== External Library Tests ===\n');

// externalLibHelper를 통한 lodash 사용
console.log('Process array:', processArray([1, 2, 3, 4]));
console.log('Filter even:', filterEvenNumbers([1, 2, 3, 4, 5, 6]));
console.log('Format date:', formatDate(new Date()));

// 직접 lodash 사용
console.log('Lodash chunk:', _.chunk([1, 2, 3, 4, 5, 6], 2));
console.log('Lodash reverse:', _.reverse([1, 2, 3, 4, 5]));
