using System;

namespace ListCodeUsagesSample
{
    /// <summary>
    /// 기본 수학 유틸리티 클래스
    /// </summary>
    public static class MathUtils
    {
        /// <summary>
        /// 두 숫자를 더합니다
        /// </summary>
        public static int Add(int a, int b)
        {
            return a + b;
        }

        /// <summary>
        /// 두 숫자를 곱합니다
        /// </summary>
        public static int Multiply(int a, int b)
        {
            return a * b;
        }

        /// <summary>
        /// 배열의 합계를 계산합니다
        /// </summary>
        public static int Sum(int[] numbers)
        {
            int total = 0;
            foreach (var n in numbers)
            {
                total = Add(total, n); // Add 메서드 사용
            }
            return total;
        }
    }
}
