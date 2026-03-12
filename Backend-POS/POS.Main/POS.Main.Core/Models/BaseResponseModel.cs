using POS.Main.Core.Constants;

namespace POS.Main.Core.Models;

public class BaseResponseModel<T>
{
    public string Status { get; set; } = constResultType.Fail;

    public T? Result { get; set; }

    public string? Message { get; set; }

    public string? Code { get; set; }

    public Dictionary<string, string[]>? Errors { get; set; }
}
