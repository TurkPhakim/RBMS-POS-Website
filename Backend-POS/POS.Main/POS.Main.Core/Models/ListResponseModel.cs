using POS.Main.Core.Constants;

namespace POS.Main.Core.Models;

public class ListResponseModel<T>
{
    public string Status { get; set; } = constResultType.Fail;

    public List<T> Results { get; set; } = new();

    public int TotalItems => Results.Count;

    public string? Message { get; set; }
}
