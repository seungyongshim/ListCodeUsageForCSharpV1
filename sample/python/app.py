# app.py - 메인 애플리케이션

from calculator import Calculator
from math_utils import add, sum_list
from external_lib_helper import process_array, calculate_mean, format_date
from datetime import datetime
import numpy as np

print('=== List Code Usages Sample (Python) ===\n')

# add 함수 직접 사용
print(f'Direct add usage: {add(5, 3)}')

# sum_list 함수 사용 (내부적으로 add 사용)
numbers = [1, 2, 3, 4, 5]
print(f'Sum of array: {sum_list(numbers)}')

# Calculator 클래스 사용
calc = Calculator()
print(f'Calculator add: {calc.add_numbers(10, 20)}')
print(f'Calculator multiply: {calc.multiply_numbers(4, 5)}')
print(f'Calculator increment: {calc.increment(3)}')

# 또 다른 add 사용
result = add(100, 200)
print(f'Another add usage: {result}')

print('\n=== External Library Tests ===\n')

# external_lib_helper를 통한 numpy 사용
print(f'Process array: {process_array([1, 2, 3, 4])}')
print(f'Calculate mean: {calculate_mean([1, 2, 3, 4, 5, 6])}')
print(f'Format date: {format_date(datetime.now())}')

# 직접 numpy 사용
arr = np.array([1, 2, 3, 4, 5])
print(f'Numpy mean: {np.mean(arr)}')
print(f'Numpy sum: {np.sum(arr)}')
