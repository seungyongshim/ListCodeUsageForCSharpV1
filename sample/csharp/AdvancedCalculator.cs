using System;

namespace ListCodeUsagesSample
{
    /// <summary>
    /// 고급 계산기 클래스
    /// </summary>
    public class AdvancedCalculator : Calculator, IAdvancedCalculator
    {
        public int Power(int baseNum, int exponent)
        {
            int result = 1;
            for (int i = 0; i < exponent; i++)
            {
                result = MathUtils.Multiply(result, baseNum);
            }
            Result = result;
            return Result;
        }

        // Calculator의 메서드를 오버라이드
        public new int AddNumbers(int a, int b)
        {
            Console.WriteLine("AdvancedCalculator: Adding numbers");
            return base.AddNumbers(a, b);
        }
    }
}
