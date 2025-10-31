// mathUtils.js - 기본 수학 유틸리티 함수들

/**
 * 두 숫자를 더합니다
 */
function add(a, b) {
    return a + b;
}

/**
 * 두 숫자를 곱합니다
 */
function multiply(a, b) {
    return a * b;
}

/**
 * 배열의 합계를 계산합니다
 */
function sum(numbers) {
    return numbers.reduce((acc, n) => add(acc, n), 0);
}

module.exports = {
    add,
    multiply,
    sum
};
