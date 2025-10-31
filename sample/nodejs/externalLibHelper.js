// externalLibHelper.js - 외부 라이브러리 사용 테스트

const _ = require('lodash');
const moment = require('moment');

/**
 * lodash의 _.map 사용
 */
function processArray(arr) {
    return _.map(arr, item => item * 2);
}

/**
 * lodash의 _.filter 사용
 */
function filterEvenNumbers(arr) {
    return _.filter(arr, num => num % 2 === 0);
}

/**
 * lodash의 _.sum 사용
 */
function calculateSum(arr) {
    return _.sum(arr);
}

/**
 * moment.js 사용 - 날짜 포맷팅
 */
function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
}

/**
 * moment.js 사용 - 날짜 계산
 */
function addDays(date, days) {
    return moment(date).add(days, 'days').toDate();
}

/**
 * 여러 lodash 함수를 함께 사용
 */
function processData(data) {
    const filtered = _.filter(data, item => item.active);
    const mapped = _.map(filtered, item => item.value);
    return _.sum(mapped);
}

module.exports = {
    processArray,
    filterEvenNumbers,
    calculateSum,
    formatDate,
    addDays,
    processData
};
