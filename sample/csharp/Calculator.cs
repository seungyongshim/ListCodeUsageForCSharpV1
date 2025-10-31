using System;

namespace ListCodeUsagesSample
{
    /// <summary>
    /// 계산기 클래스
    /// </summary>
    public class Calculator
    {
        public int Result { get; private set; }

        public Calculator()
        {
            Result = 0;
        }

        // MathUtils.Add 사용
        public int AddNumbers(int a, int b)
        {
            Result = MathUtils.Add(a, b);
            return Result;
        }

        // MathUtils.Multiply 사용
        public int MultiplyNumbers(int a, int b)
        {
            Result = MathUtils.Multiply(a, b);
            return Result;
        }

        // 내부적으로 Add 사용
        public int Increment(int value = 1)
        {
            Result = MathUtils.Add(Result, value);
            return Result;
        }

        public void Reset()
        {
            Result = 0;
        }
    }
}
