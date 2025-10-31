using System;
using Newtonsoft.Json;

namespace ListCodeUsagesSample
{
    /// <summary>
    /// 외부 라이브러리(Newtonsoft.Json) 사용 테스트
    /// </summary>
    public class JsonHelper
    {
        // JsonConvert.SerializeObject 사용
        public static string Serialize(object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }

        // JsonConvert.DeserializeObject 사용
        public static T Deserialize<T>(string json)
        {
            return JsonConvert.DeserializeObject<T>(json);
        }

        // 다시 JsonConvert 사용
        public static string PrettyPrint(object obj)
        {
            return JsonConvert.SerializeObject(obj, Formatting.Indented);
        }
    }
}
