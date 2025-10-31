# external_lib_helper.py - 외부 라이브러리 사용 테스트

import numpy as np
from datetime import datetime, timedelta


def process_array(arr):
    """numpy 배열 처리"""
    return np.array(arr) * 2


def calculate_mean(arr):
    """numpy mean 사용"""
    return np.mean(arr)


def calculate_sum(arr):
    """numpy sum 사용"""
    return np.sum(arr)


def add_days(date, days):
    """timedelta 사용"""
    return date + timedelta(days=days)


def format_date(date):
    """날짜 포맷팅"""
    return date.strftime('%Y-%m-%d')


def process_data(data):
    """여러 numpy 함수를 함께 사용"""
    arr = np.array(data)
    mean_val = np.mean(arr)
    sum_val = np.sum(arr)
    return {'mean': mean_val, 'sum': sum_val}
