using POS.Main.Core.Constants;

namespace POS.Main.Core.Models;

public class PaginationResult<T>
{
    public string Status { get; set; } = constResultType.Fail;

    public List<T> Results { get; set; } = new();

    public int Page { get; set; }

    public int Total { get; set; }

    public int ItemPerPage { get; set; }

    public string? Message { get; set; }
}
