using System;

namespace ListCodeUsagesSample
{
    /// <summary>
    /// 계산기 인터페이스
    /// </summary>
    public interface ICalculator
    {
        int Result { get; }
        int AddNumbers(int a, int b);
        int MultiplyNumbers(int a, int b);
        void Reset();
    }

    /// <summary>
    /// 고급 계산기 인터페이스
    /// </summary>
    public interface IAdvancedCalculator : ICalculator
    {
        int Power(int baseNum, int exponent);
    }
}
