// calculator.js - Calculator 클래스

const { add, multiply } = require('./mathUtils');

/**
 * 계산기 클래스
 */
class Calculator {
    constructor() {
        this.result = 0;
    }

    // add 함수 사용
    addNumbers(a, b) {
        this.result = add(a, b);
        return this.result;
    }

    // multiply 함수 사용
    multiplyNumbers(a, b) {
        this.result = multiply(a, b);
        return this.result;
    }

    // 내부적으로 add 사용
    increment(value = 1) {
        this.result = add(this.result, value);
        return this.result;
    }

    getResult() {
        return this.result;
    }

    reset() {
        this.result = 0;
    }
}

module.exports = Calculator;
