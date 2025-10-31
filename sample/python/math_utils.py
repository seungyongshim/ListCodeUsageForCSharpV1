# math_utils.py - 기본 수학 유틸리티 함수들

def add(a, b):
    """두 숫자를 더합니다"""
    return a + b


def multiply(a, b):
    """두 숫자를 곱합니다"""
    return a * b


def sum_list(numbers):
    """배열의 합계를 계산합니다"""
    total = 0
    for n in numbers:
        total = add(total, n)  # add 함수 사용
    return total
