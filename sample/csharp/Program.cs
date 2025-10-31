using System;

namespace ListCodeUsagesSample
{
    /// <summary>
    /// 메인 프로그램
    /// </summary>
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== List Code Usages Sample (C#) ===");

            // MathUtils.Add 직접 사용
            Console.WriteLine($"Direct Add usage: {MathUtils.Add(5, 3)}");

            // MathUtils.Sum 사용 (내부적으로 Add 사용)
            int[] numbers = { 1, 2, 3, 4, 5 };
            Console.WriteLine($"Sum of array: {MathUtils.Sum(numbers)}");

            // Calculator 클래스 사용
            var calc = new Calculator();
            Console.WriteLine($"Calculator Add: {calc.AddNumbers(10, 20)}");
            Console.WriteLine($"Calculator Multiply: {calc.MultiplyNumbers(4, 5)}");
            Console.WriteLine($"Calculator Increment: {calc.Increment(3)}");

            // 또 다른 Add 사용
            int result = MathUtils.Add(100, 200);
            Console.WriteLine($"Another Add usage: {result}");

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }
}
