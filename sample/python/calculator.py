# calculator.py - Calculator 클래스

from math_utils import add, multiply


class Calculator:
    """계산기 클래스"""
    
    def __init__(self):
        self.result = 0
    
    def add_numbers(self, a, b):
        """add 함수 사용"""
        self.result = add(a, b)
        return self.result
    
    def multiply_numbers(self, a, b):
        """multiply 함수 사용"""
        self.result = multiply(a, b)
        return self.result
    
    def increment(self, value=1):
        """내부적으로 add 사용"""
        self.result = add(self.result, value)
        return self.result
    
    def get_result(self):
        return self.result
    
    def reset(self):
        self.result = 0
